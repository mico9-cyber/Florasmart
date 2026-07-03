import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validation.middleware.js';

const validTypes = ['SYSTEM', 'AUTH', 'ORDER', 'DELIVERY', 'INVENTORY', 'LOYALTY', 'SUBSCRIPTION', 'GARDEN', 'CHATBOT', 'RECOMMENDATION', 'REPORT'];
const validStatuses = ['PENDING', 'SENT', 'FAILED', 'READ'];
const validChannels = ['IN_APP', 'EMAIL', 'SMS_PLACEHOLDER'];
const validRoles = ['ADMIN', 'CUSTOMER', 'FLORIST', 'GARDENER'];

export const notificationIdValidation = [
  param('id').trim().isUUID().withMessage('Invalid notification ID'),
  validateRequest,
];

export const listNotificationsValidation = [
  query('type').optional().trim().isIn(validTypes).withMessage('Invalid notification type'),
  query('status').optional().trim().isIn(validStatuses).withMessage('Invalid status'),
  query('unreadOnly').optional().isBoolean().withMessage('unreadOnly must be boolean'),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  validateRequest,
];

export const updatePreferencesValidation = [
  body('emailEnabled').optional().isBoolean().withMessage('emailEnabled must be boolean'),
  body('inAppEnabled').optional().isBoolean().withMessage('inAppEnabled must be boolean'),
  body('orderUpdates').optional().isBoolean().withMessage('orderUpdates must be boolean'),
  body('deliveryUpdates').optional().isBoolean().withMessage('deliveryUpdates must be boolean'),
  body('inventoryAlerts').optional().isBoolean().withMessage('inventoryAlerts must be boolean'),
  body('loyaltyUpdates').optional().isBoolean().withMessage('loyaltyUpdates must be boolean'),
  body('subscriptionUpdates').optional().isBoolean().withMessage('subscriptionUpdates must be boolean'),
  body('gardenReminders').optional().isBoolean().withMessage('gardenReminders must be boolean'),
  body('marketingEmails').optional().isBoolean().withMessage('marketingEmails must be boolean'),
  body('securityAlerts').optional().isBoolean().withMessage('securityAlerts must be boolean'),
  validateRequest,
];

export const sendAnnouncementValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 255 }).withMessage('Title too long'),
  body('message').trim().notEmpty().withMessage('Message is required'),
  body('targetRoles').isArray({ min: 1 }).withMessage('At least one target role required'),
  body('targetRoles.*').trim().isIn(validRoles).withMessage('Invalid role'),
  body('channels').isArray({ min: 1 }).withMessage('At least one channel required'),
  body('channels.*').trim().isIn(validChannels).withMessage('Invalid channel'),
  validateRequest,
];

export const emailLogsValidation = [
  query('status').optional().trim().isIn(['PENDING', 'SENT', 'FAILED']).withMessage('Invalid status'),
  query('toEmail').optional().trim().isEmail().withMessage('Invalid email'),
  query('templateName').optional().trim().isLength({ max: 100 }).withMessage('Invalid template name'),
  query('dateFrom').optional().isISO8601().withMessage('Invalid date format'),
  query('dateTo').optional().isISO8601().withMessage('Invalid date format'),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  validateRequest,
];
