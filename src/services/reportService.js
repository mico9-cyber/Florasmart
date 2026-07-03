import { del, get, post } from './api';
export const reportService = {
  generate: (payload) => post('/reports/generate', payload, { requiresAuth: true }),
  jobs: () => get('/reports/jobs', { requiresAuth: true }),
  jobById: (id) => get(`/reports/jobs/${id}`, { requiresAuth: true }),
  download: (id) => get(`/reports/jobs/${id}/download`, { requiresAuth: true }),
  remove: (id) => del(`/reports/jobs/${id}`, { requiresAuth: true }),
};
