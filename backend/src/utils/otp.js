import crypto from 'node:crypto';

export function generateOtp() {
  const raw = crypto.randomInt(100000, 999999);
  return String(raw);
}

export function hashOtp(otp) {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

export function verifyOtpHash(otp, hash) {
  const computed = hashOtp(otp);
  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(hash));
}

export const OTP_PURPOSE = Object.freeze({
  REGISTRATION: 'REGISTRATION',
  PASSWORD_RESET: 'PASSWORD_RESET',
});
