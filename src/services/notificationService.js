import { get, patch, post } from './api';
export const notificationService = {
  list: () => get('/notifications', { requiresAuth: true }),
  unreadCount: () => get('/notifications/unread-count', { requiresAuth: true }),
  markRead: (id) => patch(`/notifications/${id}/read`, {}, { requiresAuth: true }),
  markAllRead: () => patch('/notifications/read-all', {}, { requiresAuth: true }),
  preferences: () => get('/notifications/preferences', { requiresAuth: true }),
  updatePreferences: (payload) => patch('/notifications/preferences', payload, { requiresAuth: true }),
  sendAnnouncement: (payload) => post('/notifications/admin/announcement', payload, { requiresAuth: true }),
  emailLogs: () => get('/notifications/admin/email-logs', { requiresAuth: true }),
};
