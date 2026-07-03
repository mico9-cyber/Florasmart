import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validation.middleware.js';

export const rewardIdValidation = [
  param('id').trim().isUUID().withMessage('Invalid reward ID'),
  validateRequest,
];

export const userIdParamValidation = [
  param('userId').trim().isUUID().withMessage('Invalid user ID'),
  validateRequest,
];

export const adjustPointsValidation = [
  param('userId').trim().isUUID().withMessage('Invalid user ID'),
  body('points').isInt({ allow_negatives: false }).withMessage('points must be a non-negative integer').toInt(),
  body('reason').trim().notEmpty().withMessage('reason is required').isLength({ max: 255 }),
  validateRequest,
];

export const createRewardValidation = [
  body('name').trim().notEmpty().withMessage('name is required').isLength({ max: 200 }),
  body('description').optional().trim().isLength({ max: 500 }),
  body('pointsCost').isInt({ min: 1 }).withMessage('pointsCost must be a positive integer').toInt(),
  body('discountType').trim().isIn(['FIXED_AMOUNT', 'PERCENTAGE', 'FREE_DELIVERY']).withMessage('Invalid discount type'),
  body('discountValue').optional({ values: 'null' }).isFloat({ min: 0 }).withMessage('discountValue must be a positive number'),
  body('minimumOrderAmount').optional({ values: 'null' }).isFloat({ min: 0 }),
  body('expiresAt').optional({ values: 'null' }).isISO8601().withMessage('Invalid date format'),
  validateRequest,
];

export const updateRewardValidation = [
  param('id').trim().isUUID().withMessage('Invalid reward ID'),
  body('name').optional().trim().notEmpty().withMessage('name cannot be empty').isLength({ max: 200 }),
  body('description').optional().trim().isLength({ max: 500 }),
  body('pointsCost').optional().isInt({ min: 1 }).withMessage('pointsCost must be a positive integer').toInt(),
  body('discountType').optional().trim().isIn(['FIXED_AMOUNT', 'PERCENTAGE', 'FREE_DELIVERY']).withMessage('Invalid discount type'),
  body('discountValue').optional({ values: 'null' }).isFloat({ min: 0 }),
  body('minimumOrderAmount').optional({ values: 'null' }).isFloat({ min: 0 }),
  body('expiresAt').optional({ values: 'null' }).isISO8601(),
  body('active').optional().isBoolean(),
  validateRequest,
];

export const paginationValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer').toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100').toInt(),
  validateRequest,
];

export const adminTransactionsValidation = [
  query('userId').optional().trim().isUUID().withMessage('Invalid user ID'),
  query('type').optional().trim().isIn(['EARNED', 'REDEEMED', 'ADJUSTED', 'REVERSED', 'EXPIRED']).withMessage('Invalid type'),
  query('dateFrom').optional().isISO8601().withMessage('Invalid date format'),
  query('dateTo').optional().isISO8601().withMessage('Invalid date format'),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  validateRequest,
];
