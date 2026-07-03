import { LayoutDashboard, Home, ShoppingBag, ShoppingCart, ClipboardList, Sparkles, User, Grid, Package, BarChart3, FileText } from 'lucide-react';

export const ROLE_NAV_ITEMS = {
  CUSTOMER: [
    { to: '/customer-dashboard', label: 'Dashboard', icon: Home },
    { to: '/catalog', label: 'Shop', icon: ShoppingBag },
    { to: '/cart', label: 'Cart', icon: ShoppingCart },
    { to: '/order-tracking', label: 'My Orders', icon: ClipboardList },
    { to: '/recommendations', label: 'AI Advisor', icon: Sparkles },
    { to: '/profile', label: 'Profile', icon: User },
  ],

  FLORIST: [
    { to: '/florist-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/catalog', label: 'Products', icon: ShoppingBag },
    { to: '/order-tracking', label: 'Orders', icon: ClipboardList },
    { to: '/inventory', label: 'Inventory', icon: Package },
  ],

  GARDENER: [
    { to: '/gardener-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/garden-planner', label: 'Garden Planner', icon: Grid },
    { to: '/recommendations', label: 'AI Advisor', icon: Sparkles },
    { to: '/profile', label: 'Profile', icon: User },
  ],

  ADMIN: [
    { to: '/admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/catalog', label: 'Products', icon: ShoppingBag },
    { to: '/order-tracking', label: 'Orders', icon: ClipboardList },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/reports', label: 'Reports', icon: FileText },
  ],
};

export const ROLE_LABELS = {
  CUSTOMER: 'Customer',
  FLORIST: 'Florist',
  GARDENER: 'Gardener',
  ADMIN: 'Admin',
};

export const DASHBOARD_ROUTES = {
  CUSTOMER: '/customer-dashboard',
  FLORIST: '/florist-dashboard',
  GARDENER: '/gardener-dashboard',
  ADMIN: '/admin-dashboard',
};

export function normalizeRole(rawRole) {
  const r = String(rawRole || 'customer').toUpperCase();
  if (['CUSTOMER', 'FLORIST', 'GARDENER', 'ADMIN'].includes(r)) return r;
  return 'CUSTOMER';
}

export function getNavItemsForRole(rawRole) {
  const role = normalizeRole(rawRole);
  return ROLE_NAV_ITEMS[role] || ROLE_NAV_ITEMS.CUSTOMER;
}

export function getDashboardRoute(rawRole) {
  const role = normalizeRole(rawRole);
  return DASHBOARD_ROUTES[role] || '/customer-dashboard';
}
