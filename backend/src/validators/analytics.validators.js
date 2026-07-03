import { query } from 'express-validator';
import { validateRequest } from '../middleware/validation.middleware.js';

export const analyticsDateValidation = [
  query('dateFrom').optional().trim().isISO8601().withMessage('dateFrom must be a valid ISO 8601 date'),
  query('dateTo').optional().trim().isISO8601().withMessage('dateTo must be a valid ISO 8601 date'),
  query('groupBy').optional().trim().isIn(['day', 'week', 'month']).withMessage('groupBy must be day, week, or month'),
  query('categoryId').optional().trim().isUUID().withMessage('categoryId must be a valid UUID'),
  query('status').optional().trim(),
  validateRequest,
];
