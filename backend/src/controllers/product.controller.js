import { successResponse } from '../utils/response.js';
import { getPrismaClient } from '../database/prisma.js';
import { ProductRepository } from '../repositories/product.repository.js';
import { CategoryRepository } from '../repositories/category.repository.js';
import { ProductService } from '../services/product.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const service = new ProductService(new ProductRepository(), new CategoryRepository());

export const listProducts = asyncHandler(async (req, res) => {
  const query = { ...req.query };
  if (req.auth) {
    const isAdminOrFlorist = req.auth.roles.some(r => r === 'ADMIN' || r === 'FLORIST');
    if (isAdminOrFlorist) {
      query._admin = true;
    }
  }
  const result = await service.list(query);
  return successResponse(res, { message: 'Products retrieved successfully', data: result.data, meta: result.meta });
});

export const getProduct = asyncHandler(async (req, res) => {
  const result = await service.getById(req.params.id);
  return successResponse(res, { message: 'Product retrieved successfully', data: result });
});

export const getProductBySlug = asyncHandler(async (req, res) => {
  const result = await service.getBySlug(req.params.slug);
  return successResponse(res, { message: 'Product retrieved successfully', data: result });
});

export const createProduct = asyncHandler(async (req, res) => {
  const result = await service.create(req.body, req.auth.userId);
  return successResponse(res, { statusCode: 201, message: 'Product created successfully', data: result });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const result = await service.update(req.params.id, req.body);
  return successResponse(res, { message: 'Product updated successfully', data: result });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  await service.delete(req.params.id);
  return successResponse(res, { message: 'Product deleted successfully', data: null });
});
