import { successResponse } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AnalyticsService } from '../services/analytics.service.js';

const analyticsService = new AnalyticsService();

export const getAdminOverview = asyncHandler(async (req, res) => {
  const result = await analyticsService.getAdminOverview();
  return successResponse(res, { message: 'Admin analytics overview retrieved successfully', data: result });
});

export const getFloristOverview = asyncHandler(async (req, res) => {
  const result = await analyticsService.getFloristOverview();
  return successResponse(res, { message: 'Florist analytics overview retrieved successfully', data: result });
});

export const getCustomerOverview = asyncHandler(async (req, res) => {
  const result = await analyticsService.getCustomerSummary(req.auth.userId);
  return successResponse(res, { message: 'Customer analytics summary retrieved successfully', data: result });
});

export const getSalesAnalytics = asyncHandler(async (req, res) => {
  const { dateFrom, dateTo, groupBy, categoryId } = req.query;
  const result = await analyticsService.getSalesAnalytics(dateFrom, dateTo, groupBy, categoryId);
  return successResponse(res, { message: 'Sales analytics retrieved successfully', data: result });
});

export const getOrderAnalytics = asyncHandler(async (req, res) => {
  const { dateFrom, dateTo, status, groupBy } = req.query;
  const result = await analyticsService.getOrderAnalytics(dateFrom, dateTo, status, groupBy);
  return successResponse(res, { message: 'Order analytics retrieved successfully', data: result });
});

export const getInventoryAnalytics = asyncHandler(async (req, res) => {
  const result = await analyticsService.getInventoryAnalytics();
  return successResponse(res, { message: 'Inventory analytics retrieved successfully', data: result });
});

export const getDeliveryAnalytics = asyncHandler(async (req, res) => {
  const result = await analyticsService.getDeliveryAnalytics();
  return successResponse(res, { message: 'Delivery analytics retrieved successfully', data: result });
});

export const getProductAnalytics = asyncHandler(async (req, res) => {
  const result = await analyticsService.getProductAnalytics();
  return successResponse(res, { message: 'Product analytics retrieved successfully', data: result });
});

export const getEngagementAnalytics = asyncHandler(async (req, res) => {
  const result = await analyticsService.getEngagementAnalytics();
  return successResponse(res, { message: 'Engagement analytics retrieved successfully', data: result });
});
