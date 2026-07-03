import { del, get, patch, post } from './api';
export const subscriptionService = {
  plans: () => get('/subscriptions/plans'),
  subscribe: (payload) => post('/subscriptions/subscribe', payload, { requiresAuth: true }),
  me: () => get('/subscriptions/me', { requiresAuth: true }),
  cancel: (id, payload = {}) => post(`/subscriptions/${id}/cancel`, payload, { requiresAuth: true }),
  adminPlans: () => get('/subscriptions/admin/plans', { requiresAuth: true }),
  createPlan: (payload) => post('/subscriptions/admin/plans', payload, { requiresAuth: true }),
  updatePlan: (id, payload) => patch(`/subscriptions/admin/plans/${id}`, payload, { requiresAuth: true }),
  removePlan: (id) => del(`/subscriptions/admin/plans/${id}`, { requiresAuth: true }),
  adminCancel: (id, payload = {}) => post(`/subscriptions/admin/${id}/cancel`, payload, { requiresAuth: true }),
};
