import React, { useEffect, useMemo, useState } from 'react';
import { AppContext } from './AppData';
import { readJson, writeJson } from '../utils/storage';
import { setAuthSession, clearAuthSession } from '../services/api';
import { authService } from '../services/authService';
import { categoryService } from '../services/categoryService';
import { productService } from '../services/productService';
import { inventoryService } from '../services/inventoryService';
import { cartService } from '../services/cartService';
import { orderService } from '../services/orderService';
import { deliveryService } from '../services/deliveryService';
import { gardenPlanService } from '../services/gardenPlanService';
import { recommendationService } from '../services/recommendationService';
import { chatbotService } from '../services/chatbotService';
import { analyticsService } from '../services/analyticsService';
import { useToast } from './ToastContext';

const DEFAULT_USER = { name: '', role: 'customer', loggedIn: false, email: '' };
const ORDER_STATUS_LABELS = {
  PENDING: 'Order Placed',
  PROCESSING: 'Preparing Arrangement',
  CONFIRMED: 'Preparing Arrangement',
  PREPARING: 'Preparing Arrangement',
  READY_FOR_DELIVERY: 'Out for Delivery',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};
const DISPLAY_TO_BACKEND_ORDER_STATUS = {
  'Order Placed': 'PENDING',
  'Preparing Arrangement': 'PREPARING',
  'Out for Delivery': 'OUT_FOR_DELIVERY',
  Delivered: 'DELIVERED',
  Cancelled: 'CANCELLED',
};
const PRODUCT_TYPE_BY_CATEGORY = {
  plants: 'PLANT',
  flowers: 'FLOWER',
  vases: 'VASE',
};

const CATEGORY_SLUG_TO_KEY = {
  'pots-vases': 'vases',
  'indoor-plants': 'plants',
  'outdoor-plants': 'plants',
  'flowers': 'flowers',
};

const PRODUCT_TYPE_TO_CATEGORY_KEY = Object.fromEntries(
  Object.entries(PRODUCT_TYPE_BY_CATEGORY).map(([key, type]) => [type.toLowerCase(), key])
);

function stockFromStatus(stockStatus) {
  if (stockStatus === 'out_of_stock') return 0;
  if (stockStatus === 'low_stock') return 5;
  if (stockStatus === 'pre_order') return 1;
  return 25;
}

function normalizeProduct(raw, stockMap = new Map(), recommendedIds = new Set()) {
  const stockEntry = stockMap.get(raw.id);
  const stock = stockEntry?.quantity ?? stockFromStatus(raw.stockStatus);
  const category = CATEGORY_SLUG_TO_KEY[raw.category?.slug] || PRODUCT_TYPE_TO_CATEGORY_KEY[raw.productType?.toLowerCase()] || 'plants';
  return {
    id: raw.id,
    backendId: raw.id,
    categoryId: raw.categoryId || raw.category?.id,
    name: raw.name,
    category,
    price: Number(raw.discountPrice ?? raw.price ?? 0),
    basePrice: Number(raw.price ?? 0),
    rating: Number(raw.rating ?? 4.7),
    reviews: Number(raw.reviews ?? 0),
    stock,
    stockStatus: raw.stockStatus,
    isAIRecommended: recommendedIds.has(raw.id) || Boolean(raw.featured),
    image: raw.imageUrl || raw.images?.[0]?.url || '',
    imageUrl: raw.imageUrl || raw.images?.[0]?.url || '',
    desc: raw.description || raw.shortDescription || 'No product description available.',
    sunlight: raw.lightRequirement || raw.attributes?.find((item) => item.name.toLowerCase().includes('light'))?.value || 'See care guide',
    water: raw.waterRequirement || raw.attributes?.find((item) => item.name.toLowerCase().includes('water'))?.value || 'See care guide',
    toxic: raw.tags?.toLowerCase().includes('pet-safe') ? 'No' : raw.tags?.toLowerCase().includes('toxic') ? 'Yes' : 'Unknown',
    petSafe: raw.tags?.toLowerCase().includes('pet-safe') || false,
    purpose: raw.tags || raw.occasion || '',
    style: raw.attributes?.find((item) => item.name.toLowerCase().includes('style'))?.value || '',
    productType: raw.productType,
    sku: raw.sku,
    color: raw.color,
    raw,
  };
}

