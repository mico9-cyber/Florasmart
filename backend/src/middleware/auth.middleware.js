import { AppError } from '../utils/appError.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { getPrismaClient } from '../database/prisma.js';

export async function authenticate(req, _res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return next(new AppError('Authentication required', 401, 'AUTH_REQUIRED'));
  }

  try {
    const payload = verifyAccessToken(token);
    const prisma = getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user || !user.isActive) {
      return next(new AppError('User account is inactive', 401, 'ACCOUNT_INACTIVE'));
    }

    const roles = user.userRoles.map((entry) => entry.role.name);
    const permissions = user.userRoles.flatMap((entry) => entry.role.permissions.map((link) => link.permission.name));

    req.auth = {
      userId: user.id,
      roles,
      permissions,
      token,
    };
    req.user = user;
    return next();
  } catch (_error) {
    return next(new AppError('Invalid or expired token', 401, 'INVALID_TOKEN'));
  }
}

