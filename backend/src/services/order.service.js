import { BaseService } from './base.service.js';
import { AppError } from '../utils/appError.js';
import { getPrismaClient } from '../database/prisma.js';
import { logAuditEvent } from '../utils/audit.js';

const ALLOWED_TRANSITIONS = {
  PENDING: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY_FOR_DELIVERY'],
  READY_FOR_DELIVERY: ['OUT_FOR_DELIVERY', 'CANCELLED'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

export class OrderService extends BaseService {
  constructor(orderRepository, statusHistoryRepository) {
    super(orderRepository);
    this.statusHistoryRepository = statusHistoryRepository;
  }

  async list(user, query = {}) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 12));
    const skip = (page - 1) * limit;
    const where = {};
    const orderBy = {};

    const isCustomer = user.roles.includes('CUSTOMER');
    if (isCustomer) {
      where.userId = user.userId;
    }

    if (query.status) where.status = query.status;
    if (query.paymentStatus) where.paymentStatus = query.paymentStatus;
    if (query.customerId && !isCustomer) where.userId = query.customerId;

    if (query.dateFrom || query.dateTo) {
      where.createdAt = {};
      if (query.dateFrom) where.createdAt.gte = new Date(query.dateFrom);
      if (query.dateTo) where.createdAt.lte = new Date(query.dateTo);
    }

    if (query.q) {
      where.OR = [
        { orderNumber: { contains: query.q } },
        { shippingFullName: { contains: query.q } },
      ];
    }

    switch (query.sort) {
      case 'oldest': orderBy.createdAt = 'asc'; break;
      case 'total_asc': orderBy.totalAmount = 'asc'; break;
      case 'total_desc': orderBy.totalAmount = 'desc'; break;
      default: orderBy.createdAt = 'desc'; break;
    }

    const [data, total] = await Promise.all([
      this.repository.findAll(where, orderBy, skip, limit),
      this.repository.count(where),
    ]);

    const mapped = data.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      paymentStatus: o.paymentStatus,
      subtotal: Number(o.subtotal),
      deliveryFee: Number(o.deliveryFee),
      discountAmount: Number(o.discountAmount),
      totalAmount: Number(o.totalAmount),
      currency: o.currency,
      deliveryMethod: o.deliveryMethod,
      paymentMethod: o.paymentMethod,
      customer: o.user ? { id: o.user.id, name: o.user.name, email: o.user.email } : null,
      itemCount: o.items.length,
      deliveryStatus: o.delivery?.status || null,
      createdAt: o.createdAt,
    }));

    return {
      data: mapped,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getById(user, id) {
    const order = await this.repository.findById(id);
    if (!order) {
      throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
    }
    const isCustomer = user.roles.includes('CUSTOMER');
    if (isCustomer && order.userId !== user.userId) {
      throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
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
      shippingFullName: order.shippingFullName,
      shippingPhone: order.shippingPhone,
      shippingAddress: order.shippingAddress,
      shippingCity: order.shippingCity,
      shippingDistrict: order.shippingDistrict,
      shippingNotes: order.shippingNotes,
      deliveryMethod: order.deliveryMethod,
      paymentMethod: order.paymentMethod,
      cancelledAt: order.cancelledAt,
      cancelReason: order.cancelReason,
      customer: order.user ? { id: order.user.id, name: order.user.name, email: order.user.email, phone: order.user.phone } : null,
      items: order.items.map((i) => ({
        productName: i.productName,
        productSku: i.productSku,
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
        subtotal: Number(i.subtotal),
        currency: i.currency,
      })),
      statusHistory: order.statusHistory.map((h) => ({
        status: h.status,
        note: h.note,
        changedById: h.changedById,
        createdAt: h.createdAt,
      })),
      delivery: order.delivery ? {
        id: order.delivery.id,
        status: order.delivery.status,
        assignedTo: order.delivery.assignedTo ? { id: order.delivery.assignedTo.id, name: order.delivery.assignedTo.name } : null,
        scheduledAt: order.delivery.scheduledAt,
        events: order.delivery.events.map((e) => ({
          status: e.status,
          note: e.note,
          location: e.location,
          createdAt: e.createdAt,
        })),
      } : null,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  async updateStatus(user, id, status, note) {
    const order = await this.repository.findById(id);
    if (!order) {
      throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
    }
    if (order.status === 'DELIVERED' || order.status === 'CANCELLED') {
      throw new AppError(`Order is already ${order.status.toLowerCase()} and cannot be updated`, 400, 'ORDER_FINALIZED');
    }

    const allowedNext = ALLOWED_TRANSITIONS[order.status] || [];
    if (!allowedNext.includes(status)) {
      throw new AppError(
        `Cannot transition from ${order.status} to ${status}. Allowed: ${allowedNext.join(', ') || 'none'}`,
        400, 'INVALID_STATUS_TRANSITION',
      );
    }

    const updateData = { status };
    if (status === 'CANCELLED') {
      updateData.cancelledAt = new Date();
      updateData.cancelReason = note || 'Cancelled';
    }

    await this.repository.update(id, updateData);

    await this.statusHistoryRepository.create({
      orderId: id,
      status,
      note: note || null,
      changedById: user.userId,
    });

    if (status === 'READY_FOR_DELIVERY' && order.deliveryMethod !== 'PICKUP') {
      const prisma = getPrismaClient();
      const existingDelivery = await prisma.delivery.findUnique({ where: { orderId: id } });
      if (!existingDelivery) {
        await prisma.delivery.create({
          data: {
            orderId: id,
            status: 'PENDING_ASSIGNMENT',
            deliveryAddress: order.shippingAddress,
            deliveryPhone: order.shippingPhone,
            deliveryNotes: order.shippingNotes,
          },
        });
      }
    }

    await logAuditEvent(getPrismaClient(), { action: 'order_status_updated', userId: user.userId, orderId: id, status });

    return this.getById(user, id);
  }

  async cancelOrder(user, id, reason) {
    const order = await this.repository.findById(id);
    if (!order) {
      throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
    }

    const isCustomer = user.roles.includes('CUSTOMER');
    if (isCustomer) {
      if (order.userId !== user.userId) {
        throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
      }
      if (!['PENDING', 'PROCESSING'].includes(order.status)) {
        throw new AppError('You can only cancel orders that are PENDING or PROCESSING', 400, 'CANCEL_NOT_ALLOWED');
      }
    }

    if (order.status === 'DELIVERED' || order.status === 'CANCELLED') {
      throw new AppError(`Order is already ${order.status.toLowerCase()}`, 400, 'ORDER_FINALIZED');
    }

    await this.repository.update(id, {
      status: 'CANCELLED',
      cancelledAt: new Date(),
      cancelReason: reason || 'Cancelled',
    });

    await this.statusHistoryRepository.create({
      orderId: id,
      status: 'CANCELLED',
      note: reason || 'Cancelled by user',
      changedById: user.userId,
    });

    await this._restoreStock(order);

    await logAuditEvent(getPrismaClient(), { action: 'order_cancelled', userId: user.userId, orderId: id, reason });

    return this.getById(user, id);
  }

  async _restoreStock(order) {
    const prisma = getPrismaClient();
    for (const item of order.items) {
      const stockLevel = await prisma.stockLevel.findFirst({
        where: { productId: item.productId, location: { active: true, deletedAt: null } },
        orderBy: { quantity: 'desc' },
      });
      if (stockLevel) {
        const newQty = stockLevel.quantity + item.quantity;
        await prisma.stockLevel.update({
          where: { id: stockLevel.id },
          data: { quantity: newQty },
        });
        await prisma.inventoryMovement.create({
          data: {
            productId: item.productId,
            locationId: stockLevel.locationId,
            movementType: 'RETURN',
            quantity: item.quantity,
            previousQuantity: stockLevel.quantity,
            newQuantity: newQty,
            reason: `Order cancellation stock restoration - ${order.orderNumber}`,
            referenceType: 'ORDER_CANCEL',
            referenceId: order.id,
            performedById: order.userId,
          },
        });
        const allLevels = await prisma.stockLevel.findMany({ where: { productId: item.productId } });
        const totalAvailable = allLevels.reduce((s, l) => s + (l.quantity - l.reservedQuantity), 0);
        let stockStatus;
        if (totalAvailable <= 0) stockStatus = 'out_of_stock';
        else if (allLevels.some((l) => (l.quantity - l.reservedQuantity) <= l.lowStockThreshold)) stockStatus = 'low_stock';
        else stockStatus = 'in_stock';
        await prisma.product.update({ where: { id: item.productId }, data: { stockStatus } });
      }
    }
  }
}
