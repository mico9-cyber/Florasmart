import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validation.middleware.js';

export const createPlanValidation = [
  body('name').trim().notEmpty().withMessage('Plan name is required').isLength({ max: 120 }),
  body('description').optional().trim().isLength({ max: 500 }),
  body('width').optional().isInt({ min: 1, max: 100 }).withMessage('Width must be 1-100'),
  body('height').optional().isInt({ min: 1, max: 100 }).withMessage('Height must be 1-100'),
  body('gridData').optional().isObject().withMessage('gridData must be an object'),
  body('tags').optional().trim().isLength({ max: 500 }),
  validateRequest,
];

export const updatePlanValidation = [
  param('planId').trim().notEmpty().withMessage('planId is required'),
  body('name').optional().trim().notEmpty().withMessage('name cannot be empty').isLength({ max: 120 }),
  body('description').optional({ nullable: true }).trim().isLength({ max: 500 }),
  body('width').optional().isInt({ min: 1, max: 100 }).withMessage('Width must be 1-100'),
  body('height').optional().isInt({ min: 1, max: 100 }).withMessage('Height must be 1-100'),
  body('gridData').optional({ nullable: true }).isObject().withMessage('gridData must be an object'),
  body('tags').optional({ nullable: true }).trim().isLength({ max: 500 }),
  body('isDefault').optional().isBoolean().withMessage('isDefault must be a boolean'),
  validateRequest,
];

export const planIdValidation = [
  param('planId').trim().notEmpty().withMessage('planId is required'),
  validateRequest,
];

export const updateCellValidation = [
  param('planId').trim().notEmpty().withMessage('planId is required'),
  param('row').isInt({ min: 0 }).withMessage('row must be a non-negative integer'),
  param('col').isInt({ min: 0 }).withMessage('col must be a non-negative integer'),
  body('soilType').optional({ nullable: true }).trim().isLength({ max: 100 }),
  body('sunExposure').optional({ nullable: true }).trim().isLength({ max: 100 }),
  body('notes').optional({ nullable: true }).trim().isLength({ max: 500 }),
  validateRequest,
];

export const addPlacementValidation = [
  param('planId').trim().notEmpty().withMessage('planId is required'),
  body('productId').trim().notEmpty().withMessage('productId is required'),
  body('row').isInt({ min: 0 }).withMessage('row must be a non-negative integer'),
  body('col').isInt({ min: 0 }).withMessage('col must be a non-negative integer'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('quantity must be a positive integer'),
  body('notes').optional().trim().isLength({ max: 500 }),
  body('plantedAt').optional({ nullable: true }).isISO8601().withMessage('plantedAt must be a valid ISO date'),
  validateRequest,
];

export const updatePlacementValidation = [
  param('planId').trim().notEmpty().withMessage('planId is required'),
  param('placementId').trim().notEmpty().withMessage('placementId is required'),
  body('row').optional().isInt({ min: 0 }).withMessage('row must be a non-negative integer'),
  body('col').optional().isInt({ min: 0 }).withMessage('col must be a non-negative integer'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('quantity must be a positive integer'),
  body('notes').optional({ nullable: true }).trim().isLength({ max: 500 }),
  body('plantedAt').optional({ nullable: true }).isISO8601().withMessage('plantedAt must be a valid ISO date'),
  validateRequest,
];

export const placementIdValidation = [
  param('planId').trim().notEmpty().withMessage('planId is required'),
  param('placementId').trim().notEmpty().withMessage('placementId is required'),
  validateRequest,
];

export const addNoteValidation = [
  param('planId').trim().notEmpty().withMessage('planId is required'),
  body('title').trim().notEmpty().withMessage('title is required').isLength({ max: 200 }),
  body('content').trim().notEmpty().withMessage('content is required'),
  body('noteType').optional().trim().isIn(['general', 'reminder', 'observation', 'task', 'idea'])
    .withMessage('noteType must be one of: general, reminder, observation, task, idea'),
  validateRequest,
];

export const updateNoteValidation = [
  param('planId').trim().notEmpty().withMessage('planId is required'),
  param('noteId').trim().notEmpty().withMessage('noteId is required'),
  body('title').optional().trim().notEmpty().withMessage('title cannot be empty').isLength({ max: 200 }),
  body('content').optional().trim().notEmpty().withMessage('content cannot be empty'),
  body('noteType').optional().trim().isIn(['general', 'reminder', 'observation', 'task', 'idea'])
    .withMessage('noteType must be one of: general, reminder, observation, task, idea'),
  validateRequest,
];

export const noteIdValidation = [
  param('planId').trim().notEmpty().withMessage('planId is required'),
  param('noteId').trim().notEmpty().withMessage('noteId is required'),
  validateRequest,
];
