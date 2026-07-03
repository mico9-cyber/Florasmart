import { BaseRepository } from './base.repository.js';

export class GardenPlanRepository extends BaseRepository {
  constructor() {
    super('gardenPlan');
  }

  findById(id) {
    return this.client.findUnique({
      where: { id },
      include: {
        cells: { orderBy: [{ row: 'asc' }, { col: 'asc' }] },
        placements: {
          include: { product: true },
          orderBy: [{ row: 'asc' }, { col: 'asc' }],
        },
        notes: { orderBy: { createdAt: 'desc' } },
      },
    });
  }

  findAllByUserId(userId, includeDeleted = false) {
    const where = { userId };
    if (!includeDeleted) {
      where.deletedAt = null;
    }
    return this.client.findMany({
      where,
      include: {
        cells: { orderBy: [{ row: 'asc' }, { col: 'asc' }] },
        placements: {
          include: { product: true },
          orderBy: [{ row: 'asc' }, { col: 'asc' }],
        },
        _count: { select: { notes: true, placements: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  findDefaultByUserId(userId) {
    return this.client.findFirst({
      where: { userId, isDefault: true, deletedAt: null },
    });
  }

  create(data) {
    return this.client.create({ data });
  }

  update(id, data) {
    return this.client.update({ where: { id }, data });
  }

  softDelete(id) {
    return this.client.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  setDefaultPlan(userId, planId) {
    return this.client.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    }).then(() =>
      this.client.update({
        where: { id: planId },
        data: { isDefault: true },
      })
    );
  }
}

export class GardenCellRepository extends BaseRepository {
  constructor() {
    super('gardenCell');
  }

  findById(id) {
    return this.client.findUnique({ where: { id } });
  }

  findByPlanId(planId) {
    return this.client.findMany({
      where: { planId },
      orderBy: [{ row: 'asc' }, { col: 'asc' }],
    });
  }

  upsert(planId, row, col, data) {
    return this.client.upsert({
      where: { planId_row_col: { planId, row, col } },
      update: data,
      create: { planId, row, col, ...data },
    });
  }

  remove(planId, row, col) {
    return this.client.deleteMany({
      where: { planId, row, col },
    });
  }
}

export class GardenPlantPlacementRepository extends BaseRepository {
  constructor() {
    super('gardenPlantPlacement');
  }

  findById(id) {
    return this.client.findUnique({
      where: { id },
      include: { product: true, plan: true },
    });
  }

  findByPlanId(planId) {
    return this.client.findMany({
      where: { planId },
      include: { product: true },
      orderBy: [{ row: 'asc' }, { col: 'asc' }],
    });
  }

  create(data) {
    return this.client.create({ data });
  }

  update(id, data) {
    return this.client.update({ where: { id }, data });
  }

  delete(id) {
    return this.client.delete({ where: { id } });
  }
}

export class GardenNoteRepository extends BaseRepository {
  constructor() {
    super('gardenNote');
  }

  findById(id) {
    return this.client.findUnique({ where: { id } });
  }

  findByPlanId(planId) {
    return this.client.findMany({
      where: { planId },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(data) {
    return this.client.create({ data });
  }

  update(id, data) {
    return this.client.update({ where: { id }, data });
  }

  delete(id) {
    return this.client.delete({ where: { id } });
  }
}
