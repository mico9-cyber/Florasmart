import { successResponse } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { OrderService } from '../services/order.service.js';
import { OrderRepository, OrderStatusHistoryRepository } from '../repositories/order.repository.js';

const orderRepo = new OrderRepository();
const statusHistoryRepo = new OrderStatusHistoryRepository();
const orderService = new OrderService(orderRepo, statusHistoryRepo);

export const listOrders = asyncHandler(async (req, res) => {
  const result = await orderService.list(req.auth, req.query);
  return successResponse(res, { message: 'Orders retrieved successfully', data: result.data, meta: result.meta });
});

export const getOrder = asyncHandler(async (req, res) => {
  const result = await orderService.getById(req.auth, req.params.id);
  return successResponse(res, { message: 'Order retrieved successfully', data: result });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const result = await orderService.updateStatus(req.auth, req.params.id, req.body.status, req.body.note);
  return successResponse(res, { message: 'Order status updated successfully', data: result });
});

export const cancelOrder = asyncHandler(async (req, res) => {
  const result = await orderService.cancelOrder(req.auth, req.params.id, req.body.reason);
  return successResponse(res, { message: 'Order cancelled successfully', data: result });
});
