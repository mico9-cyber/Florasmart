import { BaseService } from './base.service.js';
import { AppError } from '../utils/appError.js';
import { getPrismaClient } from '../database/prisma.js';
import { logAuditEvent } from '../utils/audit.js';

const ALLOWED_DELIVERY_TRANSITIONS = {
  PENDING_ASSIGNMENT: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['PICKED_UP', 'FAILED', 'CANCELLED'],
  PICKED_UP: ['ON_THE_WAY', 'FAILED'],
  ON_THE_WAY: ['DELIVERED', 'FAILED'],
  DELIVERED: [],
  FAILED: [],
  CANCELLED: [],
};

export class DeliveryService extends BaseService {
  constructor(deliveryRepository, eventRepository) {
    super(deliveryRepository);
    this.eventRepository = eventRepository;
  }

  async list(user, query = {}) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 12));
    const skip = (page - 1) * limit;
    const where = {};

    if (query.status) where.status = query.status;
    if (query.assignedToId) where.assignedToId = query.assignedToId;
    if (query.dateFrom || query.dateTo) {
      where.createdAt = {};
      if (query.dateFrom) where.createdAt.gte = new Date(query.dateFrom);
      if (query.dateTo) where.createdAt.lte = new Date(query.dateTo);
    }

    const orderBy = { createdAt: 'desc' };
    const [data, total] = await Promise.all([
      this.repository.findAll(where, orderBy, skip, limit),
      this.repository.count(where),
    ]);

    return {
      data: data.map((d) => ({
        id: d.id,
        orderId: d.orderId,
        orderNumber: d.order?.orderNumber,
        orderStatus: d.order?.status,
        status: d.status,
        assignedTo: d.assignedTo,
        scheduledAt: d.scheduledAt,
        pickedUpAt: d.pickedUpAt,
        deliveredAt: d.deliveredAt,
        latestEvent: d.events?.[0] || null,
        createdAt: d.createdAt,
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getById(user, id) {
    const delivery = await this.repository.findById(id);
    if (!delivery) {
      throw new AppError('Delivery not found', 404, 'DELIVERY_NOT_FOUND');
    }
    return {
      id: delivery.id,
      orderId: delivery.orderId,
      orderNumber: delivery.order?.orderNumber,
      orderStatus: delivery.order?.status,
      customer: delivery.order?.user,
      status: delivery.status,
      assignedTo: delivery.assignedTo,
      scheduledAt: delivery.scheduledAt,
      pickedUpAt: delivery.pickedUpAt,
      deliveredAt: delivery.deliveredAt,
      failedAt: delivery.failedAt,
      deliveryAddress: delivery.deliveryAddress,
      deliveryPhone: delivery.deliveryPhone,
      deliveryNotes: delivery.deliveryNotes,
      currentLocation: delivery.currentLocation,
      proofOfDeliveryUrl: delivery.proofOfDeliveryUrl,
      recipientName: delivery.recipientName,
      failureReason: delivery.failureReason,
      events: delivery.events,
      createdAt: delivery.createdAt,
    };
  }

  async assign(user, orderId, assignedToId, scheduledAt, note) {
    const prisma = getPrismaClient();
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
    }
    if (order.status === 'CANCELLED' || order.status === 'DELIVERED') {
      throw new AppError('Cannot assign delivery for a cancelled or delivered order', 400, 'ORDER_FINALIZED');
    }

    const assignee = await prisma.user.findUnique({ where: { id: assignedToId } });
    if (!assignee) {
      throw new AppError('Assigned user not found', 404, 'USER_NOT_FOUND');
    }

    const existingDelivery = await this.repository.findByOrderId(orderId);
    if (existingDelivery && existingDelivery.status !== 'PENDING_ASSIGNMENT') {
      throw new AppError('Delivery already assigned', 400, 'DELIVERY_ALREADY_ASSIGNED');
    }

    let delivery;
    const deliveryData = {
      assignedToId,
      status: 'ASSIGNED',
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      deliveryNotes: note || null,
      deliveryAddress: order.shippingAddress,
      deliveryPhone: order.shippingPhone,
    };

    if (existingDelivery) {
      delivery = await this.repository.update(existingDelivery.id, deliveryData);
    } else {
      delivery = await this.repository.create({
        orderId,
        ...deliveryData,
      });
    }

    await this.eventRepository.create({
      deliveryId: delivery.id,
      status: 'ASSIGNED',
      note: note || 'Delivery assigned',
      location: null,
      createdById: user.userId,
    });

    if (order.status === 'READY_FOR_DELIVERY') {
      await prisma.order.update({ where: { id: orderId }, data: { status: 'OUT_FOR_DELIVERY' } });
    }

    await logAuditEvent(prisma, { action: 'delivery_assigned', userId: user.userId, deliveryId: delivery.id, orderId });
    return this.repository.findById(delivery.id);
  }

  async updateStatus(user, id, status, location, note) {
    const prisma = getPrismaClient();
    const delivery = await this.repository.findById(id);
    if (!delivery) {
      throw new AppError('Delivery not found', 404, 'DELIVERY_NOT_FOUND');
    }

    const allowedNext = ALLOWED_DELIVERY_TRANSITIONS[delivery.status] || [];
    if (!allowedNext.includes(status)) {
      throw new AppError(
        `Cannot transition delivery from ${delivery.status} to ${status}. Allowed: ${allowedNext.join(', ') || 'none'}`,
        400, 'INVALID_DELIVERY_STATUS',
      );
    }

    const updateData = { status, currentLocation: location || null };
    const now = new Date();

    if (status === 'PICKED_UP') updateData.pickedUpAt = now;
    if (status === 'DELIVERED') updateData.deliveredAt = now;
    if (status === 'FAILED') updateData.failedAt = now;

    await this.repository.update(id, updateData);

    await this.eventRepository.create({
      deliveryId: id,
      status,
      note: note || null,
      location: location || null,
      createdById: user.userId,
    });

    const orderStatusMap = {
      PICKED_UP: 'OUT_FOR_DELIVERY',
      ON_THE_WAY: 'OUT_FOR_DELIVERY',
      DELIVERED: 'DELIVERED',
      FAILED: 'READY_FOR_DELIVERY',
    };

    if (orderStatusMap[status]) {
      await prisma.order.update({
        where: { id: delivery.orderId },
        data: { status: orderStatusMap[status] },
      });
      await prisma.orderStatusHistory.create({
        data: {
          orderId: delivery.orderId,
          status: orderStatusMap[status],
          note: note || `Delivery ${status.toLowerCase()}`,
          changedById: user.userId,
        },
      });
    }

    await logAuditEvent(prisma, { action: 'delivery_status_updated', userId: user.userId, deliveryId: id, status });
    return this.repository.findById(id);
  }

  async trackByOrder(user, orderId) {
    const prisma = getPrismaClient();
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
    }
    const isCustomer = user.roles.includes('CUSTOMER');
    if (isCustomer && order.userId !== user.userId) {
      throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
    }

    const delivery = await this.repository.findByOrderId(orderId);
    if (!delivery) {
      return {
        orderNumber: order.orderNumber,
        orderStatus: order.status,
        deliveryStatus: null,
        message: 'Delivery not yet assigned',
        events: [],
      };
    }

    return {
      orderNumber: order.orderNumber,
      orderStatus: order.status,
      deliveryId: delivery.id,
      deliveryStatus: delivery.status,
      assignedTo: delivery.assignedTo ? { name: delivery.assignedTo.name } : null,
      scheduledAt: delivery.scheduledAt,
      currentLocation: delivery.currentLocation,
      events: delivery.events.map((e) => ({
        status: e.status,
        note: e.note,
        location: e.location,
        createdAt: e.createdAt,
      })),
    };
  }

  notifyOrderStatusChanged(orderId, status) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[NOTIFICATION] Order ${orderId} status changed to ${status}`);
    }
  }

  notifyDeliveryAssigned(deliveryId, orderId) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[NOTIFICATION] Delivery ${deliveryId} assigned for order ${orderId}`);
    }
  }

  notifyDeliveryStatusChanged(deliveryId, status) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[NOTIFICATION] Delivery ${deliveryId} status changed to ${status}`);
    }
  }
}
