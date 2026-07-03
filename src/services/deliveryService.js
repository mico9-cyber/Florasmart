import { get, patch, post } from './api';
export const deliveryService = {
  list: (query = '?limit=100') => get(`/deliveries${query}`, { requiresAuth: true }),
  getById: (id) => get(`/deliveries/${id}`, { requiresAuth: true }),
  assign: (orderId, payload) => post(`/deliveries/${orderId}/assign`, payload, { requiresAuth: true }),
  updateStatus: (id, payload) => patch(`/deliveries/${id}/status`, payload, { requiresAuth: true }),
  track: (orderId) => get(`/deliveries/track/${orderId}`, { requiresAuth: true }),
};
