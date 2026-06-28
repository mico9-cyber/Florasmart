import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validation.middleware.js';

export const createProductValidation = [
  body('name').trim().notEmpty().withMessage('name is required'),
  body('sku').trim().notEmpty().withMessage('sku is required'),
  body('price').isFloat({ min: 0 }).withMessage('price must be a positive number'),
  body('categoryId').trim().notEmpty().withMessage('categoryId is required'),
  body('productType').trim().notEmpty().withMessage('productType is required'),
  body('description').optional({ nullable: true }).trim().isString(),
  body('shortDescription').optional({ nullable: true }).trim().isString(),
  body('discountPrice').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('discountPrice must be a positive number'),
  body('currency').optional().trim().isLength({ min: 3, max: 3 }).withMessage('currency must be 3-letter code'),
  body('imageUrl').optional({ nullable: true }).trim().isString(),
  body('active').optional().isBoolean().withMessage('active must be boolean'),
  body('featured').optional().isBoolean().withMessage('featured must be boolean'),
  body('stockStatus').optional().trim().isIn(['in_stock', 'out_of_stock', 'low_stock', 'pre_order']).withMessage('invalid stock status'),
  body('careLevel').optional({ nullable: true }).trim().isString(),
  body('lightRequirement').optional({ nullable: true }).trim().isString(),
  body('waterRequirement').optional({ nullable: true }).trim().isString(),
  body('soilType').optional({ nullable: true }).trim().isString(),
  body('temperatureRange').optional({ nullable: true }).trim().isString(),
  body('growthSize').optional({ nullable: true }).trim().isString(),
  body('color').optional({ nullable: true }).trim().isString(),
  body('occasion').optional({ nullable: true }).trim().isString(),
  body('tags').optional({ nullable: true }).trim().isString(),
  validateRequest,
];

export const updateProductValidation = [
  param('id').notEmpty().withMessage('id is required').isString(),
  body('name').optional().trim().notEmpty().withMessage('name cannot be empty'),
  body('sku').optional().trim().notEmpty().withMessage('sku cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('price must be a positive number'),
  body('categoryId').optional().trim().notEmpty().withMessage('categoryId cannot be empty'),
  body('productType').optional().trim().notEmpty().withMessage('productType cannot be empty'),
  body('description').optional({ nullable: true }).trim().isString(),
  body('shortDescription').optional({ nullable: true }).trim().isString(),
  body('discountPrice').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('discountPrice must be a positive number'),
  body('currency').optional().trim().isLength({ min: 3, max: 3 }).withMessage('currency must be 3-letter code'),
  body('imageUrl').optional({ nullable: true }).trim().isString(),
  body('active').optional().isBoolean().withMessage('active must be boolean'),
  body('featured').optional().isBoolean().withMessage('featured must be boolean'),
  body('stockStatus').optional().trim().isIn(['in_stock', 'out_of_stock', 'low_stock', 'pre_order']).withMessage('invalid stock status'),
  body('careLevel').optional({ nullable: true }).trim().isString(),
  body('lightRequirement').optional({ nullable: true }).trim().isString(),
  body('waterRequirement').optional({ nullable: true }).trim().isString(),
  body('soilType').optional({ nullable: true }).trim().isString(),
  body('temperatureRange').optional({ nullable: true }).trim().isString(),
  body('growthSize').optional({ nullable: true }).trim().isString(),
  body('color').optional({ nullable: true }).trim().isString(),
  body('occasion').optional({ nullable: true }).trim().isString(),
  body('tags').optional({ nullable: true }).trim().isString(),
  validateRequest,
];

export const productIdValidation = [
  param('id').notEmpty().withMessage('id is required').isString(),
  validateRequest,
];

export const productSlugValidation = [
  param('slug').notEmpty().withMessage('slug is required').isString(),
  validateRequest,
];

export const listProductsValidation = [
  query('q').optional().trim().isString(),
  query('category').optional().trim().isString(),
  query('productType').optional().trim().isString(),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('minPrice must be a positive number'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('maxPrice must be a positive number'),
  query('careLevel').optional().trim().isString(),
  query('lightRequirement').optional().trim().isString(),
  query('active').optional().isIn(['true', 'false', '1', '0']).withMessage('active must be true/false'),
  query('featured').optional().isIn(['true', 'false', '1', '0']).withMessage('featured must be true/false'),
  query('sort').optional().trim().isString(),
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
  validateRequest,
];
