import { successResponse } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { InventoryService } from '../services/inventory.service.js';
import { InventoryLocationService } from '../services/inventory.service.js';
import { StockLevelRepository } from '../repositories/inventory.repository.js';
import { InventoryMovementRepository } from '../repositories/inventory.repository.js';
import { InventoryLocationRepository } from '../repositories/inventory.repository.js';

const stockRepo = new StockLevelRepository();
const movementRepo = new InventoryMovementRepository();
const locationRepo = new InventoryLocationRepository();

const inventoryService = new InventoryService(stockRepo, movementRepo, locationRepo);
const locationService = new InventoryLocationService(locationRepo);

export const getInventorySummary = asyncHandler(async (req, res) => {
  const result = await inventoryService.getSummary();
  return successResponse(res, { message: 'Inventory summary retrieved successfully', data: result });
});

export const listStock = asyncHandler(async (req, res) => {
  const result = await inventoryService.listStock(req.query);
  return successResponse(res, { message: 'Stock levels retrieved successfully', data: result.data, meta: result.meta });
});

export const getStockById = asyncHandler(async (req, res) => {
  const result = await inventoryService.getStockById(req.params.id);
  return successResponse(res, { message: 'Stock level retrieved successfully', data: result });
});

export const adjustStock = asyncHandler(async (req, res) => {
  const result = await inventoryService.adjustStock(req.body, req.auth.userId);
  return successResponse(res, { message: 'Stock adjusted successfully', data: result });
});

export const listMovements = asyncHandler(async (req, res) => {
  const result = await inventoryService.listMovements(req.query);
  return successResponse(res, { message: 'Stock movements retrieved successfully', data: result.data, meta: result.meta });
});

export const getLowStock = asyncHandler(async (req, res) => {
  const result = await inventoryService.getLowStock();
  return successResponse(res, { message: 'Low stock alerts retrieved successfully', data: result });
});

export const listLocations = asyncHandler(async (req, res) => {
  const result = await locationService.list(req.query);
  return successResponse(res, { message: 'Locations retrieved successfully', data: result.data, meta: result.meta });
});

export const getLocationById = asyncHandler(async (req, res) => {
  const result = await locationService.getById(req.params.id);
  return successResponse(res, { message: 'Location retrieved successfully', data: result });
});

export const createLocation = asyncHandler(async (req, res) => {
  const result = await locationService.create(req.body);
  return successResponse(res, { statusCode: 201, message: 'Location created successfully', data: result });
});

export const updateLocation = asyncHandler(async (req, res) => {
  const result = await locationService.update(req.params.id, req.body);
  return successResponse(res, { message: 'Location updated successfully', data: result });
});

export const deleteLocation = asyncHandler(async (req, res) => {
  await locationService.delete(req.params.id);
  return successResponse(res, { message: 'Location deleted successfully', data: null });
});
