import { BaseRepository } from './base.repository.js';

export class OrderRepository extends BaseRepository {
  constructor() {
    super('order');
  }

  findAll(where = {}, orderBy = { createdAt: 'desc' }, skip = 0, take = 12) {
    return this.client.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        items: true,
        statusHistory: { orderBy: { createdAt: 'desc' }, take: 5 },
        user: { select: { id: true, name: true, email: true } },
        delivery: { include: { assignedTo: { select: { id: true, name: true } } } },
      },
    });
  }

  findById(id) {
    return this.client.findUnique({
      where: { id },
      include: {
        items: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
        user: { select: { id: true, name: true, email: true, phone: true } },
        delivery: {
          include: {
            assignedTo: { select: { id: true, name: true, email: true } },
            events: { orderBy: { createdAt: 'desc' } },
          },
        },
      },
    });
  }

  findByOrderNumber(orderNumber) {
    return this.client.findUnique({ where: { orderNumber } });
  }

  create(data) {
    return this.client.create({ data });
  }

  update(id, data) {
    return this.client.update({ where: { id }, data });
  }

  count(where = {}) {
    return this.client.count({ where });
  }
}

export class OrderItemRepository extends BaseRepository {
  constructor() {
    super('orderItem');
  }

  findByOrderId(orderId) {
    return this.client.findMany({ where: { orderId } });
  }

  createMany(data) {
    return this.client.createMany({ data });
  }
}

export class OrderStatusHistoryRepository extends BaseRepository {
  constructor() {
    super('orderStatusHistory');
  }

  create(data) {
    return this.client.create({ data });
  }
}
