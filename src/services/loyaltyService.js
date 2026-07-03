import { get, post, del, patch } from './api';
export const loyaltyService = {
  me: () => get('/loyalty/me', { requiresAuth: true }),
  transactions: () => get('/loyalty/transactions', { requiresAuth: true }),
  rewards: () => get('/loyalty/rewards', { requiresAuth: true }),
  redeemReward: (id) => post(`/loyalty/rewards/${id}/redeem`, {}, { requiresAuth: true }),
  redemptions: () => get('/loyalty/redemptions', { requiresAuth: true }),
  adminAccounts: () => get('/loyalty/admin/accounts', { requiresAuth: true }),
  adjustPoints: (id, payload) => post(`/loyalty/admin/accounts/${id}/adjust`, payload, { requiresAuth: true }),
  adminRewards: () => get('/loyalty/admin/rewards', { requiresAuth: true }),
  createReward: (payload) => post('/loyalty/admin/rewards', payload, { requiresAuth: true }),
  updateReward: (id, payload) => patch(`/loyalty/admin/rewards/${id}`, payload, { requiresAuth: true }),
  removeReward: (id) => del(`/loyalty/admin/rewards/${id}`, { requiresAuth: true }),
  adminRedemptions: () => get('/loyalty/admin/redemptions', { requiresAuth: true }),
  adminTransactions: () => get('/loyalty/admin/transactions', { requiresAuth: true }),
};
