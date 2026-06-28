import React, { useState, useEffect } from 'react';
import { AppContext } from './AppData';
import { readJson, writeJson } from '../utils/storage';

const INITIAL_PRODUCTS = [
  { id: 1, name: 'Monstera Deliciosa', category: 'plants', price: 29.99, rating: 4.8, reviews: 124, stock: 15, isAIRecommended: true, image: '🌿', desc: 'A popular indoor plant known for its dramatic split leaves. Adds a tropical feel to any room.', sunlight: 'Indirect Bright Light', water: 'Once a week', toxic: 'Yes (Cats & Dogs)' },
  { id: 2, name: 'Enchanted Rose Bouquet', category: 'flowers', price: 45.00, rating: 4.9, reviews: 88, stock: 8, isAIRecommended: false, image: '🌹', desc: 'A stunning arrangement of deep red roses and premium foliage, perfect for romantic gestures.', sunlight: 'Keep Cool/Fresh Water', water: 'Change water daily', toxic: 'No' },
  { id: 3, name: 'White Ceramic Cylinder Vase', category: 'vases', price: 19.99, rating: 4.6, reviews: 42, stock: 22, isAIRecommended: false, image: '🏺', desc: 'A sleek, minimalist white ceramic vase that fits medium-to-tall flower arrangements.', height: '25cm', diameter: '10cm', style: 'Modern' },
  { id: 4, name: 'Snake Plant Laurentii', category: 'plants', price: 24.99, rating: 4.7, reviews: 205, stock: 30, isAIRecommended: true, image: '🪴', desc: 'Nearly indestructible air-purifying plant, perfect for beginners and low-light spaces.', sunlight: 'Low to Bright Indirect', water: 'Every 2-3 weeks', toxic: 'Yes (Cats & Dogs)' },
  { id: 5, name: 'Fiddle Leaf Fig', category: 'plants', price: 39.99, rating: 4.5, reviews: 67, stock: 12, isAIRecommended: true, image: '🌳', desc: 'A statement houseplant featuring large, glossy violin-shaped leaves on sleek woody stems.', sunlight: 'Bright Consistent Light', water: 'When top 2 inches dry', toxic: 'Yes' },
  { id: 6, name: 'Golden Hour Tulip Bundle', category: 'flowers', price: 34.99, rating: 4.8, reviews: 54, stock: 10, isAIRecommended: false, image: '🌷', desc: 'A bright mix of orange and yellow tulips, bringing warmth and joy to your living spaces.', sunlight: 'Indirect Cool Light', water: 'Replenish cool water', toxic: 'Yes (Pets)' },
  { id: 7, name: 'Rustic Terracotta Vase', category: 'vases', price: 22.50, rating: 4.5, reviews: 31, stock: 14, isAIRecommended: false, image: '🏺', desc: 'An earthy, rough-textured terracotta vase crafted by local artisans for a warm rustic aesthetic.', height: '18cm', diameter: '12cm', style: 'Rustic' },
  { id: 8, name: 'Peace Lily', category: 'plants', price: 18.99, rating: 4.7, reviews: 110, stock: 25, isAIRecommended: true, image: '🌸', desc: 'Beautiful dark green foliage offset by elegant white blooms. Excellent for improving air quality.', sunlight: 'Medium to Low Shade', water: 'Keep soil moist', toxic: 'Yes' },
];

const DEMO_USERS = [
  { name: 'Darrly Garden', role: 'customer', email: 'darrly@florasmart.com', password: 'demo123' },
  { name: 'Flora Studio', role: 'florist', email: 'florist@florasmart.com', password: 'demo123' },
  { name: 'Green Keeper', role: 'gardener', email: 'gardener@florasmart.com', password: 'demo123' },
  { name: 'Admin Operator', role: 'admin', email: 'admin@florasmart.com', password: 'demo123' },
];

const DEFAULT_USER = { name: '', role: 'customer', loggedIn: false, email: '' };

