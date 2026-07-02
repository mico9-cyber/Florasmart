const BASE_URL = 'http://localhost:5000/api/v1';

async function request(endpoint, options = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.message || 'Request failed');
    err.code = data.code;
    err.status = res.status;
    throw err;
  }
  return data;
}

export function registerUser(body) {
  return request('/auth/register', { method: 'POST', body: JSON.stringify(body) });
}

export function loginUser(body) {
  return request('/auth/login', { method: 'POST', body: JSON.stringify(body) });
}

export function verifyRegistrationOtp(body) {
  return request('/auth/verify-registration-otp', { method: 'POST', body: JSON.stringify(body) });
}

export function resendRegistrationOtp(body) {
  return request('/auth/resend-registration-otp', { method: 'POST', body: JSON.stringify(body) });
}

export function getMe(token) {
  return request('/auth/me', { headers: { Authorization: `Bearer ${token}` } });
}
