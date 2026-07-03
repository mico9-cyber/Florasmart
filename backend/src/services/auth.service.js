import { randomUUID } from 'node:crypto';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { hashToken } from '../utils/crypto.js';
import { generateOtp, hashOtp, verifyOtpHash, OTP_PURPOSE } from '../utils/otp.js';
import { addDuration } from '../utils/date.js';
import { AppError } from '../utils/appError.js';
import { ROLES } from '../constants/auth.js';
import { NotificationService } from './notification.service.js';

const OTP_ATTEMPTS_MAX = 5;

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
    isEmailVerified: user.isEmailVerified,
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
        isEmailVerified: false,
        userRoles: { create: [{ roleId: role.id }] },
      },
      include: userInclude,
    });

    await this.generateAndSendOtp(user.email, user.id, user.name);

    return { email: user.email, requiresOtpVerification: true };
  }

  async generateAndSendOtp(email, userId, fullName) {
    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const expiresAt = addDuration(10, 'minute');

    await this.prisma.otpVerification.updateMany({
      where: { email, purpose: OTP_PURPOSE.REGISTRATION, usedAt: null },
      data: { expiresAt: new Date(0) },
    });

    await this.prisma.otpVerification.create({
      data: {
        userId,
        email,
        otpHash,
        purpose: OTP_PURPOSE.REGISTRATION,
        expiresAt,
      },
    });

    if (this.mailer?.sendRegistrationOtp) {
      await this.mailer.sendRegistrationOtp(email, fullName, otp);
    }
    if (process.env.NODE_ENV !== 'production') {
      this.logger.info(`Registration OTP for ${email}: ${otp}`);
    }
    try {
      const notif = new NotificationService();
      await notif.createInAppNotification(userId, 'AUTH', 'Registration OTP Sent', `An OTP has been sent to ${email} for registration verification.`);
    } catch {
    }
  }

  async verifyRegistrationOtp(email, otp, ipAddress) {
    const user = await this.prisma.user.findUnique({ where: { email }, include: userInclude });
    if (!user) throw new AppError('Verification failed', 400, 'VERIFICATION_FAILED');
    if (user.isEmailVerified) throw new AppError('Account already verified', 400, 'ALREADY_VERIFIED');

    const otpRecord = await this.prisma.otpVerification.findFirst({
      where: { email, purpose: OTP_PURPOSE.REGISTRATION, usedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) throw new AppError('No OTP found. Request a new one.', 400, 'OTP_NOT_FOUND');
    if (otpRecord.expiresAt < new Date()) throw new AppError('OTP has expired. Request a new one.', 400, 'OTP_EXPIRED');
    if (otpRecord.attempts >= OTP_ATTEMPTS_MAX) throw new AppError('Too many failed attempts. Request a new OTP.', 400, 'OTP_ATTEMPTS_EXCEEDED');

    let isValid = false;
    try {
      isValid = verifyOtpHash(otp, otpRecord.otpHash);
    } catch {
      isValid = false;
    }

    if (!isValid) {
      await this.prisma.otpVerification.update({
        where: { id: otpRecord.id },
        data: { attempts: otpRecord.attempts + 1 },
      });
      throw new AppError('Invalid OTP code', 400, 'INVALID_OTP');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: { isEmailVerified: true, emailVerifiedAt: new Date() },
      }),
      this.prisma.otpVerification.update({
        where: { id: otpRecord.id },
        data: { usedAt: new Date() },
      }),
    ]);

    const tokens = await this.issueTokens(user, ipAddress);
    return { user: shapeUser({ ...user, isEmailVerified: true }), ...tokens };
  }

  async resendRegistrationOtp(email) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || user.isEmailVerified) return { ok: true };

    await this.generateAndSendOtp(user.email, user.id, user.name);
    return { ok: true };
  }

  async login({ email, password, ipAddress }) {
    const user = await this.prisma.user.findUnique({ where: { email }, include: userInclude });
    if (!user) throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    if (!user.isActive) throw new AppError('Account inactive', 401, 'ACCOUNT_INACTIVE');
    if (!user.isEmailVerified) {
      throw new AppError('Please verify your account before logging in.', 401, 'ACCOUNT_NOT_VERIFIED');
    }
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
    try {
      const notif = new NotificationService();
      await notif.createInAppNotification(user.id, 'AUTH', 'Password Reset Requested', 'A password reset link has been sent to your email.');
    } catch {
    }
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
