import { getPrismaClient } from '../database/prisma.js';

function db() {
  return getPrismaClient();
}

export async function findAccountByUserId(userId) {
  return db().loyaltyAccount.findUnique({
    where: { userId },
  });
}

export async function createAccount(userId) {
  return db().loyaltyAccount.create({
    data: { userId, pointsBalance: 0, lifetimePoints: 0, tier: 'BRONZE' },
  });
}

export async function getOrCreateAccount(userId) {
  let account = await findAccountByUserId(userId);
  if (!account) {
    account = await createAccount(userId);
  }
  return account;
}

export async function updateAccount(id, data) {
  return db().loyaltyAccount.update({
    where: { id },
    data,
  });
}

export async function findTransactionsByUserId(userId, query = {}) {
  const { type, dateFrom, dateTo, page = 1, limit = 20 } = query;
  const where = { userId };
  if (type) where.type = type;
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo);
  }
  const skip = (page - 1) * limit;
  const [transactions, total] = await Promise.all([
    db().loyaltyTransaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    db().loyaltyTransaction.count({ where }),
  ]);
  return { transactions, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function createTransaction(data) {
  return db().loyaltyTransaction.create({ data });
}

export async function findActiveRewards() {
  return db().loyaltyReward.findMany({
    where: {
      active: true,
      deletedAt: null,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    },
    orderBy: { pointsCost: 'asc' },
  });
}

export async function findRewardById(id) {
  return db().loyaltyReward.findUnique({ where: { id } });
}

export async function findAllRewards(includeInactive = false) {
  const where = includeInactive ? {} : { active: true, deletedAt: null };
  return db().loyaltyReward.findMany({
    where,
    orderBy: { pointsCost: 'asc' },
  });
}

export async function createReward(data) {
  return db().loyaltyReward.create({ data });
}

export async function updateReward(id, data) {
  return db().loyaltyReward.update({ where: { id }, data });
}

export async function softDeleteReward(id) {
  return db().loyaltyReward.update({
    where: { id },
    data: { active: false, deletedAt: new Date() },
  });
}

export async function createRedemption(data) {
  return db().rewardRedemption.create({ data });
}

export async function findRedemptionsByUserId(userId, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [redemptions, total] = await Promise.all([
    db().rewardRedemption.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: { reward: { select: { id: true, name: true, pointsCost: true, discountType: true, discountValue: true } } },
    }),
    db().rewardRedemption.count({ where: { userId } }),
  ]);
  return { redemptions, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function findAllRedemptions(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [redemptions, total] = await Promise.all([
    db().rewardRedemption.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        reward: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    }),
    db().rewardRedemption.count(),
  ]);
  return { redemptions, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function findAllAccounts(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [accounts, total] = await Promise.all([
    db().loyaltyAccount.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    }),
    db().loyaltyAccount.count(),
  ]);
  return { accounts, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function hasEarnedPointsForOrder(orderId) {
  const existing = await db().loyaltyTransaction.findFirst({
    where: { referenceType: 'ORDER', referenceId: orderId, type: 'EARNED' },
  });
  return !!existing;
}

export async function findPointsEarnedForOrder(orderId) {
  return db().loyaltyTransaction.findFirst({
    where: { referenceType: 'ORDER', referenceId: orderId, type: 'EARNED' },
  });
}
