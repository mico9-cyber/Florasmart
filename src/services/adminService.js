import { get, post, patch, del } from './api';

export const adminService = {
  listUsers: (params = {}) => {
    const q = new URLSearchParams();
    if (params.role) q.set('role', params.role);
    if (params.status) q.set('status', params.status);
    if (params.search) q.set('search', params.search);
    const qs = q.toString();
    return get(`/admin/users${qs ? `?${qs}` : ''}`, { requiresAuth: true });
  },
  getUser: (id) => get(`/admin/users/${id}`, { requiresAuth: true }),
  createUser: (payload) => post('/admin/users', payload, { requiresAuth: true }),
  updateUser: (id, payload) => patch(`/admin/users/${id}`, payload, { requiresAuth: true }),
  toggleUserStatus: (id) => patch(`/admin/users/${id}/status`, {}, { requiresAuth: true }),
  deleteUser: (id) => del(`/admin/users/${id}`, { requiresAuth: true }),
};
