import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppData';
import { ShoppingCart, Leaf, User, Award, LogOut, LogIn, UserPlus, Menu, Sun, Moon } from 'lucide-react';

function getPrimaryRole(user) {
  return user.role || 'customer';
}

export default function Navbar({ onToggleSidebar }) {
  const { user, cart, handleLogout, theme, toggleTheme } = useContext(AppContext);
  const navigate = useNavigate();
  const role = getPrimaryRole(user);
  const isLoggedIn = user.loggedIn;
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const dashboardPath = `/${role}-dashboard`;

  const handleLogoutClick = () => {
    handleLogout();
    navigate('/');
  };

  return (
    <nav style={styles.nav}>
      <div className="container" style={styles.container}>
        <div style={styles.left}>
          {isLoggedIn && (
            <button className="mobile-sidebar-toggle" onClick={onToggleSidebar} style={styles.hamburger} aria-label="Toggle sidebar">
              <Menu size={24} />
            </button>
          )}
          {!isLoggedIn && (
            <Link to="/" style={styles.logoLink}>
              <Leaf size={24} color="var(--accent-lime)" />
              <span style={styles.logoText}>FloraSmart</span>
            </Link>
          )}
        </div>

        <div style={styles.actions}>
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

              {role === 'customer' && (
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
    gap: '8px',
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
