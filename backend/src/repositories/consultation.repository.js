import { BaseRepository } from './base.repository.js';

export class ConsultationRepository extends BaseRepository {
  constructor() {
    super('consultation');
  }

  findById(id) {
    return this.client.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        gardener: { select: { id: true, name: true, email: true } },
      },
    });
  }

  findAllByCustomer(customerId) {
    return this.client.findMany({
      where: { customerId, deletedAt: null },
      include: {
        gardener: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findAllPending() {
    return this.client.findMany({
      where: { status: 'PENDING', deletedAt: null },
      include: {
        customer: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findAllByGardener(gardenerId) {
    return this.client.findMany({
      where: { gardenerId, deletedAt: null },
      include: {
        customer: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(data) {
    return this.client.create({
      data,
      include: {
        customer: { select: { id: true, name: true, email: true } },
      },
    });
  }

  update(id, data) {
    return this.client.update({
      where: { id },
      data,
      include: {
        customer: { select: { id: true, name: true, email: true } },
        gardener: { select: { id: true, name: true, email: true } },
      },
    });
  }

  softDelete(id) {
    return this.client.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