const DEFAULT_ORDERS = [
  {
    id: 'FL-9082',
    date: '2026-06-22',
    items: [
      { id: 1, name: 'Monstera Deliciosa', quantity: 1, price: 29.99 },
      { id: 3, name: 'White Ceramic Cylinder Vase', quantity: 1, price: 19.99 }
    ],
    total: 49.98,
    status: 'Preparing Arrangement',
    address: '123 Canopy Road, Moss Town',
    deliveryMethod: 'Standard Green Delivery',
    trackingNumber: 'TRK-MONSTERA-9082',
    estimatedDelivery: '2026-06-25'
  },
  {
    id: 'FL-8104',
    date: '2026-06-15',
    items: [
      { id: 8, name: 'Peace Lily', quantity: 2, price: 18.99 }
    ],
    total: 37.98,
    status: 'Delivered',
    address: '123 Canopy Road, Moss Town',
    deliveryMethod: 'Express Eco-Courier',
    trackingNumber: 'TRK-PEACE-8104',
    estimatedDelivery: '2026-06-17'
  }
];

const DEFAULT_LOYALTY = {
  points: 450,
  tier: 'Gold Leaf',
  pointsToNextTier: 50,
  nextReward: 'Free $10 voucher',
  isSubscribed: true,
  subscriptionPlan: 'Weekly Green Refresh',
  subscriptionPrice: 29.99,
  nextBillingDate: '2026-07-01'
};

const DEFAULT_AUDIT_LOGS = [
  { id: 1, timestamp: '2026-06-24 11:15:30', user: 'darrly@florasmart.com', action: 'User Sign In', ipAddress: '192.168.1.45', status: 'Success' },
  { id: 2, timestamp: '2026-06-24 10:45:12', user: 'darrly@florasmart.com', action: 'Role Switched to Customer', ipAddress: '192.168.1.45', status: 'Success' },
  { id: 3, timestamp: '2026-06-23 15:20:00', user: 'florist@florasmart.com', action: 'Inventory Stock Update', ipAddress: '192.168.1.12', status: 'Success' },
  { id: 4, timestamp: '2026-06-23 09:12:05', user: 'admin@florasmart.com', action: 'Database Backup Completed', ipAddress: '10.0.0.8', status: 'Success' },
];

const createDefaultGarden = () => Array(64).fill(null).map((_, idx) => {
  if (idx === 10) return { name: 'Monstera', color: '#22C55E', emoji: '🌿', datePlanted: '2026-06-10' };
  if (idx === 18) return { name: 'Rose', color: '#EF4444', emoji: '🌹', datePlanted: '2026-06-12' };
  if (idx === 29) return { name: 'Tulip', color: '#F59E0B', emoji: '🌷', datePlanted: '2026-06-20' };
  return null;
});

