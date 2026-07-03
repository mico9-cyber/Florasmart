import { body } from 'express-validator';
import { validateRequest } from '../middleware/validation.middleware.js';
import { ROLES } from '../constants/auth.js';

const strongPassword = body('password')
  .isLength({ min: 12 }).withMessage('password must be at least 12 characters')
  .matches(/[A-Z]/).withMessage('password must contain at least one uppercase letter')
  .matches(/[a-z]/).withMessage('password must contain at least one lowercase letter')
  .matches(/[0-9]/).withMessage('password must contain at least one number')
  .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/).withMessage('password must contain at least one special character');

export const registerValidation = [
  body('fullName').trim().notEmpty().withMessage('fullName is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone').optional().isString().trim(),
  body('address').optional().isString().trim(),
  strongPassword,
  body('role').isIn([ROLES.CUSTOMER, ROLES.FLORIST, ROLES.GARDENER]).withMessage('role must be CUSTOMER, FLORIST, or GARDENER'),
  validateRequest,
];

export const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('password is required'),
  validateRequest,
];

export const refreshValidation = [
  body('refreshToken').notEmpty().withMessage('refreshToken is required'),
  validateRequest,
];

export const forgotPasswordValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  validateRequest,
];

export const resetPasswordValidation = [
  body('token').notEmpty().withMessage('token is required'),
  strongPassword,
  validateRequest,
];

export const verifyRegistrationOtpValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('otp').matches(/^\d{6}$/).withMessage('OTP must be exactly 6 digits'),
  validateRequest,
];

export const resendRegistrationOtpValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  validateRequest,
];

export const updateProfileValidation = [
  body('fullName').optional().isString().trim().notEmpty(),
  body('phone').optional({ nullable: true }).isString().trim(),
  body('address').optional({ nullable: true }).isString().trim(),
  body('language').optional({ nullable: true }).isString().trim(),
  body('gardeningExperience').optional({ nullable: true }).isString().trim(),
  body('gardenSpaceType').optional({ nullable: true }).isString().trim(),
  validateRequest,
];
