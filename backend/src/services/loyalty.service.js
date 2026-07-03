import { AppError } from '../utils/appError.js';
import { getPrismaClient } from '../database/prisma.js';
import { logAuditEvent } from '../utils/audit.js';
import { calculateTier, getPointsToNextTier } from '../utils/loyalty-tier.js';
import { generateCouponCode } from '../utils/coupon.js';
import * as loyaltyRepo from '../repositories/loyalty.repository.js';
import { NotificationService } from './notification.service.js';

export class LoyaltyService {
  async getMyAccount(userId) {
    const account = await loyaltyRepo.getOrCreateAccount(userId);
    await logAuditEvent(getPrismaClient(), { action: 'loyalty_account_viewed', userId });
    return {
      id: account.id,
      pointsBalance: account.pointsBalance,
      lifetimePoints: account.lifetimePoints,
      tier: account.tier,
      pointsToNextTier: getPointsToNextTier(account.lifetimePoints),
    };
  }

  async getMyTransactions(userId, query) {
    const result = await loyaltyRepo.findTransactionsByUserId(userId, query);
    await logAuditEvent(getPrismaClient(), { action: 'loyalty_transactions_viewed', userId });
    return result;
  }

  async getRewards(userId) {
    await logAuditEvent(getPrismaClient(), { action: 'loyalty_rewards_viewed', userId });
    return loyaltyRepo.findActiveRewards();
  }

  async redeemReward(userId, rewardId) {
    const reward = await loyaltyRepo.findRewardById(rewardId);
    if (!reward || !reward.active || reward.deletedAt) {
      throw new AppError('Reward not found or inactive', 404, 'REWARD_NOT_FOUND');
    }
    if (reward.expiresAt && reward.expiresAt < new Date()) {
      throw new AppError('Reward has expired', 400, 'REWARD_EXPIRED');
    }

    const account = await loyaltyRepo.getOrCreateAccount(userId);
    if (account.pointsBalance < reward.pointsCost) {
      throw new AppError('Insufficient points', 400, 'INSUFFICIENT_POINTS');
    }

    const couponCode = generateCouponCode();
    const newBalance = account.pointsBalance - reward.pointsCost;
    const newLifetime = account.lifetimePoints;
    const newTier = calculateTier(newLifetime);

    const result = await getPrismaClient().$transaction(async (tx) => {
      const updatedAccount = await tx.loyaltyAccount.update({
        where: { id: account.id },
        data: { pointsBalance: newBalance, tier: newTier },
      });

      const transaction = await tx.loyaltyTransaction.create({
        data: {
          loyaltyAccountId: account.id,
          userId,
          type: 'REDEEMED',
          points: -reward.pointsCost,
          balanceAfter: newBalance,
          reason: `Redeemed: ${reward.name}`,
          referenceType: 'REWARD',
          referenceId: reward.id,
        },
      });

      const redemption = await tx.rewardRedemption.create({
        data: {
          userId,
          loyaltyAccountId: account.id,
          rewardId: reward.id,
          couponCode,
          status: 'ACTIVE',
        },
      });

      return { redemption, transaction, updatedAccount };
    });

    await logAuditEvent(getPrismaClient(), { action: 'loyalty_points_redeemed', userId, rewardId, points: reward.pointsCost });

    try {
      const notif = new NotificationService();
      notif.sendNotification(userId, 'LOYALTY', 'Reward Redeemed', `You redeemed ${reward.name} for ${reward.pointsCost} points. Coupon: ${result.redemption.couponCode}`, { rewardId, rewardName: reward.name, pointsCost: reward.pointsCost, couponCode: result.redemption.couponCode });
    } catch {
    }

    return result;
  }

  async getMyRedemptions(userId, page, limit) {
    return loyaltyRepo.findRedemptionsByUserId(userId, page, limit);
  }

  async getAdminAccounts(page, limit) {
    await logAuditEvent(getPrismaClient(), { action: 'loyalty_admin_accounts_viewed' });
    return loyaltyRepo.findAllAccounts(page, limit);
  }

  async adjustPoints(adminUserId, targetUserId, points, reason) {
    if (!reason || reason.trim().length === 0) {
      throw new AppError('Reason is required for points adjustment', 400, 'REASON_REQUIRED');
    }

    const account = await loyaltyRepo.getOrCreateAccount(targetUserId);
    const newBalance = account.pointsBalance + points;
    if (newBalance < 0) {
      throw new AppError('Points balance cannot go below 0', 400, 'INSUFFICIENT_BALANCE');
    }

    const newLifetime = points > 0 ? account.lifetimePoints + points : account.lifetimePoints;
    const newTier = calculateTier(newLifetime);

    const result = await getPrismaClient().$transaction(async (tx) => {
      const updated = await tx.loyaltyAccount.update({
        where: { id: account.id },
        data: { pointsBalance: newBalance, lifetimePoints: newLifetime, tier: newTier },
      });

      const transaction = await tx.loyaltyTransaction.create({
        data: {
          loyaltyAccountId: account.id,
          userId: targetUserId,
          type: 'ADJUSTED',
          points,
          balanceAfter: newBalance,
          reason,
          referenceType: 'ADMIN',
          referenceId: adminUserId,
        },
      });

      return { updated, transaction };
    });

    await logAuditEvent(getPrismaClient(), { action: 'loyalty_points_adjusted', adminUserId, targetUserId, points });
    return result;
  }

