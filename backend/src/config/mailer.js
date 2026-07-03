import nodemailer from 'nodemailer';
import { environment } from './environment.js';

export function createMailer(logger) {
  if (!environment.mail.host || !environment.mail.user || !environment.mail.pass) {
    return {
      async sendResetToken() {
        logger?.debug('Mailer not configured; skip password reset email delivery');
      },
      async sendRegistrationOtp() {
        logger?.debug('Mailer not configured; skip registration OTP email delivery');
      },
    };
  }

  const transporter = nodemailer.createTransport({
    host: environment.mail.host,
    port: environment.mail.port,
    secure: environment.mail.secure,
    auth: { user: environment.mail.user, pass: environment.mail.pass },
    tls: { rejectUnauthorized: false },
  });

  const from = environment.mail.from || environment.mail.user;

  return {
    async sendResetToken(email, token) {
      try {
        await transporter.sendMail({
          from,
          to: email,
          subject: 'FloraSmart password reset',
          text: 'Password reset token: ' + token,
        });
      } catch (err) {
        logger?.error('Failed to send password reset email', { error: err.message, email });
      }
    },
    async sendRegistrationOtp(email, fullName, otp) {
      try {
        await transporter.sendMail({
          from,
          to: email,
          subject: 'Your FloraSmart Registration OTP',
          html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
          <h2>Welcome to FloraSmart!</h2>
          <p>Hi ${fullName},</p>
          <p>Use the OTP below to complete your registration. It expires in 10 minutes.</p>
          <div style="font-size:28px;letter-spacing:6px;font-weight:700;text-align:center;padding:16px;background:#f5f5f5;border-radius:8px;margin:16px 0">${otp}</div>
          <p>If you did not request this, please ignore this email.</p>
          <hr><small style="color:#888">FloraSmart</small>
        </div>`,
        });
        logger?.info(`Registration OTP sent to ${email}`);
      } catch (err) {
        logger?.error('Failed to send registration OTP email', { error: err.message, email });
      }
    },
  };
}
