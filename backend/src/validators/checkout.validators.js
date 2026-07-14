import { body } from 'express-validator';
import { validateRequest } from '../middleware/validation.middleware.js';

const validDeliveryMethods = ['STANDARD', 'EXPRESS', 'PICKUP'];
const validPaymentMethods = ['CASH_ON_DELIVERY', 'MOBILE_MONEY', 'CARD', 'AIRTEL_MONEY', 'TEST_PAYMENT'];

export const checkoutValidation = [
  body('shippingFullName').trim().notEmpty().withMessage('shippingFullName is required'),
  body('shippingPhone').trim().notEmpty().withMessage('shippingPhone is required'),
  body('shippingAddress').trim().notEmpty().withMessage('shippingAddress is required'),
  body('shippingCity').trim().notEmpty().withMessage('shippingCity is required'),
  body('shippingDistrict').trim().notEmpty().withMessage('shippingDistrict is required'),
  body('shippingNotes').optional({ nullable: true }).trim().isString(),
  body('deliveryMethod').trim().notEmpty().isIn(validDeliveryMethods)
    .withMessage(`deliveryMethod must be one of: ${validDeliveryMethods.join(', ')}`),
  body('paymentMethod').trim().notEmpty().isIn(validPaymentMethods)
    .withMessage(`paymentMethod must be one of: ${validPaymentMethods.join(', ')}`),
  validateRequest,
];
