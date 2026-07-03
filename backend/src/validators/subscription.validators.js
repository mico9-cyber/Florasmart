import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validation.middleware.js';

export const subscribeValidation = [
  body('planId').trim().isUUID().withMessage('Invalid plan ID'),
  body('autoRenew').optional().isBoolean().withMessage('autoRenew must be a boolean'),
  validateRequest,
];

export const cancelValidation = [
  param('id').trim().isUUID().withMessage('Invalid subscription ID'),
  body('reason').optional().trim().isLength({ max: 500 }),
  validateRequest,
];

export const planIdValidation = [
  param('id').trim().isUUID().withMessage('Invalid plan ID'),
  validateRequest,
];

export const createPlanValidation = [
  body('name').trim().notEmpty().withMessage('name is required').isLength({ max: 200 }),
  body('description').optional().trim().isLength({ max: 500 }),
  body('price').isFloat({ min: 0 }).withMessage('price must be a positive number'),
  body('billingCycle').trim().isIn(['MONTHLY', 'QUARTERLY', 'YEARLY']).withMessage('Invalid billing cycle'),
  body('benefits').optional().isObject().withMessage('benefits must be an object'),
  validateRequest,
];

export const updatePlanValidation = [
  param('id').trim().isUUID().withMessage('Invalid plan ID'),
  body('name').optional().trim().notEmpty().withMessage('name cannot be empty').isLength({ max: 200 }),
  body('description').optional().trim().isLength({ max: 500 }),
  body('price').optional().isFloat({ min: 0 }).withMessage('price must be a positive number'),
  body('billingCycle').optional().trim().isIn(['MONTHLY', 'QUARTERLY', 'YEARLY']).withMessage('Invalid billing cycle'),
  body('benefits').optional().isObject().withMessage('benefits must be an object'),
  body('active').optional().isBoolean(),
  validateRequest,
];
