import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRoles } from '../../middleware/authorization.middleware.js';
import {
  getAdminOverview,
  getFloristOverview,
  getCustomerOverview,
  getSalesAnalytics,
  getOrderAnalytics,
  getInventoryAnalytics,
  getDeliveryAnalytics,
  getProductAnalytics,
  getEngagementAnalytics,
} from '../../controllers/analytics.controller.js';
import { analyticsDateValidation } from '../../validators/analytics.validators.js';

const router = Router();

router.use(authenticate);

router.get('/admin/overview', requireRoles('ADMIN'), getAdminOverview);
router.get('/florist/overview', requireRoles('ADMIN', 'FLORIST'), getFloristOverview);
router.get('/customer/me', requireRoles('CUSTOMER', 'GARDENER'), getCustomerOverview);
router.get('/sales', requireRoles('ADMIN', 'FLORIST'), analyticsDateValidation, getSalesAnalytics);
router.get('/orders', requireRoles('ADMIN', 'FLORIST'), analyticsDateValidation, getOrderAnalytics);
router.get('/inventory', requireRoles('ADMIN', 'FLORIST'), getInventoryAnalytics);
router.get('/delivery', requireRoles('ADMIN', 'FLORIST'), getDeliveryAnalytics);
router.get('/products', requireRoles('ADMIN', 'FLORIST'), getProductAnalytics);
router.get('/engagement', requireRoles('ADMIN'), getEngagementAnalytics);

export default router;
