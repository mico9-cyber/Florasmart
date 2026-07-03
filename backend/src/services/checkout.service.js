import { getPrismaClient } from '../database/prisma.js';
import { AppError } from '../utils/appError.js';
import { logAuditEvent } from '../utils/audit.js';
import { generateOrderNumber } from '../utils/orderNumber.js';
import { NotificationService } from './notification.service.js';

const DELIVERY_FEES = {
  PICKUP: 0,
  STANDARD: 2000,
  EXPRESS: 5000,
};

export class CheckoutService {
  constructor(cartRepository, cartItemRepository, orderRepository, orderItemRepository, orderStatusRepo) {
    this.cartRepository = cartRepository;
    this.cartItemRepository = cartItemRepository;
    this.orderRepository = orderRepository;
    this.orderItemRepository = orderItemRepository;
    this.orderStatusRepo = orderStatusRepo;
  }

  async checkout(userId, checkoutData) {
    const prisma = getPrismaClient();

    const cart = await this.cartRepository.findActiveByUserId(userId);
    if (!cart || !cart.items || cart.items.length === 0) {
      throw new AppError('Cart is empty', 400, 'EMPTY_CART');
    }

    for (const item of cart.items) {
      const product = item.product;
      if (!product || product.deletedAt) {
        throw new AppError(`Product "${item.product?.name || 'unknown'}" not found`, 404, 'PRODUCT_NOT_FOUND');
      }
      if (!product.active) {
        throw new AppError(`Product "${product.name}" is not active`, 400, 'PRODUCT_INACTIVE');
      }
      const stockLevel = await prisma.stockLevel.findFirst({
        where: { productId: item.productId, location: { active: true, deletedAt: null } },
        orderBy: { quantity: 'desc' },
      });
      const available = stockLevel ? (stockLevel.quantity - stockLevel.reservedQuantity) : 0;
      if (available < item.quantity) {
        throw new AppError(`Insufficient stock for "${product.name}". Available: ${available}`, 400, 'INSUFFICIENT_STOCK');
      }
    }

    const subtotal = cart.items.reduce((sum, i) => sum + Number(i.unitPrice) * i.quantity, 0);
    const deliveryFee = DELIVERY_FEES[checkoutData.deliveryMethod] || 0;
    const discountAmount = 0;
    const totalAmount = subtotal + deliveryFee - discountAmount;
    const orderNumber = await generateOrderNumber();

    let order;
    try {
      order = await prisma.$transaction(async (tx) => {
        const createdOrder = await tx.order.create({
          data: {
            orderNumber,
            userId,
            status: 'PENDING',
            paymentStatus: 'PENDING',
            subtotal,
            deliveryFee,
            discountAmount,
            totalAmount,
            currency: 'RWF',
            shippingFullName: checkoutData.shippingFullName,
            shippingPhone: checkoutData.shippingPhone,
            shippingAddress: checkoutData.shippingAddress,
            shippingCity: checkoutData.shippingCity,
            shippingDistrict: checkoutData.shippingDistrict,
            shippingNotes: checkoutData.shippingNotes || null,
            deliveryMethod: checkoutData.deliveryMethod,
            paymentMethod: checkoutData.paymentMethod,
            items: {
              create: cart.items.map((item) => ({
                productId: item.productId,
                productName: item.product.name,
                productSku: item.product.sku,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                subtotal: Number(item.unitPrice) * item.quantity,
                currency: item.currency || 'RWF',
              })),
            },
            statusHistory: {
              create: {
                status: 'PENDING',
                note: 'Order created',
                changedById: userId,
              },
            },
          },
          include: {
            items: true,
            statusHistory: { orderBy: { createdAt: 'desc' } },
          },
        });

        for (const item of cart.items) {
          const stockLevel = await tx.stockLevel.findFirst({
            where: { productId: item.productId, location: { active: true, deletedAt: null } },
            orderBy: { quantity: 'desc' },
          });
          if (stockLevel) {
            const newQty = stockLevel.quantity - item.quantity;
            await tx.stockLevel.update({
              where: { id: stockLevel.id },
              data: { quantity: newQty },
            });
            await tx.inventoryMovement.create({
              data: {
                productId: item.productId,
                locationId: stockLevel.locationId,
                movementType: 'SALE',
                quantity: item.quantity,
                previousQuantity: stockLevel.quantity,
                newQuantity: newQty,
                reason: `Order ${orderNumber}`,
                referenceType: 'ORDER',
                referenceId: createdOrder.id,
                performedById: userId,
              },
            });
            const totalAvailable = newQty - stockLevel.reservedQuantity;
            let stockStatus;
            if (totalAvailable <= 0) stockStatus = 'out_of_stock';
            else if (totalAvailable <= stockLevel.lowStockThreshold) stockStatus = 'low_stock';
            else stockStatus = 'in_stock';
            await tx.product.update({
              where: { id: item.productId },
              data: { stockStatus },
            });
          }
        }

        await tx.cart.update({
          where: { id: cart.id },
          data: { status: 'CHECKED_OUT' },
        });

        await logAuditEvent(tx, { action: 'checkout_completed', userId, orderId: createdOrder.id, orderNumber });
        return createdOrder;
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Checkout failed. Please try again.', 500, 'CHECKOUT_FAILED');
    }

    try {
      const userData = { id: userId, name: cart.user?.name || 'Customer', email: '' };
      notif.sendNotification(userId, 'ORDER', 'Order Confirmed', `Your order ${order.orderNumber} has been placed successfully.`, { orderId: order.id, orderNumber: order.orderNumber });
    } catch {
    }

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      subtotal: Number(order.subtotal),
      deliveryFee: Number(order.deliveryFee),
      discountAmount: Number(order.discountAmount),
      totalAmount: Number(order.totalAmount),
      currency: order.currency,
      items: order.items.map((i) => ({
        productName: i.productName,
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
        subtotal: Number(i.subtotal),
      })),
    };
  }
}
