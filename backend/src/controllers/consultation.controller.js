import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse } from '../utils/response.js';
import { ConsultationRepository } from '../repositories/consultation.repository.js';
import { ConsultationService } from '../services/consultation.service.js';

const repository = new ConsultationRepository();
const service = new ConsultationService(repository);

export const createConsultation = asyncHandler(async (req, res) => {
  const consultation = await service.create(req.auth.userId, req.body);
  successResponse(res, { statusCode: 201, message: 'Consultation booked successfully', data: consultation });
});

export const listMyConsultations = asyncHandler(async (req, res) => {
  const consultations = await service.listMyConsultations(req.auth.userId);
  successResponse(res, { message: 'Consultations retrieved successfully', data: consultations });
});

export const listPendingConsultations = asyncHandler(async (req, res) => {
  const consultations = await service.listPendingConsultations();
  successResponse(res, { message: 'Pending consultations retrieved successfully', data: consultations });
});

export const listMyGardenerConsultations = asyncHandler(async (req, res) => {
  const consultations = await service.listMyGardenerConsultations(req.auth.userId);
  successResponse(res, { message: 'Your consultations retrieved successfully', data: consultations });
});

export const acceptConsultation = asyncHandler(async (req, res) => {
  const consultation = await service.accept(req.auth.userId, req.params.id);
  successResponse(res, { message: 'Consultation accepted successfully', data: consultation });
});

export const rejectConsultation = asyncHandler(async (req, res) => {
  const consultation = await service.reject(req.auth.userId, req.params.id, req.body.reason);
  successResponse(res, { message: 'Consultation rejected', data: consultation });
});

export const rescheduleConsultation = asyncHandler(async (req, res) => {
  const consultation = await service.reschedule(req.auth.userId, req.params.id, req.body);
  successResponse(res, { message: 'Consultation rescheduled', data: consultation });
});
