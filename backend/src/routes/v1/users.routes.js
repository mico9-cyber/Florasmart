import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { updateMe } from '../../controllers/user.controller.js';
import { updateProfileValidation } from '../../validators/auth.validators.js';

const router = Router();

router.patch('/me', authenticate, updateProfileValidation, updateMe);

export default router;
