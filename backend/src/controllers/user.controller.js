import { successResponse } from '../utils/response.js';
import { getPrismaClient } from '../database/prisma.js';
import { AuthService } from '../services/auth.service.js';
import { logger } from '../config/logger.js';

const service = new AuthService({ prisma: getPrismaClient(), logger });

export async function updateMe(req, res, next) {
  try {
    const result = await service.updateProfile(req.auth.userId, req.body);
    return successResponse(res, { message: 'Profile updated', data: { user: result } });
  } catch (error) { return next(error); }
}
