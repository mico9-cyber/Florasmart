import { Prisma } from '@prisma/client';
import { AppError } from '../utils/appError.js';
import { errorResponse } from '../utils/response.js';
import { logger } from '../config/logger.js';

export function notFoundHandler(req, res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404, 'NOT_FOUND'));
}

export function prismaErrorHandler(error, _req, _res, next) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const codeMap = {
      P2002: { statusCode: 409, message: 'Unique constraint violation', code: 'PRISMA_UNIQUE_CONSTRAINT' },
      P2003: { statusCode: 400, message: 'Foreign key constraint violation', code: 'PRISMA_FOREIGN_KEY_CONSTRAINT' },
      P2025: { statusCode: 404, message: 'Record not found', code: 'PRISMA_RECORD_NOT_FOUND' },
    };

    const mapped = codeMap[error.code];
    if (mapped) {
      return next(new AppError(mapped.message, mapped.statusCode, mapped.code, error.meta));
    }
  }

  return next(error);
}

export function globalErrorHandler(error, req, res, _next) {
  const statusCode = error.statusCode || 500;
  const code = error.code || 'INTERNAL_SERVER_ERROR';
  const message = error.message || 'Internal Server Error';

  logger[statusCode >= 500 ? 'error' : 'warn'](message, {
    code,
    path: req.originalUrl,
    method: req.method,
    details: error.details,
    stack: error.stack,
  });

  return errorResponse(res, {
    statusCode,
    message,
    code,
    details: error.details || null,
  });
}

