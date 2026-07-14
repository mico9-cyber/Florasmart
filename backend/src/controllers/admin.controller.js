import { randomUUID } from 'node:crypto';
import { successResponse } from '../utils/response.js';
import { getPrismaClient } from '../database/prisma.js';
import { hashPassword } from '../utils/password.js';
import { AppError } from '../utils/appError.js';
import { logger } from '../config/logger.js';
import { ROLES } from '../constants/auth.js';
import { shapeUser } from '../services/auth.service.js';

const prisma = getPrismaClient();

const userInclude = {
  userRoles: {
    include: {
      role: { include: { permissions: { include: { permission: true } } } },
    },
  },
};

const ALLOWED_ROLES = [ROLES.FLORIST, ROLES.GARDENER];

export async function listUsers(req, res, next) {
  try {
    const { role, status, search } = req.query;
    const where = {
      userRoles: {
        some: {
          role: { name: { in: ALLOWED_ROLES } },
        },
      },
    };
    if (role) {
      where.userRoles.some.role.name = { in: [role.toUpperCase()] };
    }
    if (status === 'active') where.isActive = true;
    if (status === 'inactive') where.isActive = false;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }
    const users = await prisma.user.findMany({
      where,
      include: userInclude,
      orderBy: { createdAt: 'desc' },
    });
    const data = users.map((u) => ({
      ...shapeUser(u),
      createdAt: u.createdAt,
    }));
    return successResponse(res, { message: 'Users retrieved', data });
  } catch (error) { return next(error); }
}

export async function getUser(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: userInclude,
    });
    if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    const roleNames = user.userRoles.map((e) => e.role.name);
    const isAllowed = roleNames.some((r) => ALLOWED_ROLES.includes(r));
    if (!isAllowed) throw new AppError('Access denied', 403, 'FORBIDDEN');
    return successResponse(res, { message: 'User retrieved', data: { ...shapeUser(user), createdAt: user.createdAt } });
  } catch (error) { return next(error); }
}

export async function createUser(req, res, next) {
  try {
    const { fullName, email, phone, role } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');
    const roleRecord = await prisma.role.findUnique({ where: { name: role } });
    if (!roleRecord) throw new AppError('Role not found', 500, 'ROLE_MISSING');
    const tempPassword = randomUUID().replace(/-/g, '').slice(0, 16);
    const passwordHash = await hashPassword(tempPassword);
    const user = await prisma.user.create({
      data: {
        name: fullName,
        email,
        phone,
        passwordHash,
        isActive: true,
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
        userRoles: { create: [{ roleId: roleRecord.id }] },
      },
      include: userInclude,
    });
    logger.info(`Admin created ${role} account for ${email} with temporary password: ${tempPassword}`);
    return successResponse(res, {
      statusCode: 201,
      message: `${roleRecord.name.charAt(0) + roleRecord.name.slice(1).toLowerCase()} account created successfully`,
      data: { ...shapeUser(user), createdAt: user.createdAt, tempPassword },
    });
  } catch (error) { return next(error); }
}

export async function updateUser(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: { userRoles: { include: { role: true } } },
    });
    if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    const roleNames = user.userRoles.map((e) => e.role.name);
    const isAllowed = roleNames.some((r) => ALLOWED_ROLES.includes(r));
    if (!isAllowed) throw new AppError('Access denied', 403, 'FORBIDDEN');
    const data = {};
    if (req.body.fullName !== undefined) data.name = req.body.fullName;
    if (req.body.phone !== undefined) data.phone = req.body.phone || null;
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data,
      include: userInclude,
    });
    return successResponse(res, { message: 'User updated', data: { ...shapeUser(updated), createdAt: updated.createdAt } });
  } catch (error) { return next(error); }
}

export async function toggleUserStatus(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: { userRoles: { include: { role: true } } },
    });
    if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    const roleNames = user.userRoles.map((e) => e.role.name);
    const isAllowed = roleNames.some((r) => ALLOWED_ROLES.includes(r));
    if (!isAllowed) throw new AppError('Access denied', 403, 'FORBIDDEN');
    if (req.params.id === req.auth.userId) {
      throw new AppError('Cannot change your own account status', 403, 'SELF_STATUS');
    }
    const newStatus = !user.isActive;
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: newStatus },
      include: userInclude,
    });
    return successResponse(res, {
      message: `Account ${newStatus ? 'activated' : 'deactivated'} successfully`,
      data: { ...shapeUser(updated), createdAt: updated.createdAt },
    });
  } catch (error) { return next(error); }
}

export async function deleteUser(req, res, next) {
  try {
    if (req.params.id === req.auth.userId) {
      throw new AppError('Cannot delete your own account', 403, 'SELF_DELETE');
    }
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: { userRoles: { include: { role: true } } },
    });
    if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    const roleNames = user.userRoles.map((e) => e.role.name);
    const isAllowed = roleNames.some((r) => ALLOWED_ROLES.includes(r));
    if (!isAllowed) throw new AppError('Access denied', 403, 'FORBIDDEN');
    await prisma.user.delete({ where: { id: req.params.id } });
    return successResponse(res, { message: 'Account deleted successfully', data: { id: req.params.id } });
  } catch (error) { return next(error); }
}
