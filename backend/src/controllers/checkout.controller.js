import { successResponse } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { CheckoutService } from '../services/checkout.service.js';
import { CartRepository, CartItemRepository } from '../repositories/cart.repository.js';
import { OrderRepository, OrderItemRepository, OrderStatusHistoryRepository } from '../repositories/order.repository.js';

const cartRepo = new CartRepository();
const cartItemRepo = new CartItemRepository();
const orderRepo = new OrderRepository();
const orderItemRepo = new OrderItemRepository();
const orderStatusRepo = new OrderStatusHistoryRepository();
const checkoutService = new CheckoutService(cartRepo, cartItemRepo, orderRepo, orderItemRepo, orderStatusRepo);

export const checkout = asyncHandler(async (req, res) => {
  const result = await checkoutService.checkout(req.auth.userId, req.body);
  return successResponse(res, { message: 'Checkout completed successfully', data: { order: result } });
});
