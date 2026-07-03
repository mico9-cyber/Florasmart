import dayjs from 'dayjs';
import { AppError } from '../utils/appError.js';
import { getPrismaClient } from '../database/prisma.js';
import { logAuditEvent } from '../utils/audit.js';
import * as subRepo from '../repositories/subscription.repository.js';
import { NotificationService } from './notification.service.js';

export class SubscriptionService {
  async getPlans() {
    return subRepo.findActivePlans();
  }

  async subscribe(userId, planId, autoRenew = true) {
    const plan = await subRepo.findPlanById(planId);
    if (!plan || !plan.active || plan.deletedAt) {
      throw new AppError('Subscription plan not found', 404, 'PLAN_NOT_FOUND');
    }

    const existing = await subRepo.findActiveUserSubscription(userId);
    if (existing) {
      throw new AppError('You already have an active subscription. Cancel it first to subscribe to a new plan.', 400, 'ACTIVE_SUBSCRIPTION_EXISTS');
    }

    const now = dayjs();
    let periodEnd;
    switch (plan.billingCycle) {
      case 'MONTHLY':
        periodEnd = now.add(1, 'month');
        break;
      case 'QUARTERLY':
        periodEnd = now.add(3, 'month');
        break;
      case 'YEARLY':
        periodEnd = now.add(1, 'year');
        break;
      default:
        periodEnd = now.add(1, 'month');
    }

    const subscription = await getPrismaClient().$transaction(async (tx) => {
      const sub = await tx.userSubscription.create({
        data: {
          userId,
          planId: plan.id,
          status: 'ACTIVE',
          currentPeriodStart: now.toDate(),
          currentPeriodEnd: periodEnd.toDate(),
          autoRenew,
        },
      });
      return sub;
    });

    await logAuditEvent(getPrismaClient(), { action: 'subscription_started', userId, planId });

    try {
      const notif = new NotificationService();
      notif.sendNotification(userId, 'SUBSCRIPTION', 'Subscription Started', `Your ${plan.name} subscription has started.`, { planId, planName: plan.name, billingCycle: plan.billingCycle, subscriptionId: subscription.id });
    } catch {
    }

    return subscription;
  }

  async getMySubscriptions(userId) {
    return subRepo.findUserSubscriptions(userId);
  }

  async cancelSubscription(userId, subscriptionId, reason) {
    const sub = await subRepo.findUserSubscriptionById(subscriptionId);
    if (!sub) throw new AppError('Subscription not found', 404, 'SUBSCRIPTION_NOT_FOUND');
    if (sub.userId !== userId) throw new AppError('Unauthorized', 403, 'FORBIDDEN');

    if (sub.status === 'CANCELLED' || sub.status === 'EXPIRED') {
      throw new AppError('Subscription is already cancelled or expired', 400, 'ALREADY_CANCELLED');
    }

    const cancelled = await subRepo.cancelUserSubscription(subscriptionId, userId, reason);
    await logAuditEvent(getPrismaClient(), { action: 'subscription_cancelled', userId, subscriptionId, reason });

    try {
      const notif = new NotificationService();
      notif.sendNotification(userId, 'SUBSCRIPTION', 'Subscription Cancelled', `Your ${sub.plan?.name || 'subscription'} has been cancelled.`, { subscriptionId, planName: sub.plan?.name, reason });
    } catch {
    }

    return cancelled;
  }

  async adminCancelSubscription(subscriptionId, reason) {
    const sub = await subRepo.findUserSubscriptionById(subscriptionId);
    if (!sub) throw new AppError('Subscription not found', 404, 'SUBSCRIPTION_NOT_FOUND');
    const cancelled = await subRepo.cancelUserSubscription(subscriptionId, sub.userId, reason);
    await logAuditEvent(getPrismaClient(), { action: 'subscription_admin_cancelled', subscriptionId });
    return cancelled;
  }

  async createPlan(data) {
    const plan = await subRepo.createPlan(data);
    await logAuditEvent(getPrismaClient(), { action: 'subscription_plan_created', planId: plan.id });
    return plan;
  }

  async updatePlan(id, data) {
    const plan = await subRepo.findPlanById(id);
    if (!plan) throw new AppError('Plan not found', 404, 'PLAN_NOT_FOUND');
    const updated = await subRepo.updatePlan(id, data);
    await logAuditEvent(getPrismaClient(), { action: 'subscription_plan_updated', planId: id });
    return updated;
  }

  async deletePlan(id) {
    const plan = await subRepo.findPlanById(id);
    if (!plan) throw new AppError('Plan not found', 404, 'PLAN_NOT_FOUND');
    await subRepo.softDeletePlan(id);
    await logAuditEvent(getPrismaClient(), { action: 'subscription_plan_deleted', planId: id });
  }

  async getAdminPlans(includeInactive) {
    return subRepo.findAllPlans(includeInactive);
  }
}
