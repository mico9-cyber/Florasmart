import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validation.middleware.js';

const validMovementTypes = ['STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT', 'RETURN', 'DAMAGE', 'RESERVATION', 'RELEASE', 'SALE'];

export const adjustStockValidation = [
  body('productId').trim().notEmpty().withMessage('productId is required'),
  body('locationId').trim().notEmpty().withMessage('locationId is required'),
  body('quantity').isInt({ min: 1 }).withMessage('quantity must be a positive integer'),
  body('movementType').trim().notEmpty().isIn(validMovementTypes).withMessage(`movementType must be one of: ${validMovementTypes.join(', ')}`),
  body('reason').trim().notEmpty().withMessage('reason is required'),
  body('note').optional({ nullable: true }).trim().isString(),
  body('referenceType').optional().trim().isString(),
  body('referenceId').optional({ nullable: true }).trim().isString(),
  validateRequest,
];

export const listStockValidation = [
  query('q').optional().trim().isString(),
  query('productId').optional().trim().isString(),
  query('categoryId').optional().trim().isString(),
  query('locationId').optional().trim().isString(),
  query('stockStatus').optional().trim().isString(),
  query('lowStock').optional().isIn(['true', 'false', '1', '0']).withMessage('lowStock must be true/false'),
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
  query('sort').optional().trim().isString(),
  validateRequest,
];

export const stockIdValidation = [
  param('id').trim().notEmpty().withMessage('id is required'),
  validateRequest,
];

export const listMovementsValidation = [
  query('productId').optional().trim().isString(),
  query('locationId').optional().trim().isString(),
  query('movementType').optional().trim().isString(),
  query('performedById').optional().trim().isString(),
  query('dateFrom').optional().trim().isString(),
  query('dateTo').optional().trim().isString(),
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
  validateRequest,
];

export const createLocationValidation = [
  body('name').trim().notEmpty().withMessage('name is required'),
  body('code').trim().notEmpty().withMessage('code is required'),
  body('description').optional({ nullable: true }).trim().isString(),
  body('address').optional({ nullable: true }).trim().isString(),
  body('active').optional().isBoolean().withMessage('active must be boolean'),
  validateRequest,
];

export const updateLocationValidation = [
  param('id').trim().notEmpty().withMessage('id is required'),
  body('name').optional().trim().notEmpty().withMessage('name cannot be empty'),
  body('code').optional().trim().notEmpty().withMessage('code cannot be empty'),
  body('description').optional({ nullable: true }).trim().isString(),
  body('address').optional({ nullable: true }).trim().isString(),
  body('active').optional().isBoolean().withMessage('active must be boolean'),
  validateRequest,
];

export const locationIdValidation = [
  param('id').trim().notEmpty().withMessage('id is required'),
  validateRequest,
];
