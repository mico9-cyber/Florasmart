import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRoles } from '../../middleware/authorization.middleware.js';
import {
  getPlans,
  subscribe,
  getMySubscriptions,
  cancelSubscription,
  adminCancelSubscription,
  adminGetPlans,
  createPlan,
  updatePlan,
  deletePlan,
} from '../../controllers/subscription.controller.js';
import {
  subscribeValidation,
  cancelValidation,
  planIdValidation,
  createPlanValidation,
  updatePlanValidation,
} from '../../validators/subscription.validators.js';

const router = Router();

router.get('/plans', getPlans);

router.use(authenticate);

router.post('/subscribe', requireRoles('CUSTOMER'), subscribeValidation, subscribe);
router.get('/me', requireRoles('CUSTOMER'), getMySubscriptions);
router.post('/:id/cancel', requireRoles('CUSTOMER'), cancelValidation, cancelSubscription);

router.get('/admin/plans', requireRoles('ADMIN'), adminGetPlans);
router.post('/admin/plans', requireRoles('ADMIN'), createPlanValidation, createPlan);
router.patch('/admin/plans/:id', requireRoles('ADMIN'), updatePlanValidation, updatePlan);
router.delete('/admin/plans/:id', requireRoles('ADMIN'), planIdValidation, deletePlan);
router.post('/admin/:id/cancel', requireRoles('ADMIN'), cancelValidation, adminCancelSubscription);

export default router;
