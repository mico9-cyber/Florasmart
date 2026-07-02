import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import {
  register, login, refresh, logout, me,
  forgotPassword, resetPassword,
  verifyRegistrationOtp, resendRegistrationOtp,
} from '../../controllers/auth.controller.js';
import {
  registerValidation, loginValidation, refreshValidation,
  forgotPasswordValidation, resetPasswordValidation,
  verifyRegistrationOtpValidation, resendRegistrationOtpValidation,
} from '../../validators/auth.validators.js';

const router = Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/refresh', refreshValidation, refresh);
router.post('/logout', refreshValidation, logout);
router.get('/me', authenticate, me);
router.post('/password/forgot', forgotPasswordValidation, forgotPassword);
router.post('/password/reset', resetPasswordValidation, resetPassword);
router.post('/verify-registration-otp', verifyRegistrationOtpValidation, verifyRegistrationOtp);
router.post('/resend-registration-otp', resendRegistrationOtpValidation, resendRegistrationOtp);

export default router;