function normalizeCart(cartData, productsMap = new Map()) {
  return (cartData?.items || []).map((item) => {
    const product = productsMap.get(item.productId);
    const availableStock = item.availableStock != null ? item.availableStock : (product?.stock ?? 0);
    return {
      id: item.productId,
      cartItemId: item.id,
      quantity: item.quantity,
      price: Number(item.unitPrice || 0),
      name: product?.name || item.product?.name || 'Product',
      category: product?.category || item.product?.category?.slug || 'plants',
      image: product?.image || item.product?.imageUrl || '',
      stock: Math.max(0, availableStock),
    };
  });
}

function normalizeOrderSummary(order, detail = null) {
  const source = detail || order;
  const items = (source.items || []).map((item) => ({
    id: item.productId || item.productSku || item.productName,
    name: item.productName,
    quantity: item.quantity,
    price: Number(item.unitPrice || 0),
  }));
  return {
    id: source.orderNumber || order.orderNumber,
    backendId: source.id || order.id,
    date: new Date(source.createdAt || Date.now()).toISOString().substring(0, 10),
    items,
    total: Number(source.totalAmount || order.totalAmount || 0),
    status: ORDER_STATUS_LABELS[source.status] || source.status,
    backendStatus: source.status,
    address: [source.shippingAddress, source.shippingCity, source.shippingDistrict].filter(Boolean).join(', '),
    deliveryMethod: source.deliveryMethod === 'EXPRESS' ? 'Express Eco-Courier' : source.deliveryMethod === 'PICKUP' ? 'Pickup' : 'Standard Green Delivery',
    trackingNumber: source.delivery?.id || source.orderNumber,
    estimatedDelivery: source.delivery?.scheduledAt ? new Date(source.delivery.scheduledAt).toISOString().substring(0, 10) : '',
  };
}

function buildGardenLayout(plan, productsMap) {
  const totalCells = 64;
  const layout = Array(totalCells).fill(null);
  for (const placement of plan?.placements || []) {
    const idx = (placement.row * 8) + placement.col;
    if (idx < 0 || idx >= totalCells) continue;
    const product = productsMap.get(placement.productId) || normalizeProduct(placement.product || {}, new Map(), new Set());
    layout[idx] = {
      placementId: placement.id,
      productId: placement.productId,
      name: product.name,
      color: product.color || '#22C55E',
      emoji: '🌱',
      datePlanted: placement.plantedAt ? new Date(placement.plantedAt).toISOString().substring(0, 10) : new Date(placement.createdAt || Date.now()).toISOString().substring(0, 10),
    };
  }
  return layout;
}

function expandRoleCountsToUsers(usersByRole = []) {
  const mapped = [];
  for (const entry of usersByRole) {
    const role = String(entry.role || '').toLowerCase();
    const count = Number(entry.count || 0);
    for (let i = 0; i < count; i += 1) {
      mapped.push({ role, email: `${role}${i + 1}@backend.local` });
    }
  }
  return mapped;
}