export const AppProvider = ({ children }) => {
  const [registeredUsers, setRegisteredUsers] = useState(() => readJson('flora_registered_users', DEMO_USERS));
  const [user, setUser] = useState(() => readJson('flora_user', DEFAULT_USER));
  const [cart, setCart] = useState(() => readJson('flora_cart', []));
  const [products, setProducts] = useState(() => readJson('flora_products', INITIAL_PRODUCTS));
  const [orders, setOrders] = useState(() => readJson('flora_orders', DEFAULT_ORDERS));
  const [loyalty, setLoyalty] = useState(() => readJson('flora_loyalty', DEFAULT_LOYALTY));
  const [auditLogs, setAuditLogs] = useState(() => readJson('flora_audit', DEFAULT_AUDIT_LOGS));
  const [gardenLayout, setGardenLayout] = useState(() => readJson('flora_garden', createDefaultGarden()));

  useEffect(() => writeJson('flora_registered_users', registeredUsers), [registeredUsers]);
  useEffect(() => writeJson('flora_user', user), [user]);
  useEffect(() => writeJson('flora_cart', cart), [cart]);
  useEffect(() => writeJson('flora_products', products), [products]);
  useEffect(() => writeJson('flora_orders', orders), [orders]);
  useEffect(() => writeJson('flora_loyalty', loyalty), [loyalty]);
  useEffect(() => writeJson('flora_audit', auditLogs), [auditLogs]);
  useEffect(() => writeJson('flora_garden', gardenLayout), [gardenLayout]);

  const addAuditLog = (action) => {
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: user.loggedIn ? user.email : 'Anonymous',
      action,
      ipAddress: '192.168.1.45',
      status: action.startsWith('Failed') ? 'Failure' : 'Success'
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 49)]);
  };

  const addToCart = (product, quantity = 1) => {
    const currentProduct = products.find((item) => item.id === product.id);
    const maxStock = currentProduct?.stock ?? product.stock ?? 0;
    if (maxStock <= 0) return { ok: false, error: `${product.name} is out of stock.` };

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        const nextQty = Math.min(existing.quantity + quantity, maxStock);
        return prev.map((item) => item.id === product.id ? { ...item, quantity: nextQty } : item);
      }
      return [...prev, { ...product, quantity: Math.min(quantity, maxStock) }];
    });
    addAuditLog(`Item Added to Cart: ${product.name} (Qty: ${quantity})`);
    return { ok: true };
  };

  const removeFromCart = (productId) => {
    const item = cart.find((cartItem) => cartItem.id === productId);
    setCart((prev) => prev.filter((cartItem) => cartItem.id !== productId));
    if (item) addAuditLog(`Item Removed from Cart: ${item.name}`);
  };

  const updateCartQuantity = (productId, qty) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    const currentProduct = products.find((item) => item.id === productId);
    const cappedQty = Math.min(qty, currentProduct?.stock ?? qty);
    setCart((prev) => prev.map((item) => item.id === productId ? { ...item, quantity: cappedQty } : item));
  };

  const clearCart = () => setCart([]);

  const handleLogin = (email, password, selectedRole = 'customer') => {
    const found = registeredUsers.find((item) =>
      item.email.toLowerCase() === email.toLowerCase() &&
      item.password === password &&
      item.role === selectedRole
    );
    if (!found) {
      addAuditLog(`Failed User Login: ${email}`);
      return { ok: false, error: 'Invalid demo credentials or role selection.' };
    }

    setUser({ name: found.name, role: found.role, loggedIn: true, email: found.email });
    addAuditLog(`User Login: ${found.role}`);
    return { ok: true, role: found.role };
  };

  const handleRegister = (email, password, name, selectedRole) => {
    const emailExists = registeredUsers.some((item) => item.email.toLowerCase() === email.toLowerCase());
    if (emailExists) return { ok: false, error: 'An account with this email already exists.' };

    const newRegisteredUser = { name, role: selectedRole, email, password };
    setRegisteredUsers((prev) => [...prev, newRegisteredUser]);
    setUser({ name, role: selectedRole, loggedIn: true, email });
    addAuditLog(`User Registration: ${selectedRole}`);
    return { ok: true, role: selectedRole };
  };

  const handleLogout = () => {
    setUser(DEFAULT_USER);
    clearCart();
    addAuditLog('User Logout');
  };

  const switchRole = (newRole) => {
    setUser((prev) => ({ ...prev, role: newRole }));
    addAuditLog(`Role Changed: ${user.role} to ${newRole}`);
  };

  const updateUserProfile = ({ name, email, password }) => {
    if (email !== user.email) {
      const emailExists = registeredUsers.some((item) => item.email.toLowerCase() === email.toLowerCase());
      if (emailExists) return { ok: false, error: 'That email is already assigned to another demo account.' };
    }

    setRegisteredUsers((prev) => prev.map((item) =>
      item.email === user.email ? { ...item, name, email, password: password || item.password } : item
    ));
    setUser((prev) => ({ ...prev, name, email }));
    addAuditLog(`User Profile Updated: ${name}`);
    return { ok: true };
  };

  const updateProductStock = (productId, newStock) => {
    const normalizedStock = Math.max(0, Number(newStock) || 0);
    setProducts((prev) => prev.map((product) => product.id === productId ? { ...product, stock: normalizedStock } : product));
    setCart((prev) => prev
      .map((item) => item.id === productId ? { ...item, quantity: Math.min(item.quantity, normalizedStock) } : item)
      .filter((item) => item.quantity > 0)
    );
    const product = products.find((item) => item.id === productId);
    if (product) addAuditLog(`Inventory Stock Update: ${product.name} to ${normalizedStock}`);
  };

  const addProduct = (productDetails) => {
    const newProduct = {
      id: Date.now(),
      rating: 5.0,
      reviews: 0,
      image: '🌿',
      isAIRecommended: false,
      desc: 'Custom inventory item added by studio operator.',
      ...productDetails,
      price: Number(productDetails.price),
      stock: Math.max(0, Number(productDetails.stock) || 0),
    };
    setProducts((prev) => [newProduct, ...prev]);
    addAuditLog(`New Inventory Product Added: ${newProduct.name} (Qty: ${newProduct.stock})`);
    return newProduct;
  };

  const updateProduct = (productId, updates) => {
    setProducts((prev) => prev.map((product) =>
      product.id === productId
        ? {
            ...product,
            ...updates,
            price: updates.price === undefined ? product.price : Number(updates.price),
            stock: updates.stock === undefined ? product.stock : Math.max(0, Number(updates.stock) || 0),
          }
        : product
    ));
    addAuditLog(`Inventory Product Updated: ${productId}`);
  };

  const deleteProduct = (productId) => {
    setProducts((prev) => prev.filter((product) => product.id !== productId));
    setCart((prev) => prev.filter((item) => item.id !== productId));
    addAuditLog(`Inventory Item Deleted: ${productId}`);
  };

  const createOrder = (orderDetails) => {
    if (cart.length === 0) return { ok: false, error: 'Your cart is empty.' };

    const unavailableItem = cart.find((item) => {
      const product = products.find((current) => current.id === item.id);
      return !product || product.stock < item.quantity;
    });
    if (unavailableItem) {
      return { ok: false, error: `${unavailableItem.name} is no longer available in the requested quantity.` };
    }

    const newOrder = {
      id: `FL-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().substring(0, 10),
      items: cart.map((item) => ({ id: item.id, name: item.name, quantity: item.quantity, price: item.price })),
      total: orderDetails.total,
      status: 'Order Placed',
      address: orderDetails.address,
      deliveryMethod: orderDetails.deliveryMethod,
      trackingNumber: `TRK-FL-${Math.floor(100000 + Math.random() * 900000)}`,
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10)
    };

    setOrders((prev) => [newOrder, ...prev]);
    setProducts((prev) => prev.map((product) => {
      const orderedItem = cart.find((item) => item.id === product.id);
      return orderedItem ? { ...product, stock: Math.max(0, product.stock - orderedItem.quantity) } : product;
    }));
    clearCart();

    const pointsGained = Math.round(orderDetails.total * 10);
    setLoyalty((prev) => {
      const totalPoints = prev.points + pointsGained;
      return {
        ...prev,
        points: totalPoints,
        pointsToNextTier: Math.max(0, 500 - totalPoints),
        tier: totalPoints >= 500 ? 'Gold Leaf' : totalPoints >= 200 ? 'Silver Bud' : 'Bronze Seedling'
      };
    });

    addAuditLog(`Order Created: ${newOrder.id}, Total: $${orderDetails.total.toFixed(2)}`);
    return { ok: true, orderId: newOrder.id };
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) => prev.map((order) => order.id === orderId ? { ...order, status: newStatus } : order));
    addAuditLog(`Order Status Update: ${orderId} set to ${newStatus}`);
  };

  const updateSubscription = (subscribe, planName = '', price = 0) => {
    setLoyalty((prev) => ({
      ...prev,
      isSubscribed: subscribe,
      subscriptionPlan: subscribe ? planName : '',
      subscriptionPrice: subscribe ? price : 0,
      nextBillingDate: subscribe ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10) : ''
    }));
    addAuditLog(subscribe ? `Subscribed to ${planName}` : 'Cancelled subscription');
  };

  const updateGardenCell = (index, plantInfo) => {
    setGardenLayout((prev) => {
      const nextGrid = [...prev];
      nextGrid[index] = plantInfo;
      return nextGrid;
    });
    addAuditLog(plantInfo ? `Garden Grid Edit: planted ${plantInfo.name} at ${index}` : `Garden Grid Edit: cleared ${index}`);
  };

  const readTheme = () => {
    try {
      const saved = readJson('flora_theme', 'dark');
      return saved === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  };

  const [theme, setThemeState] = useState(readTheme);

  const toggleTheme = () => {
    setThemeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      writeJson('flora_theme', next);
      return next;
    });
  };

  const setTheme = (t) => {
    const next = t === 'light' ? 'light' : 'dark';
    setThemeState(next);
    writeJson('flora_theme', next);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        registeredUsers,
        cart,
        products,
        orders,
        loyalty,
        auditLogs,
        gardenLayout,
        theme,
        toggleTheme,
        setTheme,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        handleLogin,
        handleRegister,
        handleLogout,
        switchRole,
        updateUserProfile,
        updateProductStock,
        addProduct,
        updateProduct,
        deleteProduct,
        createOrder,
        updateOrderStatus,
        updateSubscription,
        updateGardenCell,
        addAuditLog,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

