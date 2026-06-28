import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validation.middleware.js';

export const createCategoryValidation = [
  body('name').trim().notEmpty().withMessage('name is required'),
  body('description').optional({ nullable: true }).trim().isString(),
  body('imageUrl').optional({ nullable: true }).trim().isString(),
  body('active').optional().isBoolean().withMessage('active must be boolean'),
  validateRequest,
];

export const updateCategoryValidation = [
  param('id').notEmpty().withMessage('id is required').isString(),
  body('name').optional().trim().notEmpty().withMessage('name cannot be empty'),
  body('description').optional({ nullable: true }).trim().isString(),
  body('imageUrl').optional({ nullable: true }).trim().isString(),
  body('active').optional().isBoolean().withMessage('active must be boolean'),
  validateRequest,
];

export const categoryIdValidation = [
  param('id').notEmpty().withMessage('id is required').isString(),
  validateRequest,
];

export const listCategoriesValidation = [
  query('active').optional().isIn(['true', 'false', '1', '0']).withMessage('active must be true/false'),
  validateRequest,
];
