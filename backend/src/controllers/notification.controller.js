import { successResponse } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { NotificationService } from '../services/notification.service.js';

const notificationService = new NotificationService();

export const listNotifications = asyncHandler(async (req, res) => {
  const result = await notificationService.getUserNotifications(req.auth.userId, req.query);
  return successResponse(res, { message: 'Notifications retrieved successfully', data: result });
});

export const getUnreadCount = asyncHandler(async (req, res) => {
  const unreadCount = await notificationService.getUnreadCount(req.auth.userId);
  return successResponse(res, { message: 'Unread count retrieved', data: { unreadCount } });
});

export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(req.auth.userId, req.params.id);
  return successResponse(res, { message: 'Notification marked as read', data: notification });
});

export const markAllAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.auth.userId);
  return successResponse(res, { message: 'All notifications marked as read' });
});

export const getPreferences = asyncHandler(async (req, res) => {
  const prefs = await notificationService.getOrCreatePreferences(req.auth.userId);
  return successResponse(res, { message: 'Notification preferences retrieved', data: prefs });
});

export const updatePreferences = asyncHandler(async (req, res) => {
  const prefs = await notificationService.updatePreferences(req.auth.userId, req.body);
  return successResponse(res, { message: 'Notification preferences updated', data: prefs });
});

export const sendAnnouncement = asyncHandler(async (req, res) => {
  const { title, message, targetRoles, channels } = req.body;
  const result = await notificationService.sendAnnouncement(req.auth.userId, title, message, targetRoles, channels);
  return successResponse(res, { statusCode: 201, message: 'Announcement sent successfully', data: result });
});

export const getEmailLogs = asyncHandler(async (req, res) => {
  const result = await notificationService.getEmailLogs(req.query);
  return successResponse(res, { message: 'Email logs retrieved successfully', data: result });
});
