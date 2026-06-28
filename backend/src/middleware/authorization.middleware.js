import { AppError } from '../utils/appError.js';

export function requireRoles(...allowedRoles) {
  return (req, _res, next) => {
    const roles = req.auth?.roles || [];
    const ok = allowedRoles.length === 0 || allowedRoles.some((role) => roles.includes(role));
    if (!ok) {
      return next(new AppError('Forbidden', 403, 'FORBIDDEN_ROLE'));
    }
    return next();
  };
}

export function requirePermissions(...requiredPermissions) {
  return (req, _res, next) => {
    const permissions = req.auth?.permissions || [];
    const ok = requiredPermissions.length === 0 || requiredPermissions.every((permission) => permissions.includes(permission));
    if (!ok) {
      return next(new AppError('Forbidden', 403, 'FORBIDDEN_PERMISSION'));
    }
    return next();
  };
}

