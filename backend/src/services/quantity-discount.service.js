const DISCOUNT_RULES = [
  { productType: 'plant', label: 'Plants', minQuantity: 50, discountPercent: 5 },
  { productType: 'flower', label: 'Flowers', minQuantity: 50, discountPercent: 5 },
  { productType: 'vase', label: 'Vases', minQuantity: 20, discountPercent: 5 },
];

export class QuantityDiscountService {
  calculate(cartItems) {
    const typeQuantities = {};
    const typeSubtotals = {};

    for (const item of cartItems) {
      const type = (item.product?.productType || '').toLowerCase();
      if (!type) continue;

      typeQuantities[type] = (typeQuantities[type] || 0) + item.quantity;
      typeSubtotals[type] = (typeSubtotals[type] || 0) + Number(item.unitPrice) * item.quantity;
    }

    let totalDiscount = 0;
    const appliedDiscounts = [];

    for (const rule of DISCOUNT_RULES) {
      const qty = typeQuantities[rule.productType] || 0;
      if (qty >= rule.minQuantity) {
        const categorySubtotal = typeSubtotals[rule.productType] || 0;
        const discount = Math.round(categorySubtotal * rule.discountPercent / 100);
        if (discount > 0) {
          totalDiscount += discount;
          appliedDiscounts.push({
            productType: rule.productType,
            label: rule.label,
            quantity: qty,
            minQuantity: rule.minQuantity,
            discountPercent: rule.discountPercent,
            discountAmount: discount,
            message: `Buy ${rule.minQuantity}+ ${rule.label}: ${rule.discountPercent}% off — you saved ${formatCurrency(discount)}`,
          });
        }
      }
    }

    return { totalDiscount, appliedDiscounts };
  }
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', minimumFractionDigits: 0 }).format(amount);
}
