import { del, get, post, getAccessToken } from './api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const reportService = {
  generate: (payload) => post('/reports/generate', payload, { requiresAuth: true }),
  jobs: () => get('/reports/jobs', { requiresAuth: true }),
  jobById: (id) => get(`/reports/jobs/${id}`, { requiresAuth: true }),
  download: async (id) => {
    const token = getAccessToken();
    const res = await fetch(`${API_BASE_URL}/reports/jobs/${id}/download`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Download failed');
    return res.blob();
  },
  remove: (id) => del(`/reports/jobs/${id}`, { requiresAuth: true }),
};
