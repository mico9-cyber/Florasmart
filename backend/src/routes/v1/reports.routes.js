import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import {
  generateReport,
  listJobs,
  getJob,
  downloadReport,
  deleteJob,
} from '../../controllers/report.controller.js';
import {
  generateReportValidation,
  jobIdValidation,
  listJobsValidation,
} from '../../validators/report.validators.js';

const router = Router();

router.use(authenticate);

router.post('/generate', generateReportValidation, generateReport);
router.get('/jobs', listJobsValidation, listJobs);
router.get('/jobs/:id', jobIdValidation, getJob);
router.get('/jobs/:id/download', jobIdValidation, downloadReport);
router.delete('/jobs/:id', jobIdValidation, deleteJob);

export default router;
