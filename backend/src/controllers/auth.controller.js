import { successResponse } from '../utils/response.js';
import { getPrismaClient } from '../database/prisma.js';
import { AuthService } from '../services/auth.service.js';
import { logger } from '../config/logger.js';

const service = new AuthService({ prisma: getPrismaClient(), logger });

export async function register(req, res, next) {
  try {
    const result = await service.register({ ...req.body, ipAddress: req.ip });
    return successResponse(res, { statusCode: 201, message: 'Registration successful', data: result });
  } catch (error) { return next(error); }
}

export async function login(req, res, next) {
  try {
    const result = await service.login({ ...req.body, ipAddress: req.ip });
    return successResponse(res, { message: 'Login successful', data: result });
  } catch (error) { return next(error); }
}

export async function refresh(req, res, next) {
  try {
    const result = await service.refresh(req.body.refreshToken, req.ip);
    return successResponse(res, { message: 'Token refreshed', data: result });
  } catch (error) { return next(error); }
}

export async function logout(req, res, next) {
  try {
    await service.logout(req.body.refreshToken);
    return successResponse(res, { message: 'Logout successful', data: { ok: true } });
  } catch (error) { return next(error); }
}

export async function me(req, res, next) {
  try {
    const result = await service.me(req.auth.userId);
    return successResponse(res, { message: 'Current user retrieved', data: { user: result } });
  } catch (error) { return next(error); }
}

export async function forgotPassword(req, res, next) {
  try {
    await service.forgotPassword(req.body.email, req.ip);
    return successResponse(res, { message: 'If the account exists, password reset instructions were sent.', data: { ok: true } });
  } catch (error) { return next(error); }
}

export async function resetPassword(req, res, next) {
  try {
    await service.resetPassword(req.body.token, req.body.password);
    return successResponse(res, { message: 'Password reset successful', data: { ok: true } });
  } catch (error) { return next(error); }
}
