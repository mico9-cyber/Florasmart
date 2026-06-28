import { environment } from './environment.js';

export const serverConfig = {
  port: environment.port,
  clientUrl: environment.clientUrl,
  jsonLimit: '1mb',
  rateLimitWindowMs: 15 * 60 * 1000,
  rateLimitMax: 200,
};
