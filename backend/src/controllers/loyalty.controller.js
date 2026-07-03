import { successResponse } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { LoyaltyService } from '../services/loyalty.service.js';

const loyaltyService = new LoyaltyService();

export const getMyAccount = asyncHandler(async (req, res) => {
  const result = await loyaltyService.getMyAccount(req.auth.userId);
  return successResponse(res, { message: 'Loyalty account retrieved successfully', data: result });
});

export const getMyTransactions = asyncHandler(async (req, res) => {
  const result = await loyaltyService.getMyTransactions(req.auth.userId, req.query);
  return successResponse(res, { message: 'Transactions retrieved successfully', data: result });
});

export const getRewards = asyncHandler(async (req, res) => {
  const result = await loyaltyService.getRewards(req.auth.userId);
  return successResponse(res, { message: 'Rewards retrieved successfully', data: result });
});

export const redeemReward = asyncHandler(async (req, res) => {
  const result = await loyaltyService.redeemReward(req.auth.userId, req.params.id);
  return successResponse(res, { message: 'Reward redeemed successfully', data: result });
});

export const getMyRedemptions = asyncHandler(async (req, res) => {
  const result = await loyaltyService.getMyRedemptions(req.auth.userId, req.query.page, req.query.limit);
  return successResponse(res, { message: 'Redemptions retrieved successfully', data: result });
});

export const getAdminAccounts = asyncHandler(async (req, res) => {
  const result = await loyaltyService.getAdminAccounts(req.query.page, req.query.limit);
  return successResponse(res, { message: 'Loyalty accounts retrieved successfully', data: result });
});

export const adjustPoints = asyncHandler(async (req, res) => {
  const result = await loyaltyService.adjustPoints(req.auth.userId, req.params.userId, req.body.points, req.body.reason);
  return successResponse(res, { message: 'Points adjusted successfully', data: result });
});

export const getAdminRewards = asyncHandler(async (req, res) => {
  const result = await loyaltyService.getAdminRewards(req.query.active !== 'false');
  return successResponse(res, { message: 'Rewards retrieved successfully', data: result });
});

export const createReward = asyncHandler(async (req, res) => {
  const result = await loyaltyService.createReward(req.body);
  return successResponse(res, { statusCode: 201, message: 'Reward created successfully', data: result });
});

export const updateReward = asyncHandler(async (req, res) => {
  const result = await loyaltyService.updateReward(req.params.id, req.body);
  return successResponse(res, { message: 'Reward updated successfully', data: result });
});

export const deleteReward = asyncHandler(async (req, res) => {
  await loyaltyService.deleteReward(req.params.id);
  return successResponse(res, { message: 'Reward deleted successfully' });
});

export const getAdminRedemptions = asyncHandler(async (req, res) => {
  const result = await loyaltyService.getAdminRedemptions(req.query.page, req.query.limit);
  return successResponse(res, { message: 'Redemptions retrieved successfully', data: result });
});

export const getAdminTransactions = asyncHandler(async (req, res) => {
  const result = await loyaltyService.getAdminTransactions(req.query);
  return successResponse(res, { message: 'Transactions retrieved successfully', data: result });
});
