import { BaseService } from './base.service.js';
import { AppError } from '../utils/appError.js';
import { getPrismaClient } from '../database/prisma.js';
import { logAuditEvent } from '../utils/audit.js';

export class GardenPlanService extends BaseService {
  constructor(planRepository, cellRepository, placementRepository, noteRepository) {
    super(planRepository);
    this.cellRepository = cellRepository;
    this.placementRepository = placementRepository;
    this.noteRepository = noteRepository;
  }

  async list(userId, userRoles = []) {
    if (userRoles.includes('ADMIN')) {
      const prisma = getPrismaClient();
      return prisma.gardenPlan.findMany({
        where: { deletedAt: null },
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
    return this.repository.findAllByUserId(userId);
  }

  _checkAccess(plan, userId, userRoles = []) {
    if (plan.userId !== userId && !userRoles.includes('ADMIN')) {
      throw new AppError('Forbidden', 403, 'FORBIDDEN');
    }
  }

  async getById(userId, planId, userRoles = []) {
    const plan = await this.repository.findById(planId);
    if (!plan || plan.deletedAt) {
      throw new AppError('Garden plan not found', 404, 'GARDEN_PLAN_NOT_FOUND');
    }
    this._checkAccess(plan, userId, userRoles);
    return this._enrich(plan);
  }

  async create(userId, data) {
    const existingDefault = await this.repository.findDefaultByUserId(userId);
    const plan = await this.repository.create({
      userId,
      name: data.name,
      description: data.description || null,
      width: data.width || 10,
      height: data.height || 10,
      gridData: data.gridData || null,
      isDefault: !existingDefault,
      tags: data.tags || null,
    });
    return this._enrich(plan);
  }

  async update(userId, planId, data, userRoles = []) {
    const plan = await this.repository.findById(planId);
    if (!plan || plan.deletedAt) {
      throw new AppError('Garden plan not found', 404, 'GARDEN_PLAN_NOT_FOUND');
    }
    this._checkAccess(plan, userId, userRoles);
    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.width !== undefined) updateData.width = data.width;
    if (data.height !== undefined) updateData.height = data.height;
    if (data.gridData !== undefined) updateData.gridData = data.gridData;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.isDefault !== undefined) updateData.isDefault = data.isDefault;
    if (updateData.isDefault) {
      await this.repository.setDefaultPlan(userId, planId);
      delete updateData.isDefault;
    }
    if (Object.keys(updateData).length > 0) {
      await this.repository.update(planId, updateData);
    }
    const updated = await this.repository.findById(planId);
    return this._enrich(updated);
  }

  async remove(userId, planId, userRoles = []) {
    const plan = await this.repository.findById(planId);
    if (!plan || plan.deletedAt) {
      throw new AppError('Garden plan not found', 404, 'GARDEN_PLAN_NOT_FOUND');
    }
    this._checkAccess(plan, userId, userRoles);
    await this.repository.softDelete(planId);
    await logAuditEvent(getPrismaClient(), { action: 'garden_plan_deleted', userId, planId });
  }

  async setDefault(userId, planId, userRoles = []) {
    const plan = await this.repository.findById(planId);
    if (!plan || plan.deletedAt) {
      throw new AppError('Garden plan not found', 404, 'GARDEN_PLAN_NOT_FOUND');
    }
    this._checkAccess(plan, userId, userRoles);
    await this.repository.setDefaultPlan(userId, planId);
  }

  async updateCell(planId, userId, row, col, data, userRoles = []) {
    const plan = await this.repository.findById(planId);
    if (!plan || plan.deletedAt) {
      throw new AppError('Garden plan not found', 404, 'GARDEN_PLAN_NOT_FOUND');
    }
    this._checkAccess(plan, userId, userRoles);
    const cellData = {};
    if (data.soilType !== undefined) cellData.soilType = data.soilType;
    if (data.sunExposure !== undefined) cellData.sunExposure = data.sunExposure;
    if (data.notes !== undefined) cellData.notes = data.notes;
    await this.cellRepository.upsert(planId, row, col, cellData);
  }

  async removeCell(planId, userId, row, col, userRoles = []) {
    const plan = await this.repository.findById(planId);
    if (!plan || plan.deletedAt) {
      throw new AppError('Garden plan not found', 404, 'GARDEN_PLAN_NOT_FOUND');
    }
    this._checkAccess(plan, userId, userRoles);
    await this.cellRepository.remove(planId, row, col);
  }

  async addPlacement(planId, userId, data, userRoles = []) {
    const plan = await this.repository.findById(planId);
    if (!plan || plan.deletedAt) {
      throw new AppError('Garden plan not found', 404, 'GARDEN_PLAN_NOT_FOUND');
    }
    this._checkAccess(plan, userId, userRoles);
    const prisma = getPrismaClient();
    const product = await prisma.product.findUnique({ where: { id: data.productId } });
    if (!product || product.deletedAt) {
      throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    }
    const placement = await this.placementRepository.create({
      planId,
      productId: data.productId,
      row: data.row,
      col: data.col,
      quantity: data.quantity || 1,
      notes: data.notes || null,
      plantedAt: data.plantedAt || null,
    });
    return this.placementRepository.findById(placement.id);
  }

  async updatePlacement(planId, userId, placementId, data, userRoles = []) {
    const placement = await this.placementRepository.findById(placementId);
    if (!placement) {
      throw new AppError('Placement not found', 404, 'PLACEMENT_NOT_FOUND');
    }
    const plan = await this.repository.findById(planId);
    if (!plan || plan.deletedAt) {
      throw new AppError('Garden plan not found', 404, 'GARDEN_PLAN_NOT_FOUND');
    }
    this._checkAccess(plan, userId, userRoles);
    if (placement.planId !== planId) {
      throw new AppError('Placement does not belong to this plan', 400, 'INVALID_PLAN');
    }
    const updateData = {};
    if (data.row !== undefined) updateData.row = data.row;
    if (data.col !== undefined) updateData.col = data.col;
    if (data.quantity !== undefined) updateData.quantity = data.quantity;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.plantedAt !== undefined) updateData.plantedAt = data.plantedAt;
    if (Object.keys(updateData).length > 0) {
      await this.placementRepository.update(placementId, updateData);
    }
    return this.placementRepository.findById(placementId);
  }

