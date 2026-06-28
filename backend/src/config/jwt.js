import { environment } from './environment.js';

export const jwtConfig = {
  secret: environment.jwt.secret,
  refreshSecret: environment.jwt.refreshSecret,
  expiresIn: environment.jwt.expiresIn,
  refreshExpiresIn: environment.jwt.refreshExpiresIn,
};

