import { get, post } from './api';

export const paymentService = {
  initiateAirtelPayment: (payload) => post('/payments/airtel/initiate', payload, { requiresAuth: true }),
  checkAirtelStatus: (transactionId) => get(`/payments/airtel/status/${transactionId}`, { requiresAuth: true }),
  cancelAirtelPayment: (transactionId) => post(`/payments/airtel/cancel/${transactionId}`, {}, { requiresAuth: true }),
};
