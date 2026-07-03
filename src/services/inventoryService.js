import { get, post } from './api';
export const inventoryService = {
  summary: () => get('/inventory/summary', { requiresAuth: true }),
  stock: (query = '?limit=100') => get(`/inventory/stock${query}`, { requiresAuth: true }),
  stockById: (id) => get(`/inventory/stock/${id}`, { requiresAuth: true }),
  adjust: (payload) => post('/inventory/adjust', payload, { requiresAuth: true }),
  movements: (query = '') => get(`/inventory/movements${query}`, { requiresAuth: true }),
  lowStock: () => get('/inventory/low-stock', { requiresAuth: true }),
  locations: () => get('/inventory/locations', { requiresAuth: true }),
  locationById: (id) => get(`/inventory/locations/${id}`, { requiresAuth: true }),
};
