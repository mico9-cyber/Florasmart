import nodemailer from 'nodemailer';
import { environment } from './environment.js';

export function createMailer(logger) {
  if (!environment.mail.host || !environment.mail.user || !environment.mail.pass) {
    return {
      async sendResetToken() {
        logger?.debug('Mailer not configured; skip password reset email delivery');
      },
    };
  }

  const transporter = nodemailer.createTransport({
    host: environment.mail.host,
    port: environment.mail.port,
    secure: environment.mail.port === 465,
    auth: { user: environment.mail.user, pass: environment.mail.pass },
  });

  return {
    async sendResetToken(email, token) {
      await transporter.sendMail({
        from: environment.mail.user,
        to: email,
        subject: 'FloraSmart password reset',
        text: 'Password reset token: ' + token,
      });
    },
  };
}