function synthesizeAuditLogs({ user, orders, deliveries }) {
  const logs = [];
  if (user.loggedIn) {
    logs.push({
      id: `login-${user.email}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: user.email,
      action: 'Authenticated session loaded',
      ipAddress: 'API',
      status: 'Success',
    });
  }
  for (const order of orders.slice(0, 12)) {
    logs.push({
      id: `order-${order.backendId}`,
      timestamp: `${order.date} 00:00:00`,
      user: user.email || 'customer',
      action: `Order ${order.id} is ${order.status}`,
      ipAddress: 'API',
      status: order.status === 'Cancelled' ? 'Failure' : 'Success',
    });
  }
  for (const delivery of deliveries.slice(0, 8)) {
    logs.push({
      id: `delivery-${delivery.id}`,
      timestamp: new Date(delivery.createdAt || Date.now()).toISOString().replace('T', ' ').substring(0, 19),
      user: delivery.assignedTo?.email || 'delivery-system',
      action: `Delivery ${delivery.orderNumber || delivery.orderId} status ${delivery.status}`,
      ipAddress: 'API',
      status: delivery.status === 'FAILED' ? 'Failure' : 'Success',
    });
  }
  return logs.sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp)));
}

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => readJson('flora_user', DEFAULT_USER));
  const [pendingRegistration, setPendingRegistration] = useState(() => readJson('flora_pending_reg', null));
  const [theme, setThemeState] = useState(() => readJson('flora_theme', 'dark') === 'light' ? 'light' : 'dark');
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [gardenLayout, setGardenLayout] = useState(Array(64).fill(null));
  const [deliveries, setDeliveries] = useState([]);
  const [analytics, setAnalytics] = useState({ admin: null, florist: null, customer: null, recommendedProducts: [] });
  const [inventoryLocations, setInventoryLocations] = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [dataState, setDataState] = useState({ loading: false, error: '' });
  const addToast = useToast();

  useEffect(() => writeJson('flora_user', user), [user]);
  useEffect(() => writeJson('flora_pending_reg', pendingRegistration), [pendingRegistration]);
  useEffect(() => writeJson('flora_theme', theme), [theme]);

  useEffect(() => {
    const handleAuthLogout = () => {
      setUser(DEFAULT_USER);
      setCart([]);
      setOrders([]);
      setGardenLayout(Array(64).fill(null));
    };
    window.addEventListener('auth:logout', handleAuthLogout);
    return () => window.removeEventListener('auth:logout', handleAuthLogout);
  }, []);

  const refreshPublicData = async (currentUser = user) => {
    const [categoryRes, productRes] = await Promise.all([
      categoryService.list(),
      productService.list('?limit=100'),
    ]);

    const categoryList = categoryRes?.data || [];
    setCategories(categoryList);

    let recommendedIds = new Set();
    if (currentUser.loggedIn) {
      try {
        const recommendedRes = await recommendationService.products();
        recommendedIds = new Set((recommendedRes?.data || []).map((item) => item.id));
        setAnalytics((prev) => ({ ...prev, recommendedProducts: recommendedRes?.data || [] }));
      } catch {
        recommendedIds = new Set();
      }
    }

    const productList = productRes?.data || [];
    setProducts(productList.map((item) => normalizeProduct(item, new Map(), recommendedIds)));
    return { categoryList, productList, recommendedIds };
  };

  const ensureGardenPlan = async () => {
    const plansRes = await gardenPlanService.list();
    const plans = plansRes?.data || [];
    let defaultPlan = plans.find((plan) => plan.isDefault) || plans[0];
    if (!defaultPlan) {
      const created = await gardenPlanService.create({ name: 'My Garden Plan', width: 8, height: 8, description: 'Frontend-created default plan' });
      defaultPlan = created?.data;
    }
    return defaultPlan;
  };

  const refreshPrivateData = async (currentUser = user) => {
    if (!currentUser.loggedIn) return;

    const { productList } = await refreshPublicData(currentUser);
    const productMap = new Map(productList.map((item) => [item.id, item]));

    let stockMap = new Map();
    if (['admin', 'florist'].includes(currentUser.role)) {
      try {
        const [stockRes, locationRes] = await Promise.all([
          inventoryService.stock(),
          inventoryService.locations(),
        ]);
        const stockRows = stockRes?.data || [];
        stockMap = new Map(stockRows.map((row) => [row.productId, row]));
        setInventoryLocations(locationRes?.data || []);
      } catch {
        stockMap = new Map();
      }
    }

    const normalizedProducts = productList.map((item) => normalizeProduct(item, stockMap, new Set((analytics.recommendedProducts || []).map((p) => p.id))));
    const normalizedProductMap = new Map(normalizedProducts.map((item) => [item.id, item]));
    setProducts(normalizedProducts);

    if (currentUser.role === 'customer') {
      const [cartRes, ordersRes, customerAnalyticsRes] = await Promise.all([
        cartService.getCart(),
        orderService.list(),
        analyticsService.customerOverview().catch(() => ({ data: null })),
      ]);

      const orderSummaries = ordersRes?.data || [];
      const orderDetails = await Promise.all(orderSummaries.map((item) => orderService.getById(item.id).then((res) => res?.data).catch(() => null)));
      const normalizedOrders = orderSummaries.map((item, index) => normalizeOrderSummary(item, orderDetails[index])).filter(Boolean);

      setCart(normalizeCart(cartRes?.data, normalizedProductMap));
      setOrders(normalizedOrders);
      setAnalytics((prev) => ({ ...prev, customer: customerAnalyticsRes?.data }));

      const defaultPlan = await ensureGardenPlan();
      setGardenLayout(buildGardenLayout(defaultPlan, normalizedProductMap));
    }

    if (['florist', 'admin'].includes(currentUser.role)) {
      const [ordersRes, deliveriesRes, floristRes] = await Promise.all([
        orderService.list(),
        deliveryService.list().catch(() => ({ data: [] })),
        currentUser.role === 'admin' ? analyticsService.adminOverview().catch(() => ({ data: null })) : analyticsService.floristOverview().catch(() => ({ data: null })),
      ]);
      const orderSummaries = ordersRes?.data || [];
      const orderDetails = await Promise.all(orderSummaries.map((item) => orderService.getById(item.id).then((res) => res?.data).catch(() => null)));
      const normalizedOrders = orderSummaries.map((item, index) => normalizeOrderSummary(item, orderDetails[index])).filter(Boolean);
      setOrders(normalizedOrders);
      setDeliveries(deliveriesRes?.data || []);

      if (currentUser.role === 'admin') {
        setAnalytics((prev) => ({ ...prev, admin: floristRes?.data }));
        setRegisteredUsers(expandRoleCountsToUsers(floristRes?.data?.users || []));
      } else {
        setAnalytics((prev) => ({ ...prev, florist: floristRes?.data }));
      }
    }

    if (['gardener', 'admin', 'florist'].includes(currentUser.role)) {
      try {
        const defaultPlan = await ensureGardenPlan();
        setGardenLayout(buildGardenLayout(defaultPlan, normalizedProductMap));
      } catch {
        setGardenLayout(Array(64).fill(null));
      }
      if (currentUser.role === 'gardener') {
        const customerAnalyticsRes = await analyticsService.customerOverview().catch(() => ({ data: null }));
        setAnalytics((prev) => ({ ...prev, customer: customerAnalyticsRes?.data }));
      }
    }
  };

  useEffect(() => {
    refreshPublicData(user).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!user.loggedIn) {
      setCart([]);
      setOrders([]);
      setDeliveries([]);
      setRegisteredUsers([]);
      setAuditLogs([]);
      refreshPublicData(user).catch(() => undefined);
      return;
    }
    refreshPrivateData(user).catch(() => undefined);
  }, [user.loggedIn, user.role, user.accessToken]);

  useEffect(() => {
    setAuditLogs(synthesizeAuditLogs({ user, orders, deliveries }));
  }, [user, orders, deliveries]);

  const addToCartHandler = async (product, quantity = 1) => {
    if (!user.loggedIn || user.role !== 'customer') {
      return { ok: false, error: 'Please sign in as a customer to add items to cart.' };
    }
    try {
      const cartRes = await cartService.addItem({ productId: product.backendId || product.id, quantity });
      const productsMap = new Map(products.map((item) => [item.id, item]));
      setCart(normalizeCart(cartRes?.data, productsMap));
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  };

  const removeFromCartHandler = async (productId) => {
    const item = cart.find((entry) => entry.id === productId || entry.cartItemId === productId);
    if (!item) return;
    const cartRes = await cartService.removeItem(item.cartItemId);
    const productsMap = new Map(products.map((entry) => [entry.id, entry]));
    setCart(normalizeCart(cartRes?.data, productsMap));
  };

  const updateCartQuantityHandler = async (productId, qty) => {
    const item = cart.find((entry) => entry.id === productId || entry.cartItemId === productId);
    if (!item) return;
    if (qty <= 0) {
      await removeFromCartHandler(productId);
      return;
    }
    try {
      const cartRes = await cartService.updateItem(item.cartItemId, { quantity: qty });
      const productsMap = new Map(products.map((entry) => [entry.id, entry]));
      setCart(normalizeCart(cartRes?.data, productsMap));
    } catch (err) {
      addToast?.(err.message || 'Failed to update quantity', 'error');
    }
  };

  const clearCartHandler = async () => {
    if (!user.loggedIn || user.role !== 'customer') {
      setCart([]);
      return;
    }
    await cartService.clear();
    setCart([]);
  };

  const handleLogin = async (email, password, selectedRole) => {
    try {
      const data = await authService.login({ email, password });
      const userData = data.data.user;
      const role = selectedRole?.toLowerCase();
      const availableRoles = (userData.roles || []).map((r) => r.toLowerCase());
      if (role && !availableRoles.includes(role)) {
        return { ok: false, error: 'Selected role does not match this account.' };
      }
      setUser({
        name: userData.fullName,
        role: role || (userData.roles?.[0] || 'CUSTOMER').toLowerCase(),
        loggedIn: true,
        email: userData.email,
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken,
      });
      return { ok: true, role };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  };

  const handleRegister = async (email, password, name) => {
    try {
      await authService.register({ fullName: name, email, password, role: 'CUSTOMER', phone: '', address: '' });
      setPendingRegistration({ email, name });
      return { ok: true, requiresOtp: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  };

  const handleVerifyOtp = async (email, otp) => {
    try {
      const data = await authService.verifyRegistrationOtp({ email, otp });
      const userData = data.data.user;
      const role = (userData.roles?.[0] || 'CUSTOMER').toLowerCase();
      setPendingRegistration(null);
      setUser({
        name: userData.fullName,
        role,
        loggedIn: true,
        email: userData.email,
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken,
      });
      return { ok: true, role };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  };

  const handleResendOtp = async (email) => {
    try {
      await authService.resendRegistrationOtp({ email });
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  };

  const handleLogout = async () => {
    try {
      if (user.refreshToken) {
        await authService.logout(user.refreshToken);
      }
    } catch {
    }
    clearAuthSession();
    setUser(DEFAULT_USER);
    setCart([]);
    setOrders([]);

    setGardenLayout(Array(64).fill(null));
  };

  const updateUserProfile = async ({ name, email, password }) => {
    if (email !== user.email) {
      return { ok: false, error: 'Email changes are not supported by the current backend profile endpoint.' };
    }
    if (password) {
      return { ok: false, error: 'Password changes are not supported on this screen yet.' };
    }
    try {
      const result = await authService.updateMe({ fullName: name, phone: user.phone || '', address: user.address || '', language: user.language || '' });
      setUser((prev) => ({ ...prev, name: result?.data?.user?.fullName || name }));
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  };

  const updateProductStock = async (productId, newStock) => {
    const product = products.find((item) => item.id === productId);
    const location = inventoryLocations[0];
    if (!product || !location) return;
    const currentStock = Number(product.stock || 0);
    const targetStock = Math.max(0, Number(newStock) || 0);
    const diff = targetStock - currentStock;
    if (diff === 0) return;
    await inventoryService.adjust({
      productId: product.backendId || product.id,
      locationId: location.id,
      quantity: Math.abs(diff),
      movementType: diff > 0 ? 'STOCK_IN' : 'STOCK_OUT',
      reason: `Frontend stock adjustment to ${targetStock}`,
      note: 'Updated from inventory page',
    });
    await refreshPrivateData(user);
  };

  const addProduct = async (productDetails) => {
    const category = categories.find((item) => item.slug === productDetails.category) || categories[0];
    const payload = {
      name: productDetails.name,
      sku: `FS-${Date.now()}`,
      price: Number(productDetails.price),
      categoryId: category?.id,
      productType: PRODUCT_TYPE_BY_CATEGORY[productDetails.category] || 'PLANT',
      description: productDetails.desc || 'Product created from the frontend inventory workspace.',
      shortDescription: productDetails.desc || productDetails.name,
      imageUrl: productDetails.image || '',
      active: true,
      featured: false,
      tags: productDetails.category,
      lightRequirement: productDetails.sunlight || null,
      waterRequirement: productDetails.water || null,
      color: productDetails.color || null,
    };
    const created = await productService.create(payload);
    const location = inventoryLocations[0];
    if (location && Number(productDetails.stock) > 0) {
      await inventoryService.adjust({
        productId: created?.data?.id,
        locationId: location.id,
        quantity: Number(productDetails.stock),
        movementType: 'STOCK_IN',
        reason: 'Initial stock from frontend inventory form',
        note: 'New product created from frontend',
      });
    }
    await refreshPrivateData(user);
    return created?.data;
  };

  const updateProduct = async (productId, updates) => {
    const product = products.find((item) => item.id === productId);
    if (!product) return;
    const category = categories.find((item) => item.slug === updates.category) || categories.find((item) => item.id === product.categoryId);
    await productService.update(product.backendId || product.id, {
      name: updates.name,
      price: Number(updates.price),
      categoryId: category?.id,
      productType: PRODUCT_TYPE_BY_CATEGORY[updates.category || product.category] || product.productType,
      description: updates.desc || product.desc,
      shortDescription: updates.desc || product.desc,
      imageUrl: updates.image || '',
      tags: updates.category || product.category,
    });
    if (updates.stock !== undefined) {
      await updateProductStock(productId, updates.stock);
    } else {
      await refreshPrivateData(user);
    }
  };

  const deleteProduct = async (productId) => {
    const product = products.find((item) => item.id === productId);
    if (!product) return;
    await productService.remove(product.backendId || product.id);
    await refreshPrivateData(user);
  };

  const createOrder = async (orderDetails) => {
    try {
      const payload = {
        shippingFullName: orderDetails.fullName || user.name,
        shippingPhone: orderDetails.phone || user.phone || 'N/A',
        shippingAddress: orderDetails.address,
        shippingCity: orderDetails.city,
        shippingDistrict: orderDetails.zip || 'N/A',
        shippingNotes: '',
        deliveryMethod: orderDetails.deliveryMethod === 'Express Eco-Courier' ? 'EXPRESS' : 'STANDARD',
        paymentMethod: orderDetails.paymentMethod || 'CARD',
      };
      const result = await orderService.checkout(payload);
      await refreshPrivateData(user);
      return { ok: true, orderId: result?.data?.order?.orderNumber || result?.data?.order?.id };
    } catch (err) {
      return { ok: false, error: err.message, code: err.code };
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    const order = orders.find((item) => item.id === orderId || item.backendId === orderId);
    if (!order) return;
    await orderService.updateStatus(order.backendId, { status: DISPLAY_TO_BACKEND_ORDER_STATUS[newStatus] || newStatus });
    await refreshPrivateData(user);
  };

  const updateGardenCell = async (index, plantInfo) => {
    if (!user.loggedIn) return;
    const plan = await ensureGardenPlan();
    const row = Math.floor(index / 8);
    const col = index % 8;
    const existing = gardenLayout[index];
    if (!plantInfo) {
      if (existing?.placementId) {
        await gardenPlanService.removePlacement(plan.id, existing.placementId);
      }
    } else {
      const product = products.find((item) => item.name === plantInfo.name) || products.find((item) => item.category === 'plants');
      if (!product) return;
      if (existing?.placementId) {
        await gardenPlanService.removePlacement(plan.id, existing.placementId);
      }
      await gardenPlanService.addPlacement(plan.id, {
        productId: product.backendId || product.id,
        row,
        col,
        quantity: 1,
        plantedAt: new Date().toISOString(),
        notes: plantInfo.name,
      });
    }
    await refreshPrivateData(user);
  };

  const addAuditLog = () => {};

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setTheme = (t) => {
    setThemeState(t === 'light' ? 'light' : 'dark');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        registeredUsers,
        pendingRegistration,
        cart,
        products,
        orders,
        auditLogs,
        gardenLayout,
        theme,
        analytics,
        deliveries,
        toggleTheme,
        setTheme,
        addToCart: addToCartHandler,
        removeFromCart: removeFromCartHandler,
        updateCartQuantity: updateCartQuantityHandler,
        clearCart: clearCartHandler,
        handleLogin,
        handleRegister,
        handleVerifyOtp,
        handleResendOtp,
        handleLogout,
        updateUserProfile,
        updateProductStock,
        addProduct,
        updateProduct,
        deleteProduct,
        createOrder,
        updateOrderStatus,
        updateGardenCell,
        addAuditLog,
        recommendPlantsApi: (body) => recommendationService.plants(body),
        quickAskChatbot: (body) => chatbotService.quickAsk(body),
        trackDelivery: (orderId) => deliveryService.track(orderId),
        refreshAppData: async () => {
          setDataState({ loading: true, error: '' });
          try {
            return await (user.loggedIn ? refreshPrivateData(user) : refreshPublicData(user));
          } catch (err) {
            setDataState({ loading: false, error: err?.message || 'Failed to load app data.' });
            throw err;
          } finally {
            setDataState((prev) => ({ ...prev, loading: false }));
          }
        },
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

