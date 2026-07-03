import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRoles } from '../../middleware/authorization.middleware.js';
import {
  createConsultation,
  listMyConsultations,
  listPendingConsultations,
  listMyGardenerConsultations,
  acceptConsultation,
  rejectConsultation,
  rescheduleConsultation,
} from '../../controllers/consultation.controller.js';
import {
  createConsultationValidation,
  consultationIdValidation,
  rejectConsultationValidation,
  rescheduleConsultationValidation,
} from '../../validators/consultation.validators.js';

const router = Router();

router.use(authenticate);

// Customer routes
router.post('/', requireRoles('CUSTOMER'), createConsultationValidation, createConsultation);
router.get('/my', requireRoles('CUSTOMER'), listMyConsultations);

// Gardener routes
router.get('/pending', requireRoles('GARDENER'), listPendingConsultations);
router.get('/my-assigned', requireRoles('GARDENER'), listMyGardenerConsultations);
router.patch('/:id/accept', requireRoles('GARDENER'), consultationIdValidation, acceptConsultation);
router.patch('/:id/reject', requireRoles('GARDENER'), rejectConsultationValidation, rejectConsultation);
router.patch('/:id/reschedule', requireRoles('GARDENER'), rescheduleConsultationValidation, rescheduleConsultation);

export default router;
