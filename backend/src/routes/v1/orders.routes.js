import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRoles } from '../../middleware/authorization.middleware.js';
import {
  listOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
} from '../../controllers/order.controller.js';
import {
  orderIdValidation,
  listOrdersValidation,
  updateOrderStatusValidation,
  cancelOrderValidation,
} from '../../validators/order.validators.js';

const router = Router();

router.use(authenticate);

router.get('/', requireRoles('CUSTOMER', 'ADMIN', 'FLORIST'), listOrdersValidation, listOrders);
router.get('/:id', requireRoles('CUSTOMER', 'ADMIN', 'FLORIST'), orderIdValidation, getOrder);
router.patch('/:id/status', requireRoles('ADMIN', 'FLORIST'), updateOrderStatusValidation, updateOrderStatus);
router.post('/:id/cancel', requireRoles('CUSTOMER', 'ADMIN', 'FLORIST'), cancelOrderValidation, cancelOrder);

export default router;
