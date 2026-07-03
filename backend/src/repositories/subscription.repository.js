import { getPrismaClient } from '../database/prisma.js';

function db() {
  return getPrismaClient();
}

export async function findActivePlans() {
  return db().subscriptionPlan.findMany({
    where: { active: true, deletedAt: null },
    orderBy: { price: 'asc' },
  });
}

export async function findAllPlans(includeInactive = false) {
  const where = includeInactive ? {} : { active: true, deletedAt: null };
  return db().subscriptionPlan.findMany({
    where,
    orderBy: { price: 'asc' },
  });
}

export async function findPlanById(id) {
  return db().subscriptionPlan.findUnique({ where: { id } });
}

export async function createPlan(data) {
  return db().subscriptionPlan.create({ data });
}

export async function updatePlan(id, data) {
  return db().subscriptionPlan.update({ where: { id }, data });
}

export async function softDeletePlan(id) {
  return db().subscriptionPlan.update({
    where: { id },
    data: { active: false, deletedAt: new Date() },
  });
}

export async function findUserSubscriptions(userId) {
  return db().userSubscription.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { plan: { select: { id: true, name: true, price: true, currency: true, billingCycle: true, benefits: true } } },
  });
}

export async function findActiveUserSubscription(userId) {
  return db().userSubscription.findFirst({
    where: { userId, status: 'ACTIVE' },
    include: { plan: true },
  });
}

export async function createUserSubscription(data) {
  return db().userSubscription.create({ data });
}

export async function cancelUserSubscription(id, userId, reason) {
  return db().userSubscription.update({
    where: { id },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date(),
      cancelReason: reason,
      autoRenew: false,
    },
  });
}

export async function findUserSubscriptionById(id) {
  return db().userSubscription.findUnique({
    where: { id },
    include: { plan: true },
  });
}
