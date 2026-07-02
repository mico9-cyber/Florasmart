import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRoles } from '../../middleware/authorization.middleware.js';
import { checkout } from '../../controllers/checkout.controller.js';
import { checkoutValidation } from '../../validators/checkout.validators.js';

const router = Router();

router.use(authenticate);
router.use(requireRoles('CUSTOMER'));

router.post('/', checkoutValidation, checkout);

export default router;
