import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRoles } from '../../middleware/authorization.middleware.js';
import { initiateAirtelPayment, checkAirtelPaymentStatus, handleAirtelWebhook, cancelAirtelPayment } from '../../controllers/payment.controller.js';

const router = Router();

router.post('/airtel/initiate', authenticate, requireRoles('CUSTOMER'), initiateAirtelPayment);
router.get('/airtel/status/:transactionId', authenticate, checkAirtelPaymentStatus);
router.post('/airtel/cancel/:transactionId', authenticate, requireRoles('CUSTOMER'), cancelAirtelPayment);
router.post('/airtel/webhook', handleAirtelWebhook);

export default router;
