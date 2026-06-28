import { BaseRepository } from './base.repository.js';

export class ProductRepository extends BaseRepository {
  constructor() {
    super('product');
  }

  findAll(where = {}, orderBy = { createdAt: 'desc' }, skip = 0, take = 12) {
    return this.client.findMany({
      where,
      orderBy,
      skip,
      take,
      include: { category: true },
    });
  }

  findById(id) {
    return this.client.findUnique({
      where: { id },
      include: { category: true, images: true, attributes: true },
    });
  }

  findBySlug(slug) {
    return this.client.findUnique({
      where: { slug },
      include: { category: true, images: true, attributes: true },
    });
  }

  findBySku(sku) {
    return this.client.findUnique({ where: { sku } });
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
