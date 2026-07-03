import { del, get, patch, post } from './api';
export const productService = {
  list: (params = '') => get(`/products${params}`),
  getById: (id) => get(`/products/${id}`),
  getBySlug: (slug) => get(`/products/slug/${slug}`),
  create: (payload) => post('/products', payload, { requiresAuth: true }),
  update: (id, payload) => patch(`/products/${id}`, payload, { requiresAuth: true }),
  remove: (id) => del(`/products/${id}`, { requiresAuth: true }),
};
