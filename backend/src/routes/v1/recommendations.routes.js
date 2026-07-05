import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRoles } from '../../middleware/authorization.middleware.js';
import {
  recommendPlants,
  vaseMatch,
  recommendGardenPlan,
  recommendProducts,
  getRecommendationHistory,
} from '../../controllers/recommendation.controller.js';
import {
  plantRecommendationValidation,
  vaseMatchValidation,
  gardenPlanRecommendationValidation,
  productRecommendationValidation,
} from '../../validators/recommendation.validators.js';

const router = Router();

router.use(authenticate);

router.post('/plants', requireRoles('CUSTOMER', 'ADMIN'), plantRecommendationValidation, recommendPlants);
router.post('/vase-match', requireRoles('CUSTOMER', 'FLORIST', 'ADMIN'), vaseMatchValidation, vaseMatch);
router.post('/garden-plan', requireRoles('CUSTOMER', 'ADMIN'), gardenPlanRecommendationValidation, recommendGardenPlan);
router.get('/products', requireRoles('CUSTOMER', 'FLORIST', 'ADMIN'), productRecommendationValidation, recommendProducts);
router.get('/history', requireRoles('CUSTOMER', 'FLORIST', 'ADMIN'), getRecommendationHistory);

export default router;
