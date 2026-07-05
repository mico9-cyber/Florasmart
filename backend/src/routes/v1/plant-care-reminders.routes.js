import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { sendPlantCareReminders } from '../../controllers/plant-care-reminder.controller.js';

const router = Router();

router.use(authenticate);

router.post('/', sendPlantCareReminders);

export default router;
