import { environment } from './environment.js';

export const authConfig = {
  accessSecret: environment.jwt.secret,
  refreshSecret: environment.jwt.refreshSecret,
  accessExpiresIn: environment.jwt.expiresIn,
  refreshExpiresIn: environment.jwt.refreshExpiresIn,
};
