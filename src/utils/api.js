const BASE_URL = 'http://localhost:5000/api/v1';

function buildHeaders(options = {}, token) {
  const headers = { ...(options.headers || {}) };
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function parseResponse(res) {
  const text = await res.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!res.ok) {
    const err = new Error(data?.message || 'Request failed');
    err.code = data?.code;
    err.status = res.status;
    err.payload = data;
    throw err;
  }

  return data;
}

async function rawRequest(endpoint, options = {}, token) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: buildHeaders(options, token),
  });
  return parseResponse(res);
}

export async function request(endpoint, options = {}, auth = {}) {
  const { accessToken, refreshToken, onAuthUpdate, onUnauthorized } = auth;

  try {
    return await rawRequest(endpoint, options, accessToken);
  } catch (err) {
    if (err.status !== 401 || !refreshToken) {
      if (err.status === 401 && onUnauthorized) onUnauthorized();
      throw err;
    }

    const refreshData = await rawRequest('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });

    const nextTokens = {
      accessToken: refreshData?.data?.accessToken || accessToken,
      refreshToken: refreshData?.data?.refreshToken || refreshToken,
    };

    if (onAuthUpdate) {
      onAuthUpdate(nextTokens, refreshData?.data?.user || null);
    }

    return rawRequest(endpoint, options, nextTokens.accessToken);
  }
}

export function registerUser(body) {
  return rawRequest('/auth/register', { method: 'POST', body: JSON.stringify(body) });
}

export function loginUser(body) {
  return rawRequest('/auth/login', { method: 'POST', body: JSON.stringify(body) });
}

export function verifyRegistrationOtp(body) {
  return rawRequest('/auth/verify-registration-otp', { method: 'POST', body: JSON.stringify(body) });
}

export function resendRegistrationOtp(body) {
  return rawRequest('/auth/resend-registration-otp', { method: 'POST', body: JSON.stringify(body) });
}

export function logoutUser(body, auth) {
  return request('/auth/logout', { method: 'POST', body: JSON.stringify(body) }, auth);
}

export function getMe(auth) {
  return request('/auth/me', {}, auth);
}

export function updateMe(body, auth) {
  return request('/users/me', { method: 'PATCH', body: JSON.stringify(body) }, auth);
}

export function getCategories() {
  return rawRequest('/categories');
}

export function getProducts(query = '') {
  return rawRequest(`/products${query}`);
}

export function createProduct(body, auth) {
  return request('/products', { method: 'POST', body: JSON.stringify(body) }, auth);
}

export function updateProductApi(id, body, auth) {
  return request(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(body) }, auth);
}

export function deleteProductApi(id, auth) {
  return request(`/products/${id}`, { method: 'DELETE' }, auth);
}

export function getInventorySummary(auth) {
  return request('/inventory/summary', {}, auth);
}

export function getInventoryStock(auth) {
  return request('/inventory/stock?limit=100', {}, auth);
}

export function getInventoryLocations(auth) {
  return request('/inventory/locations', {}, auth);
}

export function adjustInventoryStock(body, auth) {
  return request('/inventory/adjust', { method: 'POST', body: JSON.stringify(body) }, auth);
}

export function getCart(auth) {
  return request('/cart', {}, auth);
}

export function addCartItem(body, auth) {
  return request('/cart/items', { method: 'POST', body: JSON.stringify(body) }, auth);
}

export function updateCartItem(itemId, body, auth) {
  return request(`/cart/items/${itemId}`, { method: 'PATCH', body: JSON.stringify(body) }, auth);
}

export function removeCartItem(itemId, auth) {
  return request(`/cart/items/${itemId}`, { method: 'DELETE' }, auth);
}

export function clearCartApi(auth) {
  return request('/cart', { method: 'DELETE' }, auth);
}

export function checkout(body, auth) {
  return request('/checkout', { method: 'POST', body: JSON.stringify(body) }, auth);
}

export function getOrders(auth) {
  return request('/orders?limit=100', {}, auth);
}

export function getOrderById(id, auth) {
  return request(`/orders/${id}`, {}, auth);
}

export function updateOrderStatusApi(id, body, auth) {
  return request(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify(body) }, auth);
}

export function getDeliveries(auth) {
  return request('/deliveries?limit=100', {}, auth);
}

export function trackDelivery(orderId, auth) {
  return request(`/deliveries/track/${orderId}`, {}, auth);
}

export function getLoyaltyAccount(auth) {
  return request('/loyalty/me', {}, auth);
}

export function getLoyaltyTransactions(auth) {
  return request('/loyalty/transactions', {}, auth);
}

export function getSubscriptionPlans() {
  return rawRequest('/subscriptions/plans');
}

export function getMySubscriptions(auth) {
  return request('/subscriptions/me', {}, auth);
}

export function subscribeToPlan(body, auth) {
  return request('/subscriptions/subscribe', { method: 'POST', body: JSON.stringify(body) }, auth);
}

export function cancelSubscriptionApi(id, body, auth) {
  return request(`/subscriptions/${id}/cancel`, { method: 'POST', body: JSON.stringify(body) }, auth);
}

export function getGardenPlans(auth) {
  return request('/garden-plans', {}, auth);
}

export function createGardenPlan(body, auth) {
  return request('/garden-plans', { method: 'POST', body: JSON.stringify(body) }, auth);
}

export function updateGardenPlacement(planId, body, auth) {
  return request(`/garden-plans/${planId}/placements`, { method: 'POST', body: JSON.stringify(body) }, auth);
}

export function deleteGardenPlacement(planId, placementId, auth) {
  return request(`/garden-plans/${planId}/placements/${placementId}`, { method: 'DELETE' }, auth);
}

export function getGardenSummary(auth) {
  return request('/garden-plans/summary/me', {}, auth);
}

export function recommendPlantsApi(body, auth) {
  return request('/recommendations/plants', { method: 'POST', body: JSON.stringify(body) }, auth);
}

export function getRecommendedProducts(auth) {
  return request('/recommendations/products?limit=8', {}, auth);
}

export function quickAskChatbot(body, auth) {
  return request('/chatbot/ask', { method: 'POST', body: JSON.stringify(body) }, auth);
}

export function getCustomerAnalytics(auth) {
  return request('/analytics/customer/me', {}, auth);
}

export function getFloristAnalytics(auth) {
  return request('/analytics/florist/overview', {}, auth);
}

export function getAdminAnalytics(auth) {
  return request('/analytics/admin/overview', {}, auth);
}

export function getSalesAnalytics(auth) {
  return request('/analytics/sales', {}, auth);
}

export function getProductAnalytics(auth) {
  return request('/analytics/products', {}, auth);
}

