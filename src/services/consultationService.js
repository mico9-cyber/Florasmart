import { get, post, patch } from './api';

export const consultationService = {
  // Customer
  book: (data) => post('/consultations', data, { requiresAuth: true }),
  listMyConsultations: () => get('/consultations/my', { requiresAuth: true }),

  // Gardener
  listPending: () => get('/consultations/pending', { requiresAuth: true }),
  listMyAssigned: () => get('/consultations/my-assigned', { requiresAuth: true }),
  accept: (id) => patch(`/consultations/${id}/accept`, {}, { requiresAuth: true }),
  reject: (id, reason = '') => patch(`/consultations/${id}/reject`, { reason }, { requiresAuth: true }),
  reschedule: (id, rescheduledDate, reason = '') => patch(`/consultations/${id}/reschedule`, { rescheduledDate, reason }, { requiresAuth: true }),
};
