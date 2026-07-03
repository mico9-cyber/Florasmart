import { get, post } from './api';
export const recommendationService = {
  plants: (payload) => post('/recommendations/plants', payload, { requiresAuth: true }),
  vaseMatch: (payload) => post('/recommendations/vase-match', payload, { requiresAuth: true }),
  gardenPlan: (payload) => post('/recommendations/garden-plan', payload, { requiresAuth: true }),
  products: (query = '?limit=8') => get(`/recommendations/products${query}`, { requiresAuth: true }),
  history: (query = '') => get(`/recommendations/history${query}`, { requiresAuth: true }),
};
