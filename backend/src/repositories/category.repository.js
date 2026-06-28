import { BaseRepository } from './base.repository.js';

export class CategoryRepository extends BaseRepository {
  constructor() {
    super('productCategory');
  }

  findAll(where = {}, orderBy = { createdAt: 'desc' }) {
    return this.client.findMany({ where, orderBy });
  }

  findById(id) {
    return this.client.findUnique({ where: { id } });
  }

  findBySlug(slug) {
    return this.client.findUnique({ where: { slug } });
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
