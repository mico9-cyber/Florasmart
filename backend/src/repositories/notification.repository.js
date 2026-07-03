import { getPrismaClient } from '../database/prisma.js';

function db() {
  return getPrismaClient();
}

export async function createNotification(data) {
  return db().notification.create({ data });
}

export async function findNotificationsByUserId(userId, query = {}) {
  const { type, status, unreadOnly, page = 1, limit = 20 } = query;
  const where = { userId };
  if (type) where.type = type;
  if (status) where.status = status;
  if (unreadOnly === 'true' || unreadOnly === true) where.readAt = null;
  const skip = (Number(page) || 1) - 1;
  const take = Math.min(Number(limit) || 20, 100);
  const [notifications, total] = await Promise.all([
    db().notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: skip * take,
      take,
    }),
    db().notification.count({ where }),
  ]);
  return { notifications, total, page: Number(page) || 1, limit: take, totalPages: Math.ceil(total / take) || 1 };
}

export async function findNotificationById(id) {
  return db().notification.findUnique({ where: { id } });
}

export async function markAsRead(id) {
  return db().notification.update({ where: { id }, data: { readAt: new Date(), status: 'READ' } });
}

export async function markAllAsRead(userId) {
  await db().notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date(), status: 'READ' },
  });
}

export async function getUnreadCount(userId) {
  return db().notification.count({ where: { userId, readAt: null } });
}

export async function getOrCreatePreferences(userId) {
  const existing = await db().notificationPreference.findUnique({ where: { userId } });
  if (existing) return existing;
  return db().notificationPreference.create({ data: { userId } });
}

export async function updatePreferences(userId, data) {
  return db().notificationPreference.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
  });
}

export async function createBulkNotifications(dataArray) {
  return db().notification.createMany({ data: dataArray });
}
