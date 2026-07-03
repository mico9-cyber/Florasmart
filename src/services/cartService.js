import { del, get, patch, post } from './api';
export const cartService = {
  getCart: () => get('/cart', { requiresAuth: true }),
  addItem: (payload) => post('/cart/items', payload, { requiresAuth: true }),
  updateItem: (itemId, payload) => patch(`/cart/items/${itemId}`, payload, { requiresAuth: true }),
  removeItem: (itemId) => del(`/cart/items/${itemId}`, { requiresAuth: true }),
  clear: () => del('/cart', { requiresAuth: true }),
};