  async createReward(data) {
    const reward = await loyaltyRepo.createReward(data);
    await logAuditEvent(getPrismaClient(), { action: 'loyalty_reward_created', rewardId: reward.id });
    return reward;
  }

  async updateReward(id, data) {
    const reward = await loyaltyRepo.findRewardById(id);
    if (!reward) throw new AppError('Reward not found', 404, 'REWARD_NOT_FOUND');
    const updated = await loyaltyRepo.updateReward(id, data);
    await logAuditEvent(getPrismaClient(), { action: 'loyalty_reward_updated', rewardId: id });
    return updated;
  }

  async deleteReward(id) {
    const reward = await loyaltyRepo.findRewardById(id);
    if (!reward) throw new AppError('Reward not found', 404, 'REWARD_NOT_FOUND');
    await loyaltyRepo.softDeleteReward(id);
    await logAuditEvent(getPrismaClient(), { action: 'loyalty_reward_deleted', rewardId: id });
  }

  async awardPointsForOrder(orderId) {
    const prisma = getPrismaClient();
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, userId: true, totalAmount: true, status: true },
    });
    if (!order) throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
    if (order.status !== 'DELIVERED') return null;
    if (await loyaltyRepo.hasEarnedPointsForOrder(orderId)) return null;

    const points = Math.floor(Number(order.totalAmount) / 1000);
    if (points <= 0) return null;

    const account = await loyaltyRepo.getOrCreateAccount(order.userId);
    const newBalance = account.pointsBalance + points;
    const newLifetime = account.lifetimePoints + points;
    const newTier = calculateTier(newLifetime);

    const result = await prisma.$transaction(async (tx) => {
      await tx.loyaltyAccount.update({
        where: { id: account.id },
        data: { pointsBalance: newBalance, lifetimePoints: newLifetime, tier: newTier },
      });
      const txResult = await tx.loyaltyTransaction.create({
        data: {
          loyaltyAccountId: account.id,
          userId: order.userId,
          type: 'EARNED',
          points,
          balanceAfter: newBalance,
          reason: `Points from order`,
          referenceType: 'ORDER',
          referenceId: orderId,
        },
      });
      return txResult;
    });

    await logAuditEvent(prisma, { action: 'loyalty_points_earned', userId: order.userId, orderId, points });
    return result;
  }

  async reversePointsForOrder(orderId) {
    const prisma = getPrismaClient();
    const earned = await loyaltyRepo.findPointsEarnedForOrder(orderId);
    if (!earned) return null;

    const account = await loyaltyRepo.findAccountByUserId(earned.userId);
    if (!account) return null;

    const points = earned.points;
    const newBalance = Math.max(0, account.pointsBalance - points);
    const newLifetime = Math.max(0, account.lifetimePoints - points);
    const newTier = calculateTier(newLifetime);

    const result = await prisma.$transaction(async (tx) => {
      await tx.loyaltyAccount.update({
        where: { id: account.id },
        data: { pointsBalance: newBalance, lifetimePoints: newLifetime, tier: newTier },
      });
      const txResult = await tx.loyaltyTransaction.create({
        data: {
          loyaltyAccountId: account.id,
          userId: earned.userId,
          type: 'REVERSED',
          points: -points,
          balanceAfter: newBalance,
          reason: `Points reversed for cancelled/refunded order`,
          referenceType: 'ORDER',
          referenceId: orderId,
        },
      });
      return txResult;
    });

    await logAuditEvent(prisma, { action: 'loyalty_points_reversed', userId: earned.userId, orderId, points });
    return result;
  }

  async getAdminRewards(includeInactive) {
    return loyaltyRepo.findAllRewards(includeInactive);
  }

  async getAdminRedemptions(page, limit) {
    return loyaltyRepo.findAllRedemptions(page, limit);
  }

  async getAdminTransactions(query) {
    const { userId, type, dateFrom, dateTo, page = 1, limit = 20 } = query;
    return loyaltyRepo.findTransactionsByUserId(userId || undefined, {
      type,
      dateFrom,
      dateTo,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  }
}
