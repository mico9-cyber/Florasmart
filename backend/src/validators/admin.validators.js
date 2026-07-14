import { body, query, param } from 'express-validator';
import { validateRequest } from '../middleware/validation.middleware.js';
import { ROLES } from '../constants/auth.js';

export const listUsersValidation = [
  query('role').optional().isIn(['florist', 'gardener']).withMessage('role must be florist or gardener'),
  query('status').optional().isIn(['active', 'inactive']).withMessage('status must be active or inactive'),
  query('search').optional().isString().trim(),
  validateRequest,
];

export const createUserValidation = [
  body('fullName').trim().notEmpty().withMessage('fullName is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone').optional().isString().trim(),
  body('role').isIn([ROLES.FLORIST, ROLES.GARDENER]).withMessage('role must be FLORIST or GARDENER'),
  validateRequest,
];

export const userIdValidation = [
  param('id').isUUID().withMessage('Invalid user ID'),
  validateRequest,
];

export const updateUserValidation = [
  param('id').isUUID().withMessage('Invalid user ID'),
  body('fullName').optional().isString().trim().notEmpty(),
  body('phone').optional({ nullable: true }).isString().trim(),
  validateRequest,
];
