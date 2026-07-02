import { successResponse } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { DeliveryService } from '../services/delivery.service.js';
import { DeliveryRepository, DeliveryEventRepository } from '../repositories/delivery.repository.js';

const deliveryRepo = new DeliveryRepository();
const eventRepo = new DeliveryEventRepository();
const deliveryService = new DeliveryService(deliveryRepo, eventRepo);

export const listDeliveries = asyncHandler(async (req, res) => {
  const result = await deliveryService.list(req.auth, req.query);
  return successResponse(res, { message: 'Deliveries retrieved successfully', data: result.data, meta: result.meta });
});

export const getDelivery = asyncHandler(async (req, res) => {
  const result = await deliveryService.getById(req.auth, req.params.id);
  return successResponse(res, { message: 'Delivery retrieved successfully', data: result });
});

export const assignDelivery = asyncHandler(async (req, res) => {
  const result = await deliveryService.assign(
    req.auth,
    req.params.orderId,
    req.body.assignedToId,
    req.body.scheduledAt,
    req.body.note,
  );
  return successResponse(res, { message: 'Delivery assigned successfully', data: result });
});

export const updateDeliveryStatus = asyncHandler(async (req, res) => {
  const result = await deliveryService.updateStatus(
    req.auth,
    req.params.id,
    req.body.status,
    req.body.location,
    req.body.note,
  );
  return successResponse(res, { message: 'Delivery status updated successfully', data: result });
});

export const trackDelivery = asyncHandler(async (req, res) => {
  const result = await deliveryService.trackByOrder(req.auth, req.params.orderId);
  return successResponse(res, { message: 'Delivery tracking retrieved successfully', data: result });
});
