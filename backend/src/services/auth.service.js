import { randomUUID } from 'node:crypto';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { hashToken } from '../utils/crypto.js';
import { addDuration } from '../utils/date.js';
import { AppError } from '../utils/appError.js';
import { ROLES } from '../constants/auth.js';

const userInclude = {
  userRoles: {
    include: {
      role: { include: { permissions: { include: { permission: true } } } },
    },
  },
};

function shapeUser(user) {
  const roles = user.userRoles.map((entry) => entry.role.name);
  const permissions = [...new Set(user.userRoles.flatMap((entry) => entry.role.permissions.map((link) => link.permission.name)))];
  return {
    id: user.id,
    fullName: user.name,
    email: user.email,
    phone: user.phone,
    address: user.address,
    language: user.language,
    gardeningExperience: user.gardeningExperience,
    gardenSpaceType: user.gardenSpaceType,
    roles,
    permissions,
    isActive: user.isActive,
  };
}

export class AuthService {
  constructor({ prisma, logger, mailer }) {
    this.prisma = prisma;
    this.logger = logger;
    this.mailer = mailer;
  }

  async getUserByEmail(email) {
    return this.prisma.user.findUnique({ where: { email }, include: userInclude });
  }

  async register(input) {
    const roleName = input.role;
    if (![ROLES.CUSTOMER, ROLES.FLORIST, ROLES.GARDENER].includes(roleName)) {
      throw new AppError('Invalid registration role', 400, 'INVALID_ROLE');
    }

    const existing = await this.prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');
    }

    const role = await this.prisma.role.findUnique({ where: { name: roleName } });
    if (!role) throw new AppError('Role not configured', 500, 'ROLE_MISSING');

    const passwordHash = await hashPassword(input.password);
    const user = await this.prisma.user.create({
      data: {
        name: input.fullName,
        email: input.email,
        phone: input.phone,
        address: input.address,
        passwordHash,
        userRoles: { create: [{ roleId: role.id }] },
      },
      include: userInclude,
    });

    const tokens = await this.issueTokens(user, input.ipAddress);
    return { user: shapeUser(user), ...tokens };
  }

  async login({ email, password, ipAddress }) {
    const user = await this.prisma.user.findUnique({ where: { email }, include: userInclude });
    if (!user) throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    if (!user.isActive) throw new AppError('Account inactive', 401, 'ACCOUNT_INACTIVE');
    const ok = await comparePassword(password, user.passwordHash);
    if (!ok) throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');

    await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    const tokens = await this.issueTokens(user, ipAddress);
    return { user: shapeUser(user), ...tokens };
  }

  async issueTokens(user, ipAddress) {
    const payload = { sub: user.id, email: user.email };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken({ jti: randomUUID(), ...payload });
    const expiresAt = addDuration(7, 'day');
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(refreshToken),
        expiresAt,
        createdByIp: ipAddress,
      },
    });
    return { accessToken, refreshToken };
  }

  async refresh(refreshToken, ipAddress) {
    const payload = verifyRefreshToken(refreshToken);
    const tokenHash = hashToken(refreshToken);
    const existing = await this.prisma.refreshToken.findUnique({ where: { tokenHash } });
    if (!existing || existing.revokedAt || existing.expiresAt < new Date()) throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub }, include: userInclude });
    if (!user || !user.isActive) throw new AppError('Account inactive', 401, 'ACCOUNT_INACTIVE');

    const newAccessToken = signAccessToken({ sub: user.id, email: user.email });
    const newRefreshToken = signRefreshToken({ jti: randomUUID(), sub: user.id, email: user.email });
    const newHash = hashToken(newRefreshToken);

    await this.prisma.$transaction([
      this.prisma.refreshToken.update({ where: { id: existing.id }, data: { revokedAt: new Date() } }),
      this.prisma.refreshToken.create({ data: { userId: user.id, tokenHash: newHash, expiresAt: addDuration(7, 'day'), createdByIp: ipAddress, replacedById: existing.id } }),
    ]);

    return { user: shapeUser(user), accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async logout(refreshToken) {
    const tokenHash = hashToken(refreshToken);
    await this.prisma.refreshToken.updateMany({ where: { tokenHash, revokedAt: null }, data: { revokedAt: new Date() } });
  }

  async me(userId) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: userInclude });
    if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    return shapeUser(user);
  }

  async updateProfile(userId, input) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: input.fullName,
        phone: input.phone,
        address: input.address,
        language: input.language,
        gardeningExperience: input.gardeningExperience,
        gardenSpaceType: input.gardenSpaceType,
      },
      include: userInclude,
    });
    return shapeUser(user);
  }

  async forgotPassword(email, ipAddress) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return { ok: true };
    const rawToken = randomUUID().replace(/-/g, '');
    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(rawToken),
        expiresAt: addDuration(1, 'hour'),
        createdByIp: ipAddress,
      },
    });
    if (this.mailer?.sendResetToken) await this.mailer.sendResetToken(user.email, rawToken);
    else if (process.env.NODE_ENV !== 'production') this.logger.info('Password reset token', { email: user.email, token: rawToken });
    return { ok: true };
  }

  async resetPassword(token, password) {
    const tokenHash = hashToken(token);
    const reset = await this.prisma.passwordResetToken.findUnique({ where: { tokenHash } });
    if (!reset || reset.usedAt || reset.expiresAt < new Date()) throw new AppError('Invalid reset token', 400, 'INVALID_RESET_TOKEN');
    const passwordHash = await hashPassword(password);
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: reset.userId }, data: { passwordHash } }),
      this.prisma.passwordResetToken.update({ where: { id: reset.id }, data: { usedAt: new Date() } }),
    ]);
    return { ok: true };
  }
}

export { shapeUser };
