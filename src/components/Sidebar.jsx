import React, { useContext, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AppContext } from '../context/AppData';
import {
  LayoutDashboard,
  Flower2,
  Settings,
  Package,
  Truck,
  BarChart3,
  ShieldCheck,
  User,
  MessageSquare,
  Sparkles,
  Heart,
  Grid,
  Home,
  ShoppingBag,
  ClipboardList,
  X,
  Leaf,
} from 'lucide-react';

function getPrimaryRole(user) {
  return user.role || 'customer';
}

const roleLinksConfig = {
  customer: [
    { to: '/customer-dashboard', label: 'Dashboard', icon: Home },
    { to: '/catalog', label: 'Catalog', icon: ShoppingBag },
    { to: '/recommendations', label: 'AI Advisor', icon: Sparkles },
    { to: '/vase-matching', label: 'Vase Match', icon: Flower2 },
    { to: '/garden-planner', label: 'Garden Planner', icon: Grid },
    { to: '/chatbot', label: 'Care Bot', icon: MessageSquare },
    { to: '/loyalty', label: 'Loyalty', icon: Heart },
    { to: '/order-tracking', label: 'Orders', icon: ClipboardList },
    { to: '/profile', label: 'Profile', icon: User },
  ],
  admin: [
    { to: '/admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/catalog', label: 'Products', icon: ShoppingBag },
    { to: '/inventory', label: 'Inventory', icon: Package },
    { to: '/order-tracking', label: 'Orders', icon: ClipboardList },
    { to: '/delivery', label: 'Delivery', icon: Truck },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/security', label: 'Security', icon: ShieldCheck },
    { to: '/profile', label: 'Users/Profile', icon: Settings },
  ],
  florist: [
    { to: '/florist-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/catalog', label: 'Products', icon: ShoppingBag },
    { to: '/inventory', label: 'Inventory', icon: Package },
    { to: '/order-tracking', label: 'Orders', icon: ClipboardList },
    { to: '/delivery', label: 'Delivery', icon: Truck },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/profile', label: 'Profile', icon: User },
  ],
  gardener: [
    { to: '/gardener-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/garden-planner', label: 'Garden Planner', icon: Grid },
    { to: '/recommendations', label: 'AI Advisor', icon: Sparkles },
    { to: '/chatbot', label: 'Care Bot', icon: MessageSquare },
    { to: '/profile', label: 'Profile', icon: User },
  ],
};

const roleLabels = {
  admin: 'Admin',
  customer: 'Customer',
  florist: 'Florist',
  gardener: 'Gardener',
};

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useContext(AppContext);
  const location = useLocation();
  const role = getPrimaryRole(user);
  const links = roleLinksConfig[role] || roleLinksConfig.customer;

  const onCloseRef = useRef(onClose);
  const isOpenRef = useRef(isOpen);
  onCloseRef.current = onClose;
  isOpenRef.current = isOpen;

  useEffect(() => {
    if (isOpenRef.current) onCloseRef.current();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <>
      {isOpen && <div style={styles.overlay} onClick={onClose} />}
      <aside className="sidebar" style={styles.sidebar(isOpen)}>
        <div style={styles.brand}>
          <Leaf size={24} color="var(--accent-lime)" />
          <span style={styles.brandText}>FloraSmart</span>
          <button className="sidebar-close-btn" onClick={onClose} style={styles.closeBtn}>
            <X size={20} />
          </button>
        </div>

        <nav style={styles.navGroup}>
          <span style={styles.sectionLabel}>NAVIGATION</span>
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <Icon size={18} />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div style={styles.profileWrapper}>
          <NavLink to="/profile" style={styles.profileCard} onClick={onClose}>
            <div style={styles.profileAvatar}>
              <User size={16} color="var(--accent-lime)" />
            </div>
            <div style={styles.profileInfo}>
              <span style={styles.profileName}>{user.name || user.email}</span>
              <span style={styles.profileRole}>{roleLabels[role] || role}</span>
            </div>
          </NavLink>
        </div>
      </aside>
    </>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'var(--overlay-bg)',
    zIndex: 98,
  },
  sidebar: (isOpen) => ({
    width: '260px',
    minHeight: 'calc(100vh - 64px)',
    background: 'var(--sidebar-bg)',
    borderRight: '1px solid var(--sidebar-border)',
    padding: '0',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    overflowY: 'auto',
    position: 'relative',
    zIndex: 99,
    transform: isOpen ? 'translateX(0)' : undefined,
  }),
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '24px 20px 16px',
  },
  brandText: {
    fontFamily: 'var(--font-headings)',
    fontSize: '20px',
    fontWeight: '800',
    letterSpacing: '-0.3px',
    color: 'var(--text-white)',
    flex: 1,
  },
  closeBtn: {
    display: 'none',
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    padding: '4px',
  },
  navGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    padding: '8px 12px 12px',
    flex: 1,
    overflowY: 'auto',
  },
  sectionLabel: {
    fontSize: '10px',
    fontWeight: '700',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    paddingLeft: '12px',
    marginBottom: '10px',
    opacity: 0.45,
  },
  profileWrapper: {
    padding: '8px 12px 12px',
  },
  profileCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'var(--transition)',
  },
  profileAvatar: {
    width: '34px',
    height: '34px',
    borderRadius: '6px',
    backgroundColor: 'var(--feature-icon-bg)',
    border: '1px solid var(--feature-icon-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  profileInfo: {
    flex: 1,
    minWidth: 0,
  },
  profileName: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-white)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    lineHeight: '1.3',
  },
  profileRole: {
    display: 'block',
    fontSize: '11px',
    color: 'var(--accent-lime)',
    fontWeight: '600',
    marginTop: '1px',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
};