  async removePlacement(planId, userId, placementId, userRoles = []) {
    const placement = await this.placementRepository.findById(placementId);
    if (!placement) {
      throw new AppError('Placement not found', 404, 'PLACEMENT_NOT_FOUND');
    }
    const plan = await this.repository.findById(planId);
    if (!plan || plan.deletedAt) {
      throw new AppError('Garden plan not found', 404, 'GARDEN_PLAN_NOT_FOUND');
    }
    this._checkAccess(plan, userId, userRoles);
    if (placement.planId !== planId) {
      throw new AppError('Placement does not belong to this plan', 400, 'INVALID_PLAN');
    }
    await this.placementRepository.delete(placementId);
    await logAuditEvent(getPrismaClient(), { action: 'garden_placement_removed', userId, planId, placementId });
  }

  async addNote(planId, userId, data, userRoles = []) {
    const plan = await this.repository.findById(planId);
    if (!plan || plan.deletedAt) {
      throw new AppError('Garden plan not found', 404, 'GARDEN_PLAN_NOT_FOUND');
    }
    this._checkAccess(plan, userId, userRoles);
    const note = await this.noteRepository.create({
      planId,
      userId,
      title: data.title,
      content: data.content,
      noteType: data.noteType || 'general',
    });
    return note;
  }

  async updateNote(planId, userId, noteId, data, userRoles = []) {
    const note = await this.noteRepository.findById(noteId);
    if (!note) {
      throw new AppError('Note not found', 404, 'NOTE_NOT_FOUND');
    }
    if (note.planId !== planId) {
      throw new AppError('Note does not belong to this plan', 400, 'INVALID_PLAN');
    }
    const plan = await this.repository.findById(planId);
    if (!plan || plan.deletedAt) {
      throw new AppError('Garden plan not found', 404, 'GARDEN_PLAN_NOT_FOUND');
    }
    this._checkAccess(plan, userId, userRoles);
    const updateData = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.noteType !== undefined) updateData.noteType = data.noteType;
    if (Object.keys(updateData).length > 0) {
      await this.noteRepository.update(noteId, updateData);
    }
    return this.noteRepository.findById(noteId);
  }

  async removeNote(planId, userId, noteId, userRoles = []) {
    const note = await this.noteRepository.findById(noteId);
    if (!note) {
      throw new AppError('Note not found', 404, 'NOTE_NOT_FOUND');
    }
    if (note.planId !== planId) {
      throw new AppError('Note does not belong to this plan', 400, 'INVALID_PLAN');
    }
    const plan = await this.repository.findById(planId);
    if (!plan || plan.deletedAt) {
      throw new AppError('Garden plan not found', 404, 'GARDEN_PLAN_NOT_FOUND');
    }
    this._checkAccess(plan, userId, userRoles);
    await this.noteRepository.delete(noteId);
  }

  async listNotes(planId, userId, userRoles = []) {
    const plan = await this.repository.findById(planId);
    if (!plan || plan.deletedAt) {
      throw new AppError('Garden plan not found', 404, 'GARDEN_PLAN_NOT_FOUND');
    }
    this._checkAccess(plan, userId, userRoles);
    return this.noteRepository.findByPlanId(planId);
  }

  async listPlacements(planId, userId, userRoles = []) {
    const plan = await this.repository.findById(planId);
    if (!plan || plan.deletedAt) {
      throw new AppError('Garden plan not found', 404, 'GARDEN_PLAN_NOT_FOUND');
    }
    this._checkAccess(plan, userId, userRoles);
    return this.placementRepository.findByPlanId(planId);
  }

  async getSummary(userId) {
    const prisma = getPrismaClient();
    const plans = await prisma.gardenPlan.findMany({
      where: { userId, deletedAt: null },
      include: {
        _count: { select: { cells: true, placements: true, notes: true } },
      },
    });
    const totalPlans = plans.length;
    const totalCells = plans.reduce((s, p) => s + p._count.cells, 0);
    const totalPlacements = plans.reduce((s, p) => s + p._count.placements, 0);
    const totalNotes = plans.reduce((s, p) => s + p._count.notes, 0);
    const defaultPlan = plans.find((p) => p.isDefault);
    return { totalPlans, totalCells, totalPlacements, totalNotes, defaultPlanId: defaultPlan?.id || null };
  }

  _enrich(plan) {
    if (!plan) return null;
    return {
      ...plan,
      cellCount: plan.cells ? plan.cells.length : 0,
      placementCount: plan.placements ? plan.placements.length : 0,
      noteCount: plan.notes ? plan.notes.length : 0,
    };
  }
}
