import { successResponse } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { SubscriptionService } from '../services/subscription.service.js';

const subscriptionService = new SubscriptionService();

export const getPlans = asyncHandler(async (req, res) => {
  const result = await subscriptionService.getPlans();
  return successResponse(res, { message: 'Subscription plans retrieved successfully', data: result });
});

export const subscribe = asyncHandler(async (req, res) => {
  const result = await subscriptionService.subscribe(req.auth.userId, req.body.planId, req.body.autoRenew);
  return successResponse(res, { statusCode: 201, message: 'Subscribed successfully', data: result });
});

export const getMySubscriptions = asyncHandler(async (req, res) => {
  const result = await subscriptionService.getMySubscriptions(req.auth.userId);
  return successResponse(res, { message: 'Subscriptions retrieved successfully', data: result });
});

export const cancelSubscription = asyncHandler(async (req, res) => {
  const result = await subscriptionService.cancelSubscription(req.auth.userId, req.params.id, req.body.reason);
  return successResponse(res, { message: 'Subscription cancelled successfully', data: result });
});

export const adminCancelSubscription = asyncHandler(async (req, res) => {
  const result = await subscriptionService.adminCancelSubscription(req.params.id, req.body.reason);
  return successResponse(res, { message: 'Subscription cancelled successfully', data: result });
});

export const adminGetPlans = asyncHandler(async (req, res) => {
  const result = await subscriptionService.getAdminPlans(req.query.active !== 'false');
  return successResponse(res, { message: 'Plans retrieved successfully', data: result });
});

export const createPlan = asyncHandler(async (req, res) => {
  const result = await subscriptionService.createPlan(req.body);
  return successResponse(res, { statusCode: 201, message: 'Plan created successfully', data: result });
});

export const updatePlan = asyncHandler(async (req, res) => {
  const result = await subscriptionService.updatePlan(req.params.id, req.body);
  return successResponse(res, { message: 'Plan updated successfully', data: result });
});

export const deletePlan = asyncHandler(async (req, res) => {
  await subscriptionService.deletePlan(req.params.id);
  return successResponse(res, { message: 'Plan deleted successfully' });
});
