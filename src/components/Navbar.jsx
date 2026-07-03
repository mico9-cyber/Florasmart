import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../context/AppData';
import { notificationService } from '../services/notificationService';
import { ShoppingCart, Leaf, User, Award, LogOut, LogIn, UserPlus, Menu, Sun, Moon, Bell } from 'lucide-react';
import { normalizeRole, getDashboardRoute } from '../config/navigation';

export default function Navbar({ onToggleSidebar }) {
  const { user, cart, handleLogout, theme, toggleTheme } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  const role = normalizeRole(user.role);
  const isLoggedIn = user.loggedIn;
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const dashboardPath = getDashboardRoute(role);
  const [notifCount, setNotifCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) { setNotifCount(0); return; }
    let cancelled = false;
    const fetch = async () => {
      try {
        const res = await notificationService.unreadCount();
        if (!cancelled) setNotifCount(res?.data?.count ?? res?.data ?? 0);
      } catch {
        if (!cancelled) setNotifCount(0);
      }
    };
    fetch();
    const interval = setInterval(fetch, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [isLoggedIn]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogoutClick = () => {
    handleLogout();
    navigate('/');
  };

  return (
    <>
      <style>{`
        .navbar-mobile-toggle {
          display: none;
        }
        @media (max-width: 768px) {
          .navbar-mobile-toggle {
            display: inline-flex !important;
          }
          .nav-actions {
            display: none !important;
          }
          .nav-actions.nav-actions--open {
            display: flex !important;
            flex-direction: column !important;
            position: absolute !important;
            top: 100% !important;
            left: 0 !important;
            right: 0 !important;
            background: var(--bg-darker) !important;
            border-bottom: 1px solid var(--navbar-border) !important;
            padding: 16px !important;
            gap: 12px !important;
            z-index: 99 !important;
            box-shadow: var(--shadow-lg) !important;
          }
          .nav-actions.nav-actions--open > *:not(.desktop-only) {
            display: flex !important;
          }
          nav {
            position: relative !important;
          }
        }
      `}</style>
      <nav style={styles.nav}>
        <div className="container" style={styles.container}>
          <div style={styles.left}>
            {isLoggedIn && (
              <button className="mobile-sidebar-toggle" onClick={onToggleSidebar} style={styles.hamburger} aria-label="Toggle sidebar">
                <Menu size={24} />
              </button>
            )}
            <Link to={isLoggedIn ? '#' : '/'} style={styles.logoLink}>
              <Leaf size={24} color="var(--accent-lime)" />
              <span style={styles.logoText}>FloraSmart</span>
            </Link>
          </div>

          <button
            className="navbar-mobile-toggle"
            onClick={() => setMenuOpen((prev) => !prev)}
            style={styles.hamburger}
            aria-label="Toggle navigation menu"
          >
            <Menu size={24} />
          </button>

          <div className={`nav-actions ${menuOpen ? 'nav-actions--open' : ''}`} style={styles.actions}>
            <button
              onClick={toggleTheme}
              style={styles.iconBtn}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {isLoggedIn && (
              <>
                <Link to={dashboardPath} style={styles.dashboardLink} title="Dashboard">
                  <Award size={16} />
                  <span className="desktop-only">Dashboard</span>
                </Link>

                <Link to="/notifications" style={styles.iconBtn} title="Notifications">
                  <Bell size={18} />
                  {notifCount > 0 && (
                    <span style={styles.cartBadge}>{notifCount > 99 ? '99+' : notifCount}</span>
                  )}
                </Link>

                {role === 'CUSTOMER' && (
                  <Link to="/cart" style={styles.iconBtn} title="Cart">
                    <ShoppingCart size={20} color="var(--text-light)" />
                    {cartCount > 0 && (
                      <span style={styles.cartBadge}>{cartCount}</span>
                    )}
                  </Link>
                )}

                <Link to="/profile" style={styles.iconBtn} title="Profile">
                  <User size={18} />
                </Link>

                <button onClick={handleLogoutClick} style={styles.iconBtn} title="Logout">
                  <LogOut size={18} />
                </button>
              </>
            )}

            {!isLoggedIn && (
              <>
                <Link to="/login" style={styles.loginBtn}>
                  <LogIn size={16} />
                  <span className="desktop-only">Login</span>
                </Link>
                <Link to="/register" style={styles.registerBtn}>
                  <UserPlus size={16} />
                  <span className="desktop-only">Register</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

const styles = {
  nav: {
    backgroundColor: 'var(--bg-darker)',
    borderBottom: '1px solid var(--navbar-border)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    height: '64px',
    display: 'flex',
    alignItems: 'center',
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    minWidth: '48px',
  },
  hamburger: {
    display: 'none',
    background: 'none',
    border: 'none',
    color: 'var(--text-light)',
    cursor: 'pointer',
    padding: '4px',
  },
  logoLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0,
  },
  logoText: {
    fontFamily: 'var(--font-headings)',
    fontSize: '22px',
    fontWeight: '800',
    letterSpacing: '-0.5px',
    color: 'var(--text-white)',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexShrink: 0,
  },
  dashboardLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'var(--btn-yellow)',
    color: 'var(--bg-darker)',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'var(--transition)',
  },
  iconBtn: {
    padding: '6px',
    borderRadius: '6px',
    border: '1px solid var(--icon-btn-border)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-light)',
    background: 'none',
    cursor: 'pointer',
    transition: 'var(--transition)',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: '-6px',
    right: '-6px',
    backgroundColor: 'var(--accent-lime)',
    color: 'var(--bg-darker)',
    fontSize: '11px',
    fontWeight: 'bold',
    borderRadius: '9999px',
    width: '18px',
    height: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    borderRadius: '6px',
    border: '1px solid var(--accent-lime)',
    color: 'var(--accent-lime)',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'var(--transition)',
  },
  registerBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    borderRadius: '6px',
    backgroundColor: 'var(--accent-lime)',
    color: 'var(--bg-darker)',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'var(--transition)',
  },
};
