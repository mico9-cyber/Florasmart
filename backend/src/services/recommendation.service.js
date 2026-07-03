import { BaseService } from './base.service.js';
import { RecommendationEngine } from './recommendation-engine.service.js';
import { getPrismaClient } from '../database/prisma.js';
import { logAuditEvent } from '../utils/audit.js';
import { AppError } from '../utils/appError.js';

export class RecommendationService extends BaseService {
  constructor(requestRepository, resultRepository, preferenceRepository) {
    super(requestRepository);
    this.resultRepository = resultRepository;
    this.preferenceRepository = preferenceRepository;
    this.engine = new RecommendationEngine();
  }

  async recommendPlants(userId, criteria) {
    const recommendations = await this.engine.getPlantRecommendations(criteria);
    const request = await this.repository.create({
      userId,
      type: 'PLANT_SUITABILITY',
      inputData: criteria,
    });
    if (recommendations.length > 0) {
      const resultData = recommendations.map((r, i) => ({
        requestId: request.id,
        productId: r.product.id,
        score: r.score,
        reasons: r.reasons,
        careNotes: r.careNotes,
        warnings: r.warnings,
        rank: i + 1,
      }));
      await this.resultRepository.createMany(resultData);
    }
    await logAuditEvent(getPrismaClient(), { action: 'recommendation_plants', userId, requestId: request.id, criteriaCount: recommendations.length });
    return {
      requestId: request.id,
      matchesFound: recommendations.length,
      recommendations,
    };
  }

  async vaseMatch(userId, criteria) {
    const result = await this.engine.getVaseMatch(criteria);
    const request = await this.repository.create({
      userId,
      type: 'VASE_MATCH',
      inputData: criteria,
    });
    if (criteria.bouquetProductId) {
      await this.resultRepository.create({
        requestId: request.id,
        productId: criteria.bouquetProductId,
        score: result.fitScore,
        reasons: [`Structural fit: ${result.structuralFit}`, `Visual balance: ${result.visualBalance}`],
        warnings: result.warnings,
        rank: 1,
      });
    }
    await logAuditEvent(getPrismaClient(), { action: 'recommendation_vase_match', userId, requestId: request.id });
    return {
      requestId: request.id,
      ...result,
    };
  }

  async recommendGardenPlan(userId, criteria) {
    const result = await this.engine.getGardenPlanRecommendations(criteria.gardenPlanId);
    if (!result) {
      throw new AppError('Garden plan not found', 404, 'GARDEN_PLAN_NOT_FOUND');
    }
    const request = await this.repository.create({
      userId,
      type: 'GARDEN_PLAN_RECOMMENDATION',
      inputData: criteria,
    });
    if (result.recommendations.length > 0) {
      const resultData = result.recommendations.map((r, i) => ({
        requestId: request.id,
        productId: r.product.id,
        score: r.score,
        reasons: r.reasons,
        careNotes: r.careNotes,
        warnings: r.warnings,
        rank: i + 1,
      }));
      await this.resultRepository.createMany(resultData);
    }
    await logAuditEvent(getPrismaClient(), { action: 'recommendation_garden_plan', userId, requestId: request.id });
    return {
      requestId: request.id,
      ...result,
    };
  }

  async recommendProducts(criteria) {
    return this.engine.getProductRecommendations(criteria);
  }

  async getHistory(userId, userRoles, queryUserId) {
    if (userRoles.includes('ADMIN') && queryUserId) {
      return this.repository.findByUserId(queryUserId);
    }
    return this.repository.findByUserId(userId);
  }
}
