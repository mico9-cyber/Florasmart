import { successResponse } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { CartService } from '../services/cart.service.js';
import { CartRepository, CartItemRepository } from '../repositories/cart.repository.js';

const cartRepo = new CartRepository();
const cartItemRepo = new CartItemRepository();
const cartService = new CartService(cartRepo, cartItemRepo);

export const getCart = asyncHandler(async (req, res) => {
  const result = await cartService.getCart(req.auth.userId);
  return successResponse(res, { message: 'Cart retrieved successfully', data: result });
});

export const addCartItem = asyncHandler(async (req, res) => {
  const result = await cartService.addItem(req.auth.userId, req.body.productId, req.body.quantity);
  return successResponse(res, { message: 'Item added to cart successfully', data: result });
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const result = await cartService.updateItem(req.auth.userId, req.params.itemId, req.body.quantity);
  return successResponse(res, { message: 'Cart item updated successfully', data: result });
});

export const removeCartItem = asyncHandler(async (req, res) => {
  const result = await cartService.removeItem(req.auth.userId, req.params.itemId);
  return successResponse(res, { message: 'Cart item removed successfully', data: result });
});

export const clearCart = asyncHandler(async (req, res) => {
  const result = await cartService.clearCart(req.auth.userId);
  return successResponse(res, { message: 'Cart cleared successfully', data: result });
});
