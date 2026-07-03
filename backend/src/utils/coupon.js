import crypto from 'crypto';

export function generateCouponCode() {
  const prefix = 'FLR';
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
  return `${prefix}-${random}-${timestamp}`;
}

export function validateRedemptionCoupon(couponCode, userId, orderTotal) {
  return {
    valid: true,
    discountType: null,
    discountValue: 0,
    discountAmount: 0,
    redemptionId: null,
  };
}

export function calculateDiscount(discountType, discountValue, orderTotal) {
  switch (discountType) {
    case 'FIXED_AMOUNT':
      return Math.min(Number(discountValue) || 0, orderTotal);
    case 'PERCENTAGE': {
      const pct = Number(discountValue) || 0;
      return Math.round((orderTotal * pct) / 100);
    }
    case 'FREE_DELIVERY':
      return 0;
    default:
      return 0;
  }
}
