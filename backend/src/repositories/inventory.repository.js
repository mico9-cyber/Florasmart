import { BaseRepository } from './base.repository.js';

export class InventoryLocationRepository extends BaseRepository {
  constructor() {
    super('inventoryLocation');
  }

  findAll(where = {}, orderBy = { name: 'asc' }, skip = 0, take = 100) {
    return this.client.findMany({ where, orderBy, skip, take });
  }

  findById(id) {
    return this.client.findUnique({ where: { id } });
  }

  findByCode(code) {
    return this.client.findUnique({ where: { code } });
  }

  create(data) {
    return this.client.create({ data });
  }

  update(id, data) {
    return this.client.update({ where: { id }, data });
  }

  softDelete(id) {
    return this.client.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  count(where = {}) {
    return this.client.count({ where });
  }
}

export class StockLevelRepository extends BaseRepository {
  constructor() {
    super('stockLevel');
  }

  findAll(where = {}, orderBy = { createdAt: 'desc' }, skip = 0, take = 12) {
    return this.client.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        product: { include: { category: true } },
        location: true,
      },
    });
  }

  findById(id) {
    return this.client.findUnique({
      where: { id },
      include: {
        product: { include: { category: true } },
        location: true,
      },
    });
  }

  findByProductAndLocation(productId, locationId) {
    return this.client.findUnique({
      where: { productId_locationId: { productId, locationId } },
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

  groupByProduct(where = {}) {
    return this.client.findMany({
      where,
      include: {
        product: { include: { category: true } },
        location: true,
      },
    });
  }

  aggregateQuantity(where = {}) {
    return this.client.aggregate({
      where,
      _sum: { quantity: true, reservedQuantity: true },
    });
  }
}

export class InventoryMovementRepository extends BaseRepository {
  constructor() {
    super('inventoryMovement');
  }

  findAll(where = {}, orderBy = { createdAt: 'desc' }, skip = 0, take = 20) {
    return this.client.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        product: { select: { id: true, name: true, slug: true, sku: true } },
        location: { select: { id: true, name: true, code: true } },
        performedBy: { select: { id: true, name: true, email: true } },
      },
    });
  }

  create(data) {
    return this.client.create({ data });
  }

  count(where = {}) {
    return this.client.count({ where });
  }
}
