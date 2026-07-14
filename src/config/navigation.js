import { LayoutDashboard, Home, ShoppingBag, ShoppingCart, ClipboardList, Sparkles, User, Package, BarChart3, FileText, Calendar, MessageSquare, Users } from 'lucide-react';

export const ROLE_NAV_ITEMS = {
  CUSTOMER: [
    { to: '/customer-dashboard', label: 'Dashboard', labelKey: 'nav.dashboard', icon: Home },
    { to: '/catalog', label: 'Shop', labelKey: 'nav.shop', icon: ShoppingBag },
    { to: '/cart', label: 'Cart', labelKey: 'nav.cart', icon: ShoppingCart },
    { to: '/order-tracking', label: 'My Orders', labelKey: 'nav.myOrders', icon: ClipboardList },
    { to: '/book-consultation', label: 'Book Consultation', labelKey: 'nav.bookConsultation', icon: Calendar },
    { to: '/recommendations', label: 'AI Advisor', labelKey: 'nav.aiAdvisor', icon: Sparkles },
    { to: '/chatbot', label: 'Care Bot', labelKey: 'nav.careBot', icon: MessageSquare },
    { to: '/profile', label: 'Profile', labelKey: 'nav.profile', icon: User },
  ],

  FLORIST: [
    { to: '/florist-dashboard', label: 'Dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
    { to: '/catalog', label: 'Products', labelKey: 'nav.products', icon: ShoppingBag },
    { to: '/order-tracking', label: 'Orders', labelKey: 'nav.orders', icon: ClipboardList },
    { to: '/inventory', label: 'Inventory', labelKey: 'nav.inventory', icon: Package },
  ],

  GARDENER: [
    { to: '/gardener-dashboard', label: 'Dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
    { to: '/manage-consultations', label: 'Consultations', labelKey: 'nav.consultations', icon: Calendar },
    { to: '/profile', label: 'Profile', labelKey: 'nav.profile', icon: User },
  ],

  ADMIN: [
    { to: '/admin-dashboard', label: 'Dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
    { to: '/catalog', label: 'Products', labelKey: 'nav.products', icon: ShoppingBag },
    { to: '/order-tracking', label: 'Orders', labelKey: 'nav.orders', icon: ClipboardList },
    { to: '/inventory', label: 'Inventory', labelKey: 'nav.inventory', icon: Package },
    { to: '/admin/users', label: 'Staff Accounts', labelKey: 'nav.staffAccounts', icon: Users },
    { to: '/analytics', label: 'Analytics', labelKey: 'nav.analytics', icon: BarChart3 },
    { to: '/reports', label: 'Reports', labelKey: 'nav.reports', icon: FileText },
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
