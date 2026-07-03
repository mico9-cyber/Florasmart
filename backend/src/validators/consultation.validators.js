import { body, param } from 'express-validator';
import { validateRequest } from '../middleware/validation.middleware.js';

export const createConsultationValidation = [
  body('purpose').trim().notEmpty().withMessage('Purpose is required').isLength({ max: 500 }).withMessage('Purpose must be 500 characters or less'),
  body('scheduledDate').notEmpty().withMessage('Scheduled date is required').isISO8601().withMessage('Must be a valid date'),
  validateRequest,
];

export const consultationIdValidation = [
  param('id').trim().notEmpty().withMessage('Consultation ID is required'),
  validateRequest,
];

export const rejectConsultationValidation = [
  param('id').trim().notEmpty().withMessage('Consultation ID is required'),
  body('reason').optional().trim().isLength({ max: 500 }).withMessage('Reason must be 500 characters or less'),
  validateRequest,
];

export const rescheduleConsultationValidation = [
  param('id').trim().notEmpty().withMessage('Consultation ID is required'),
  body('rescheduledDate').notEmpty().withMessage('Rescheduled date is required').isISO8601().withMessage('Must be a valid date'),
  body('reason').optional().trim().isLength({ max: 500 }).withMessage('Reason must be 500 characters or less'),
  validateRequest,
];
