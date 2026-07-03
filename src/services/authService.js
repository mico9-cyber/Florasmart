import { get, patch, post, setAuthSession, clearAuthSession } from './api';

export const authService = {
  async login(payload) {
    const response = await post('/auth/login', payload);
    setAuthSession(response.data || {});
    return response;
  },
  register: (payload) => post('/auth/register', payload),
  async logout(refreshToken) {
    const response = await post('/auth/logout', { refreshToken }, { requiresAuth: true });
    clearAuthSession();
    return response;
  },
  refresh: (refreshToken) => post('/auth/refresh', { refreshToken }),
  me: () => get('/auth/me', { requiresAuth: true }),
  updateMe: (payload) => patch('/users/me', payload, { requiresAuth: true }),
  forgotPassword: (email) => post('/auth/password/forgot', { email }),
  resetPassword: (payload) => post('/auth/password/reset', payload),
  verifyRegistrationOtp: (payload) => post('/auth/verify-registration-otp', payload),
  resendRegistrationOtp: (payload) => post('/auth/resend-registration-otp', payload),
};
