import { BaseRepository } from './base.repository.js';

export class DeliveryRepository extends BaseRepository {
  constructor() {
    super('delivery');
  }

  findAll(where = {}, orderBy = { createdAt: 'desc' }, skip = 0, take = 12) {
    return this.client.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        order: { select: { id: true, orderNumber: true, status: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        events: { orderBy: { createdAt: 'desc' }, take: 3 },
      },
    });
  }

  findById(id) {
    return this.client.findUnique({
      where: { id },
      include: {
        order: { include: { user: { select: { id: true, name: true, email: true, phone: true } } } },
        assignedTo: { select: { id: true, name: true, email: true } },
        events: { orderBy: { createdAt: 'desc' } },
      },
    });
  }

  findByOrderId(orderId) {
    return this.client.findUnique({
      where: { orderId },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        events: { orderBy: { createdAt: 'desc' } },
      },
    });
  }

  create(data) {
    return this.client.create({ data });
  }

  update(id, data) {
    return this.client.update({ where: { id }, data });
  }

  upsert(where, create, update) {
    return this.client.upsert({ where, create, update });
  }

  count(where = {}) {
    return this.client.count({ where });
  }
}

export class DeliveryEventRepository extends BaseRepository {
  constructor() {
    super('deliveryEvent');
  }

  create(data) {
    return this.client.create({ data });
  }
}
