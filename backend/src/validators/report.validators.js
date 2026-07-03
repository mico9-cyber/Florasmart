import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validation.middleware.js';

const validReportTypes = ['SALES', 'ORDERS', 'INVENTORY', 'PRODUCTS', 'DELIVERY', 'CUSTOMERS', 'LOYALTY', 'GARDEN_PLANS', 'CHATBOT', 'RECOMMENDATIONS'];
const validFormats = ['CSV', 'JSON', 'PDF'];

export const generateReportValidation = [
  body('reportType').trim().isIn(validReportTypes).withMessage(`reportType must be one of: ${validReportTypes.join(', ')}`),
  body('format').trim().isIn(validFormats).withMessage(`format must be one of: ${validFormats.join(', ')}`),
  body('filters').optional().isObject().withMessage('filters must be an object'),
  body('filters.dateFrom').optional().isISO8601().withMessage('dateFrom must be ISO 8601'),
  body('filters.dateTo').optional().isISO8601().withMessage('dateTo must be ISO 8601'),
  validateRequest,
];

export const jobIdValidation = [
  param('id').trim().isUUID().withMessage('Invalid job ID'),
  validateRequest,
];

export const listJobsValidation = [
  query('reportType').optional().trim().isIn(validReportTypes).withMessage('Invalid report type'),
  query('format').optional().trim().isIn(validFormats).withMessage('Invalid format'),
  query('status').optional().trim().isIn(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']).withMessage('Invalid status'),
  query('dateFrom').optional().isISO8601().withMessage('Invalid date format'),
  query('dateTo').optional().isISO8601().withMessage('Invalid date format'),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  validateRequest,
];
