import { get, patch, post } from './api';
export const orderService = {
  list: (query = '?limit=100') => get(`/orders${query}`, { requiresAuth: true }),
  getById: (id) => get(`/orders/${id}`, { requiresAuth: true }),
  updateStatus: (id, payload) => patch(`/orders/${id}/status`, payload, { requiresAuth: true }),
  cancel: (id, payload = {}) => post(`/orders/${id}/cancel`, payload, { requiresAuth: true }),
  checkout: (payload) => post('/checkout', payload, { requiresAuth: true }),
};
