import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validation.middleware.js';

const validDeliveryStatuses = [
  'PENDING_ASSIGNMENT', 'ASSIGNED', 'PICKED_UP', 'ON_THE_WAY', 'DELIVERED', 'FAILED', 'CANCELLED',
];

export const deliveryIdValidation = [
  param('id').trim().notEmpty().withMessage('id is required'),
  validateRequest,
];

export const orderIdParamValidation = [
  param('orderId').trim().notEmpty().withMessage('orderId is required'),
  validateRequest,
];

export const listDeliveriesValidation = [
  query('status').optional().trim().isString(),
  query('assignedToId').optional().trim().isString(),
  query('dateFrom').optional().trim().isString(),
  query('dateTo').optional().trim().isString(),
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
  validateRequest,
];

export const assignDeliveryValidation = [
  param('orderId').trim().notEmpty().withMessage('orderId is required'),
  body('assignedToId').trim().notEmpty().withMessage('assignedToId is required'),
  body('scheduledAt').optional({ nullable: true }).trim().isString(),
  body('note').optional({ nullable: true }).trim().isString(),
  validateRequest,
];

export const updateDeliveryStatusValidation = [
  param('id').trim().notEmpty().withMessage('id is required'),
  body('status').trim().notEmpty().isIn(validDeliveryStatuses).withMessage(`status must be one of: ${validDeliveryStatuses.join(', ')}`),
  body('location').optional({ nullable: true }).trim().isString(),
  body('note').optional({ nullable: true }).trim().isString(),
  validateRequest,
];
