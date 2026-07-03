import { get } from './api';
export const analyticsService = {
  adminOverview: () => get('/analytics/admin/overview', { requiresAuth: true }),
  floristOverview: () => get('/analytics/florist/overview', { requiresAuth: true }),
  customerOverview: () => get('/analytics/customer/me', { requiresAuth: true }),
  sales: (query = '') => get(`/analytics/sales${query}`, { requiresAuth: true }),
  orders: (query = '') => get(`/analytics/orders${query}`, { requiresAuth: true }),
  inventory: () => get('/analytics/inventory', { requiresAuth: true }),
  delivery: () => get('/analytics/delivery', { requiresAuth: true }),
  products: () => get('/analytics/products', { requiresAuth: true }),
  engagement: () => get('/analytics/engagement', { requiresAuth: true }),
};
