import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.js';

export function signAccessToken(payload, options = {}) {
  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
    ...options,
  });
}

export function signRefreshToken(payload, options = {}) {
  return jwt.sign(payload, jwtConfig.refreshSecret, {
    expiresIn: jwtConfig.refreshExpiresIn,
    ...options,
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, jwtConfig.secret);
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, jwtConfig.refreshSecret);
}

