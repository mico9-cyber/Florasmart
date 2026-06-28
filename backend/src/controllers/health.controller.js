import { successResponse } from '../utils/response.js';
import { environment } from '../config/environment.js';

export function getHealth(req, res) {
  return successResponse(res, {
    message: 'FloraSmart backend is running',
    data: {
      status: 'ok',
      environment: environment.nodeEnv,
      timestamp: new Date().toISOString(),
    },
  });
}

