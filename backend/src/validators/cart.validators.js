import { body, param } from 'express-validator';
import { validateRequest } from '../middleware/validation.middleware.js';

export const addCartItemValidation = [
  body('productId').trim().notEmpty().withMessage('productId is required'),
  body('quantity').isInt({ min: 1 }).withMessage('quantity must be a positive integer'),
  validateRequest,
];

export const updateCartItemValidation = [
  param('itemId').trim().notEmpty().withMessage('itemId is required'),
  body('quantity').isInt({ min: 1 }).withMessage('quantity must be a positive integer'),
  validateRequest,
];

export const removeCartItemValidation = [
  param('itemId').trim().notEmpty().withMessage('itemId is required'),
  validateRequest,
];
