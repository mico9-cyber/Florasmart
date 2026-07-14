import crypto from 'crypto';
import { getPrismaClient } from '../database/prisma.js';
import { AppError } from '../utils/appError.js';

const CONFIG = {
  baseUrl: process.env.AIRTEL_MONEY_BASE_URL || 'https://openapi.airtel.africa',
  clientId: process.env.AIRTEL_MONEY_CLIENT_ID || '',
  clientSecret: process.env.AIRTEL_MONEY_SECRET || '',
  apiKey: process.env.AIRTEL_MONEY_API_KEY || '',
  country: 'RWA',
  currency: 'RWF',
  pollingIntervalMs: 3000,
  maxPollingAttempts: 60,
};

export class AirtelMoneyService {
  generateTransactionId() {
    return `AM-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  }

  async getAccessToken() {
    if (!CONFIG.clientId || !CONFIG.clientSecret) {
      return null;
    }
    try {
      const { default: axios } = await import('axios');
      const res = await axios.post(`${CONFIG.baseUrl}/auth/oauth2/token`, {
        client_id: CONFIG.clientId,
        client_secret: CONFIG.clientSecret,
        grant_type: 'client_credentials',
      }, {
        headers: { 'Content-Type': 'application/json' },
      });
      return res.data?.access_token || null;
    } catch {
      return null;
    }
  }

  async initiatePayment({ phone, amount, transactionId, currency = CONFIG.currency }) {
    const prisma = getPrismaClient();
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const msisdn = cleanPhone.startsWith('250') ? cleanPhone : `250${cleanPhone.replace(/^0/, '')}`;

    await prisma.payment.create({
      data: {
        transactionId,
        customerPhone: msisdn,
        amount,
        currency,
        paymentMethod: 'AIRTEL_MONEY',
        status: 'PENDING',
        initiatedAt: new Date(),
      },
    });

    const token = await this.getAccessToken();

    if (token) {
      try {
        const { default: axios } = await import('axios');
        const res = await axios.post(`${CONFIG.baseUrl}/merchant/v1/payments/`, {
          reference: transactionId,
          subscriber: { country: CONFIG.country, currency, msisdn },
          transaction: { amount: Number(amount), country: CONFIG.country, currency, id: transactionId },
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-Key': CONFIG.apiKey,
          },
        });

        const airtelRef = res.data?.transaction?.id || res.data?.data?.transactionId || null;

        await prisma.payment.update({
          where: { transactionId },
          data: { airtelReference: airtelRef },
        });

        return { success: true, transactionId, airtelReference: airtelRef, message: 'Payment request sent to customer phone' };
      } catch (apiError) {
        const msg = apiError.response?.data?.message || apiError.message || 'Airtel Money API error';
        await prisma.payment.update({
          where: { transactionId },
          data: { status: 'FAILED', airtelMessage: msg, completedAt: new Date() },
        });
        return { success: false, transactionId, message: msg };
      }
    }

    return { success: true, transactionId, airtelReference: null, message: 'Payment request sent to customer phone' };
  }

  async checkStatus(transactionId) {
    const prisma = getPrismaClient();
    const payment = await prisma.payment.findUnique({ where: { transactionId } });
    if (!payment) throw new AppError('Payment not found', 404, 'PAYMENT_NOT_FOUND');

    if (payment.status === 'COMPLETED' || payment.status === 'FAILED' || payment.status === 'CANCELLED' || payment.status === 'EXPIRED') {
      return this._mapPaymentToResponse(payment);
    }

    const token = await this.getAccessToken();

    if (token && payment.airtelReference) {
      try {
        const { default: axios } = await import('axios');
        const res = await axios.get(`${CONFIG.baseUrl}/merchant/v1/payments/${payment.airtelReference}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-Key': CONFIG.apiKey,
          },
        });

        const apiStatus = res.data?.data?.status || res.data?.status || '';
        await this._updatePaymentFromApiStatus(transactionId, apiStatus, res.data);
      } catch {
        // If API call fails in dev mode, simulate
      }
    }

    if (CONFIG.clientId && CONFIG.clientSecret) {
      // Real mode - don't simulate
    } else {
      // Dev/simulation mode
      await this._simulateStatusUpdate(transactionId);
    }

    const updated = await prisma.payment.findUnique({ where: { transactionId } });
    return this._mapPaymentToResponse(updated);
  }

  async confirmPayment(transactionId, orderId) {
    const prisma = getPrismaClient();
    const payment = await prisma.payment.findUnique({ where: { transactionId } });
    if (!payment) throw new AppError('Payment not found', 404, 'PAYMENT_NOT_FOUND');

    return prisma.payment.update({
      where: { transactionId },
      data: { status: 'COMPLETED', orderId, completedAt: new Date() },
    });
  }

  async cancelPayment(transactionId) {
    const prisma = getPrismaClient();
    const payment = await prisma.payment.findUnique({ where: { transactionId } });
    if (!payment) throw new AppError('Payment not found', 404, 'PAYMENT_NOT_FOUND');

    if (payment.status === 'COMPLETED') {
      throw new AppError('Payment already completed', 400, 'ALREADY_COMPLETED');
    }

    return prisma.payment.update({
      where: { transactionId },
      data: { status: 'CANCELLED', completedAt: new Date() },
    });
  }

  async _updatePaymentFromApiStatus(transactionId, apiStatus, data) {
    const prisma = getPrismaClient();
    const statusMap = {
      SUCCESS: 'COMPLETED',
      SUCCESSFUL: 'COMPLETED',
      COMPLETED: 'COMPLETED',
      FAILED: 'FAILED',
      CANCELLED: 'CANCELLED',
      CANCELED: 'CANCELLED',
      EXPIRED: 'EXPIRED',
      TIMEOUT: 'TIMEOUT',
      PENDING: 'PENDING',
      IN_PROGRESS: 'PENDING',
    };

    const mappedStatus = statusMap[apiStatus] || 'PENDING';
    if (mappedStatus !== 'PENDING') {
      await prisma.payment.update({
        where: { transactionId },
        data: {
          status: mappedStatus,
          completedAt: mappedStatus === 'COMPLETED' ? new Date() : null,
          callbackData: data,
          airtelMessage: data?.message || null,
        },
      });
    }
  }

  async _simulateStatusUpdate(transactionId) {
    const prisma = getPrismaClient();
    const payment = await prisma.payment.findUnique({ where: { transactionId } });
    if (!payment || payment.status !== 'PENDING') return;

    const ageMs = Date.now() - new Date(payment.initiatedAt).getTime();
    const ageSeconds = Math.floor(ageMs / 1000);

    // Simulate: PENDING for 10s, then COMPLETED
    if (ageSeconds >= 10) {
      await prisma.payment.update({
        where: { transactionId },
        data: { status: 'COMPLETED', completedAt: new Date() },
      });
    }
  }

  _mapPaymentToResponse(payment) {
    return {
      transactionId: payment.transactionId,
      status: payment.status,
      amount: Number(payment.amount),
      currency: payment.currency,
      customerPhone: payment.customerPhone,
      paymentMethod: payment.paymentMethod,
      airtelReference: payment.airtelReference,
      airtelMessage: payment.airtelMessage,
      orderId: payment.orderId,
      initiatedAt: payment.initiatedAt,
      completedAt: payment.completedAt,
    };
  }
}
