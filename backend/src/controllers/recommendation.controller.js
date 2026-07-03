import { successResponse } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { RecommendationService } from '../services/recommendation.service.js';
import {
  RecommendationRequestRepository,
  RecommendationResultRepository,
  UserPreferenceRepository,
} from '../repositories/recommendation.repository.js';

const requestRepo = new RecommendationRequestRepository();
const resultRepo = new RecommendationResultRepository();
const preferenceRepo = new UserPreferenceRepository();
const recommendationService = new RecommendationService(requestRepo, resultRepo, preferenceRepo);

export const recommendPlants = asyncHandler(async (req, res) => {
  const result = await recommendationService.recommendPlants(req.auth.userId, req.body);
  return successResponse(res, { message: 'Plant recommendations generated successfully', data: result });
});

export const vaseMatch = asyncHandler(async (req, res) => {
  const result = await recommendationService.vaseMatch(req.auth.userId, req.body);
  return successResponse(res, { message: 'Vase match calculated successfully', data: result });
});

export const recommendGardenPlan = asyncHandler(async (req, res) => {
  const result = await recommendationService.recommendGardenPlan(req.auth.userId, req.body);
  return successResponse(res, { message: 'Garden plan recommendations generated successfully', data: result });
});

export const recommendProducts = asyncHandler(async (req, res) => {
  const result = await recommendationService.recommendProducts(req.query);
  return successResponse(res, { message: 'Product recommendations retrieved', data: result });
});

export const getRecommendationHistory = asyncHandler(async (req, res) => {
  const result = await recommendationService.getHistory(req.auth.userId, req.auth.roles, req.query.userId);
  return successResponse(res, { message: 'Recommendation history retrieved', data: result });
});
