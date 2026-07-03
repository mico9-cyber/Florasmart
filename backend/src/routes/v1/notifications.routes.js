import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requirePermissions } from '../../middleware/authorization.middleware.js';
import {
  listNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  getPreferences,
  updatePreferences,
  sendAnnouncement,
  getEmailLogs,
} from '../../controllers/notification.controller.js';
import {
  listNotificationsValidation,
  notificationIdValidation,
  updatePreferencesValidation,
  sendAnnouncementValidation,
  emailLogsValidation,
} from '../../validators/notification.validators.js';

const router = Router();

router.use(authenticate);

router.get('/', listNotificationsValidation, listNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/:id/read', notificationIdValidation, markAsRead);
router.patch('/read-all', markAllAsRead);
router.get('/preferences', getPreferences);
router.patch('/preferences', updatePreferencesValidation, updatePreferences);

router.post('/admin/announcement', requirePermissions('MANAGE_NOTIFICATIONS'), sendAnnouncementValidation, sendAnnouncement);
router.get('/admin/email-logs', requirePermissions('MANAGE_NOTIFICATIONS'), emailLogsValidation, getEmailLogs);

export default router;
