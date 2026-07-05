import nodemailer from 'nodemailer';
import { environment } from '../config/environment.js';
import { getPrismaClient } from '../database/prisma.js';
import * as emailTemplate from './email-template.service.js';

let transporter = null;
let smtpConfigured = false;

function getTransporter() {
  if (transporter) return transporter;
  const { host, port, secure, user, pass } = environment.mail;
  if (!host || !user || !pass) {
    smtpConfigured = false;
    return null;
  }
  smtpConfigured = true;
  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
  return transporter;
}

export function isSmtpConfigured() {
  if (transporter) return true;
  const { host, user, pass } = environment.mail;
  return !!(host && user && pass);
}

async function logEmail(userId, toEmail, subject, templateName, status, errorMessage, metadata) {
  try {
    const prisma = getPrismaClient();
    await prisma.emailLog.create({
      data: {
        userId,
        toEmail,
        subject,
        templateName,
        status,
        errorMessage,
        metadata: metadata || undefined,
        sentAt: status === 'SENT' ? new Date() : null,
      },
    });
  } catch {
  }
}

async function sendMail(to, subject, html, text, metadata = {}) {
  const trans = getTransporter();
  if (!trans) {
    const msg = `[DEV] Email to ${to}: ${subject}`;
    console.log(msg);
    if (text) console.log(text.substring(0, 200));
    await logEmail(metadata.userId, to, subject, metadata.templateName || 'GENERIC', 'SENT', null, metadata);
    return { success: true, devMode: true };
  }

  try {
    const info = await trans.sendMail({
      from: environment.mail.from || environment.mail.user,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]+>/g, ''),
    });
    await logEmail(metadata.userId, to, subject, metadata.templateName || 'GENERIC', 'SENT', null, { ...metadata, providerMessageId: info.messageId });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    const errMsg = error.message;
    await logEmail(metadata.userId, to, subject, metadata.templateName || 'GENERIC', 'FAILED', errMsg, metadata);
    if (environment.nodeEnv === 'production') {
      console.error('Email send failed:', errMsg);
    } else {
      console.log(`[DEV] Email FAILED to ${to}: ${errMsg}`);
    }
    return { success: false, error: errMsg };
  }
}

export async function sendRegistrationOtpEmail(user, otp) {
  const { subject, html, text } = emailTemplate.registrationOtpEmail(user.name, otp);
  return sendMail(user.email, subject, html, text, { userId: user.id, templateName: 'REGISTRATION_OTP' });
}

export async function sendPasswordResetEmail(user, resetLink) {
  const { subject, html, text } = emailTemplate.passwordResetEmail(user.name, resetLink);
  return sendMail(user.email, subject, html, text, { userId: user.id, templateName: 'PASSWORD_RESET' });
}

export async function sendOrderConfirmationEmail(user, order) {
  const { subject, html, text } = emailTemplate.orderConfirmationEmail(user, order);
  return sendMail(user.email, subject, html, text, { userId: user.id, templateName: 'ORDER_CONFIRMATION', orderId: order.id, orderNumber: order.orderNumber });
}

export async function sendOrderStatusEmail(user, order, status, note) {
  const { subject, html, text } = emailTemplate.orderStatusEmail(user, order, status, note);
  return sendMail(user.email, subject, html, text, { userId: user.id, templateName: 'ORDER_STATUS_UPDATE', orderId: order.id, orderNumber: order.orderNumber });
}

export async function sendDeliveryStatusEmail(user, order, delivery, note) {
  const { subject, html, text } = emailTemplate.deliveryStatusEmail(user, order, delivery, note);
  return sendMail(user.email, subject, html, text, { userId: user.id, templateName: 'DELIVERY_STATUS_UPDATE', orderId: order.id, deliveryId: delivery.id });
}

export async function sendLowStockAlertEmail(users, stockItems) {
  const results = [];
  for (const user of users) {
    for (const item of stockItems) {
      const { subject, html, text } = emailTemplate.lowStockAlertEmail(item);
      const result = await sendMail(user.email, subject, html, text, { userId: user.id, templateName: 'LOW_STOCK_ALERT' });
      results.push(result);
    }
  }
  return results;
}

export async function sendSystemAnnouncementEmail(users, title, message) {
  const { subject, html, text } = emailTemplate.systemAnnouncementEmail(title, message);
  const results = [];
  for (const user of users) {
    const result = await sendMail(user.email, subject, html, text, { userId: user.id, templateName: 'SYSTEM_ANNOUNCEMENT' });
    results.push(result);
  }
  return results;
}

export async function sendRawEmail(to, subject, html, text, metadata = {}) {
  return sendMail(to, subject, html, text, metadata);
}
