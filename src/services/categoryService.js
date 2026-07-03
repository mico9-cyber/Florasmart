import { del, get, patch, post } from './api';
export const categoryService = {
  list: () => get('/categories'),
  getById: (id) => get(`/categories/${id}`),
  create: (payload) => post('/categories', payload, { requiresAuth: true }),
  update: (id, payload) => patch(`/categories/${id}`, payload, { requiresAuth: true }),
  remove: (id) => del(`/categories/${id}`, { requiresAuth: true }),
};
