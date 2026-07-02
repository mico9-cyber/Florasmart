import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRoles } from '../../middleware/authorization.middleware.js';
import {
  listDeliveries,
  getDelivery,
  assignDelivery,
  updateDeliveryStatus,
  trackDelivery,
} from '../../controllers/delivery.controller.js';
import {
  deliveryIdValidation,
  orderIdParamValidation,
  listDeliveriesValidation,
  assignDeliveryValidation,
  updateDeliveryStatusValidation,
} from '../../validators/delivery.validators.js';

const router = Router();

router.use(authenticate);

router.get('/', requireRoles('ADMIN', 'FLORIST'), listDeliveriesValidation, listDeliveries);
router.get('/track/:orderId', requireRoles('CUSTOMER', 'ADMIN', 'FLORIST'), orderIdParamValidation, trackDelivery);
router.get('/:id', requireRoles('ADMIN', 'FLORIST'), deliveryIdValidation, getDelivery);
router.post('/:orderId/assign', requireRoles('ADMIN', 'FLORIST'), assignDeliveryValidation, assignDelivery);
router.patch('/:id/status', requireRoles('ADMIN', 'FLORIST'), updateDeliveryStatusValidation, updateDeliveryStatus);

export default router;
