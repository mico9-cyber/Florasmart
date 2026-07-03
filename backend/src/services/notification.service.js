import { AppError } from '../utils/appError.js';
import { getPrismaClient } from '../database/prisma.js';
import { logAuditEvent } from '../utils/audit.js';
import * as notificationRepo from '../repositories/notification.repository.js';
import * as emailLogRepo from '../repositories/email-log.repository.js';
import * as emailService from './email.service.js';

const NOTIFICATION_TYPES = ['SYSTEM', 'AUTH', 'ORDER', 'DELIVERY', 'INVENTORY', 'LOYALTY', 'SUBSCRIPTION', 'GARDEN', 'CHATBOT', 'RECOMMENDATION', 'REPORT'];
const VALID_CHANNELS = ['IN_APP', 'EMAIL'];

export class NotificationService {
  async createNotification(userId, type, title, message, data = {}, channels = ['IN_APP'], status = 'SENT') {
    if (!NOTIFICATION_TYPES.includes(type)) {
      throw new AppError(`Invalid notification type: ${type}`, 400, 'INVALID_TYPE');
    }
    const results = [];
    const wantsInApp = channels.includes('IN_APP');
    const wantsEmail = channels.includes('EMAIL');
    const prefs = await notificationRepo.getOrCreatePreferences(userId).catch(() => null);
    const user = await getPrismaClient().user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true } });
    if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');

    if (wantsInApp && (!prefs || prefs.inAppEnabled)) {
      const notification = await notificationRepo.createNotification({
        userId,
        type,
        channel: 'IN_APP',
        title,
        message,
        data: data || undefined,
        status,
      });
      results.push({ channel: 'IN_APP', notification });
    }

    if (wantsEmail && (!prefs || prefs.emailEnabled)) {
      const emailResult = await emailService.sendRawEmail(
        user.email,
        title,
        message || title,
        null,
        { userId: user.id, templateName: type }
      );
      results.push({ channel: 'EMAIL', result: emailResult });
    }

    await logAuditEvent(getPrismaClient(), { action: 'notification_created', userId, type });
    return results;
  }

  async createInAppNotification(userId, type, title, message, data = {}) {
    return this.createNotification(userId, type, title, message, data, ['IN_APP']);
  }

  async sendEmailNotification(userId, type, title, message, data = {}) {
    return this.createNotification(userId, type, title, message, data, ['EMAIL']);
  }

  async sendNotification(userId, type, title, message, data = {}, channels = ['IN_APP', 'EMAIL']) {
    return this.createNotification(userId, type, title, message, data, channels);
  }

  async sendBulkNotification(userIds, type, title, message, data = {}, channels = ['IN_APP']) {
    const results = [];
    for (const userId of userIds) {
      try {
        const result = await this.createNotification(userId, type, title, message, data, channels);
        results.push({ userId, result });
      } catch (error) {
        results.push({ userId, error: error.message });
      }
    }
    return results;
  }

  async markAsRead(userId, notificationId) {
    const notification = await notificationRepo.findNotificationById(notificationId);
    if (!notification) throw new AppError('Notification not found', 404, 'NOTIFICATION_NOT_FOUND');
    if (notification.userId !== userId) throw new AppError('Forbidden', 403, 'FORBIDDEN');
    const updated = await notificationRepo.markAsRead(notificationId);
    await logAuditEvent(getPrismaClient(), { action: 'notification_read', userId, notificationId });
    return updated;
  }

  async markAllAsRead(userId) {
    await notificationRepo.markAllAsRead(userId);
    await logAuditEvent(getPrismaClient(), { action: 'notifications_read_all', userId });
  }

  async getUserNotifications(userId, query) {
    return notificationRepo.findNotificationsByUserId(userId, query);
  }

  async getUnreadCount(userId) {
    return notificationRepo.getUnreadCount(userId);
  }

  async getOrCreatePreferences(userId) {
    return notificationRepo.getOrCreatePreferences(userId);
  }

  async updatePreferences(userId, data) {
    const allowedKeys = ['emailEnabled', 'inAppEnabled', 'orderUpdates', 'deliveryUpdates', 'inventoryAlerts', 'loyaltyUpdates', 'subscriptionUpdates', 'gardenReminders', 'marketingEmails', 'securityAlerts'];
    const filtered = {};
    for (const key of allowedKeys) {
      if (data[key] !== undefined) filtered[key] = Boolean(data[key]);
    }
    const prefs = await notificationRepo.updatePreferences(userId, filtered);
    await logAuditEvent(getPrismaClient(), { action: 'notification_preferences_updated', userId });
    return prefs;
  }

  async getEmailLogs(query) {
    return emailLogRepo.findEmailLogs(query);
  }

  async sendAnnouncement(adminId, title, message, targetRoles, channels) {
    const prisma = getPrismaClient();
    const roleRecords = await prisma.role.findMany({ where: { name: { in: targetRoles } } });
    if (roleRecords.length === 0) throw new AppError('No valid target roles found', 400, 'INVALID_TARGET_ROLES');
    const roleIds = roleRecords.map(r => r.id);
    const userRoles = await prisma.userRole.findMany({
      where: { roleId: { in: roleIds } },
      include: { user: { select: { id: true, name: true, email: true } } },
      distinct: ['userId'],
    });
    const userIds = [...new Set(userRoles.map(ur => ur.userId))];
    if (userIds.length === 0) throw new AppError('No users found for target roles', 400, 'NO_TARGET_USERS');

    const results = [];
    for (const userId of userIds) {
      try {
        const result = await this.createNotification(userId, 'SYSTEM', title, message, { announcement: true, sentBy: adminId }, channels);
        results.push({ userId, result });
      } catch (error) {
        results.push({ userId, error: error.message });
      }
    }

    if (channels.includes('EMAIL')) {
      const users = userRoles.map(ur => ur.user);
      await emailService.sendSystemAnnouncementEmail(users, title, message);
    }

    await logAuditEvent(prisma, { action: 'announcement_sent', userId: adminId, targetRoles, channels });
    return { totalTargeted: userIds.length, results };
  }
}
