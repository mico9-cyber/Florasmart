import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validation.middleware.js';

const validOrderStatuses = [
  'PENDING', 'PROCESSING', 'CONFIRMED', 'PREPARING',
  'READY_FOR_DELIVERY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED',
];

export const orderIdValidation = [
  param('id').trim().notEmpty().withMessage('id is required'),
  validateRequest,
];

export const listOrdersValidation = [
  query('status').optional().trim().isString(),
  query('paymentStatus').optional().trim().isString(),
  query('customerId').optional().trim().isString(),
  query('dateFrom').optional().trim().isString(),
  query('dateTo').optional().trim().isString(),
  query('q').optional().trim().isString(),
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
  query('sort').optional().trim().isString(),
  validateRequest,
];

export const updateOrderStatusValidation = [
  param('id').trim().notEmpty().withMessage('id is required'),
  body('status').trim().notEmpty().isIn(validOrderStatuses).withMessage(`status must be one of: ${validOrderStatuses.join(', ')}`),
  body('note').optional({ nullable: true }).trim().isString(),
  validateRequest,
];

export const cancelOrderValidation = [
  param('id').trim().notEmpty().withMessage('id is required'),
  body('reason').optional({ nullable: true }).trim().isString(),
  validateRequest,
];
