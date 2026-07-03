import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validation.middleware.js';

export const startConversationValidation = [
  body('title').optional().trim().isLength({ max: 200 }).withMessage('title max 200 characters'),
  body('contextType').optional().trim().isIn(['GENERAL', 'PRODUCT', 'GARDEN_PLAN', 'ORDER', 'RECOMMENDATION'])
    .withMessage('contextType must be GENERAL, PRODUCT, GARDEN_PLAN, ORDER, or RECOMMENDATION'),
  body('contextId').optional().trim().notEmpty().withMessage('contextId cannot be empty'),
  validateRequest,
];

export const sendMessageValidation = [
  param('id').trim().notEmpty().withMessage('conversation id is required'),
  body('message').trim().notEmpty().withMessage('message is required').isLength({ max: 2000 }).withMessage('message max 2000 characters'),
  body('context.productId').optional().trim().notEmpty().withMessage('productId cannot be empty'),
  body('context.gardenPlanId').optional().trim().notEmpty().withMessage('gardenPlanId cannot be empty'),
  validateRequest,
];

export const quickAskValidation = [
  body('message').trim().notEmpty().withMessage('message is required').isLength({ max: 2000 }).withMessage('message max 2000 characters'),
  validateRequest,
];

export const feedbackValidation = [
  param('messageId').trim().notEmpty().withMessage('messageId is required'),
  body('rating').trim().isIn(['HELPFUL', 'NOT_HELPFUL']).withMessage('rating must be HELPFUL or NOT_HELPFUL'),
  body('comment').optional().trim().isLength({ max: 500 }).withMessage('comment max 500 characters'),
  validateRequest,
];

export const conversationIdValidation = [
  param('id').trim().notEmpty().withMessage('conversation id is required'),
  validateRequest,
];

export const knowledgeCreateValidation = [
  body('title').trim().notEmpty().withMessage('title is required').isLength({ max: 200 }),
  body('category').trim().notEmpty().withMessage('category is required')
    .isIn(['WATERING', 'SUNLIGHT', 'FERTILIZER', 'PESTS', 'DISEASE', 'INDOOR_PLANTS', 'OUTDOOR_PLANTS', 'FLOWERS', 'VASE_CARE', 'GARDEN_PLANNER', 'PRODUCT_HELP', 'ORDER_HELP'])
    .withMessage('Invalid category'),
  body('question').trim().notEmpty().withMessage('question is required'),
  body('answer').trim().notEmpty().withMessage('answer is required'),
  body('keywords').optional().trim(),
  body('active').optional().isBoolean(),
  validateRequest,
];

export const knowledgeUpdateValidation = [
  param('id').trim().notEmpty().withMessage('id is required'),
  body('title').optional().trim().notEmpty().withMessage('title cannot be empty').isLength({ max: 200 }),
  body('category').optional().trim()
    .isIn(['WATERING', 'SUNLIGHT', 'FERTILIZER', 'PESTS', 'DISEASE', 'INDOOR_PLANTS', 'OUTDOOR_PLANTS', 'FLOWERS', 'VASE_CARE', 'GARDEN_PLANNER', 'PRODUCT_HELP', 'ORDER_HELP'])
    .withMessage('Invalid category'),
  body('question').optional().trim().notEmpty().withMessage('question cannot be empty'),
  body('answer').optional().trim().notEmpty().withMessage('answer cannot be empty'),
  body('keywords').optional().trim(),
  body('active').optional().isBoolean(),
  validateRequest,
];

export const knowledgeIdValidation = [
  param('id').trim().notEmpty().withMessage('id is required'),
  validateRequest,
];
