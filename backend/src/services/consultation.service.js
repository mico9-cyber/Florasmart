import { BaseService } from './base.service.js';
import { AppError } from '../utils/appError.js';
import { getPrismaClient } from '../database/prisma.js';
import { logAuditEvent } from '../utils/audit.js';

export class ConsultationService extends BaseService {
  constructor(repository) {
    super(repository);
  }

  async create(userId, data) {
    const consultation = await this.repository.create({
      customerId: userId,
      purpose: data.purpose,
      scheduledDate: new Date(data.scheduledDate),
      status: 'PENDING',
    });

    logAuditEvent(getPrismaClient(), {
      action: 'CONSULTATION_CREATED',
      userId,
      resourceId: consultation.id,
      resourceType: 'Consultation',
      details: { purpose: data.purpose },
    });

    return consultation;
  }

  async listMyConsultations(userId) {
    return this.repository.findAllByCustomer(userId);
  }

  async listPendingConsultations() {
    return this.repository.findAllPending();
  }

  async listMyGardenerConsultations(userId) {
    return this.repository.findAllByGardener(userId);
  }

  async accept(userId, consultationId) {
    const consultation = await this.repository.findById(consultationId);
    if (!consultation || consultation.deletedAt) {
      throw new AppError('Consultation not found', 404, 'CONSULTATION_NOT_FOUND');
    }
    if (consultation.status !== 'PENDING') {
      throw new AppError('Consultation is no longer pending', 400, 'INVALID_STATUS');
    }

    const updated = await this.repository.update(consultationId, {
      status: 'ACCEPTED',
      gardenerId: userId,
    });

    logAuditEvent(getPrismaClient(), {
      action: 'CONSULTATION_ACCEPTED',
      userId,
      resourceId: consultationId,
      resourceType: 'Consultation',
    });

    return updated;
  }

  async reject(userId, consultationId, reason) {
    const consultation = await this.repository.findById(consultationId);
    if (!consultation || consultation.deletedAt) {
      throw new AppError('Consultation not found', 404, 'CONSULTATION_NOT_FOUND');
    }
    if (consultation.status !== 'PENDING') {
      throw new AppError('Consultation is no longer pending', 400, 'INVALID_STATUS');
    }

    const updated = await this.repository.update(consultationId, {
      status: 'REJECTED',
      rejectedReason: reason || null,
      gardenerId: userId,
    });

    logAuditEvent(getPrismaClient(), {
      action: 'CONSULTATION_REJECTED',
      userId,
      resourceId: consultationId,
      resourceType: 'Consultation',
      details: { reason },
    });

    return updated;
  }

  async reschedule(userId, consultationId, data) {
    const consultation = await this.repository.findById(consultationId);
    if (!consultation || consultation.deletedAt) {
      throw new AppError('Consultation not found', 404, 'CONSULTATION_NOT_FOUND');
    }
    if (consultation.status !== 'PENDING') {
      throw new AppError('Consultation is no longer pending', 400, 'INVALID_STATUS');
    }
    if (!data.rescheduledDate) {
      throw new AppError('Rescheduled date is required', 400, 'RESCHEDULED_DATE_REQUIRED');
    }

    const updated = await this.repository.update(consultationId, {
      status: 'RESCHEDULED',
      rescheduledDate: new Date(data.rescheduledDate),
      rejectedReason: data.reason || null,
      gardenerId: userId,
    });

    logAuditEvent(getPrismaClient(), {
      action: 'CONSULTATION_RESCHEDULED',
      userId,
      resourceId: consultationId,
      resourceType: 'Consultation',
      details: { rescheduledDate: data.rescheduledDate, reason: data.reason },
    });

    return updated;
  }
}
