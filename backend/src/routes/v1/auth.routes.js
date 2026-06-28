import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { register, login, refresh, logout, me, forgotPassword, resetPassword } from '../../controllers/auth.controller.js';
import { registerValidation, loginValidation, refreshValidation, forgotPasswordValidation, resetPasswordValidation } from '../../validators/auth.validators.js';

const router = Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/refresh', refreshValidation, refresh);
router.post('/logout', refreshValidation, logout);
router.get('/me', authenticate, me);
router.post('/password/forgot', forgotPasswordValidation, forgotPassword);
router.post('/password/reset', resetPasswordValidation, resetPassword);

export default router;
