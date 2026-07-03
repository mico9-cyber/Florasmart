import { body, query, param } from 'express-validator';
import { validateRequest } from '../middleware/validation.middleware.js';

export const plantRecommendationValidation = [
  body('sunlightLevel').trim().notEmpty().withMessage('sunlightLevel is required'),
  body('wateringLevel').trim().notEmpty().withMessage('wateringLevel is required'),
  body('petSafeRequired').isBoolean().withMessage('petSafeRequired must be a boolean'),
  body('purpose').trim().notEmpty().withMessage('purpose is required'),
  body('experienceLevel').optional().trim().notEmpty().withMessage('experienceLevel cannot be empty'),
  body('spaceType').optional().trim().notEmpty().withMessage('spaceType cannot be empty'),
  body('budgetMin').optional().isFloat({ min: 0 }).withMessage('budgetMin must be a positive number'),
  body('budgetMax').optional().isFloat({ min: 0 }).withMessage('budgetMax must be a positive number'),
  validateRequest,
];

export const vaseMatchValidation = [
  body('bouquetProductId').optional().trim().notEmpty().withMessage('bouquetProductId cannot be empty'),
  body('vaseHeightCm').isFloat({ min: 1 }).withMessage('vaseHeightCm must be a positive number'),
  body('openingWidthCm').isFloat({ min: 1 }).withMessage('openingWidthCm must be a positive number'),
  body('vaseShape').trim().isIn(['CYLINDER', 'BUD', 'FLARED', 'SQUARE', 'ROUND'])
    .withMessage('vaseShape must be one of: CYLINDER, BUD, FLARED, SQUARE, ROUND'),
  validateRequest,
];

export const gardenPlanRecommendationValidation = [
  body('gardenPlanId').trim().notEmpty().withMessage('gardenPlanId is required'),
  validateRequest,
];

export const productRecommendationValidation = [
  query('type').optional().trim().notEmpty().withMessage('type cannot be empty'),
  query('categoryId').optional().trim().notEmpty().withMessage('categoryId cannot be empty'),
  query('budgetMin').optional().isFloat({ min: 0 }).withMessage('budgetMin must be a positive number'),
  query('budgetMax').optional().isFloat({ min: 0 }).withMessage('budgetMax must be a positive number'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('limit must be 1-50'),
  validateRequest,
];
