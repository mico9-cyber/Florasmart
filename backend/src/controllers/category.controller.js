import { successResponse } from '../utils/response.js';
import { getPrismaClient } from '../database/prisma.js';
import { CategoryRepository } from '../repositories/category.repository.js';
import { CategoryService } from '../services/category.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const service = new CategoryService(new CategoryRepository());

export const listCategories = asyncHandler(async (req, res) => {
  const result = await service.list(req.query);
  return successResponse(res, { message: 'Categories retrieved successfully', data: result });
});

export const getCategory = asyncHandler(async (req, res) => {
  const result = await service.getById(req.params.id);
  return successResponse(res, { message: 'Category retrieved successfully', data: result });
});

export const createCategory = asyncHandler(async (req, res) => {
  const result = await service.create(req.body);
  return successResponse(res, { statusCode: 201, message: 'Category created successfully', data: result });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const result = await service.update(req.params.id, req.body);
  return successResponse(res, { message: 'Category updated successfully', data: result });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  await service.delete(req.params.id);
  return successResponse(res, { message: 'Category deleted successfully', data: null });
});
