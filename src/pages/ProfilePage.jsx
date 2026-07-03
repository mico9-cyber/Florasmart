import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppData';
import { useToast } from '../context/ToastContext';

import FormInput from '../components/FormInput';
import Button from '../components/Button';
import { User, LogOut, CheckCircle } from 'lucide-react';

export default function ProfilePage() {
  const { user, handleLogout, switchRole, updateUserProfile } = useContext(AppContext);
  const navigate = useNavigate();
  const addToast = useToast();

  // Settings Fields States
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Form Validation
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const tempErrors = {};
    if (!name.trim()) tempErrors.name = 'Full name is required.';
    if (!email) {
      tempErrors.email = 'Email address is required.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) tempErrors.email = 'Enter a valid email address.';
    }

    if (password && password.length < 6) {
      tempErrors.password = 'New password must be at least 6 characters.';
    }
    if (password !== confirmPassword) {
      tempErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const result = updateUserProfile({ name, email, password });
    if (!result.ok) {
      setErrors({ email: result.error });
      addToast(result.error || 'Failed to update profile.', 'error');
      return;
    }
    setSuccess(true);
    setPassword('');
    setConfirmPassword('');
    addToast('Profile updated successfully!', 'success');
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleLogoutAction = () => {
    if (window.confirm("Are you sure you want to log out of your workspace session?")) {
      handleLogout();
      navigate('/login');
    }
  };

  return (
    <div className="dashboard-content">
        <div style={styles.header}>
          <h2 style={{ fontSize: '28px', color: 'var(--text-white)' }}>Workspace Profile Settings</h2>
          <p style={{ color: 'var(--text-muted)' }}>Manage user identity records, configure notification defaults, and switch workspace roles.</p>
        </div>

        <div style={styles.layout}>
          {/* Identity card */}
          <div className="card" style={{ flex: 1, minWidth: '300px', alignSelf: 'flex-start' }}>
            <div style={styles.avatarContainer}>
              <div style={styles.avatar}>
                <User size={36} color="var(--accent-lime)" />
              </div>
              <h3 style={{ color: 'var(--text-white)', marginTop: '16px' }}>{user.name}</h3>
              <span style={styles.roleLabel}>{user.role.toUpperCase()} Workspace</span>
            </div>

            <div style={styles.divider}></div>

            {/* Quick role-hopping list */}
            <h4 style={styles.sectionSubTitle}>Swap Workspace Views</h4>
            <div style={styles.rolesRow}>
              {['customer', 'florist', 'gardener', 'admin'].map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    switchRole(role);
                    navigate(`/${role}-dashboard`);
                  }}
                  style={{
                    ...styles.roleTab,
                    borderColor: user.role === role ? 'var(--accent-lime)' : 'var(--border-green)',
                    backgroundColor: user.role === role ? 'rgba(132, 204, 22, 0.05)' : 'var(--bg-darker)',
                    color: user.role === role ? 'var(--accent-lime)' : 'var(--text-muted)'
                  }}
                >
                  {role.toUpperCase()}
                </button>
              ))}
            </div>

            <div style={styles.divider}></div>

            <Button onClick={handleLogoutAction} variant="secondary" style={styles.logoutBtn} icon={<LogOut size={16} />}>
              Sign Out of Session
            </Button>
          </div>

          {/* Form edit card */}
          <div className="card" style={{ flex: 1.8, minWidth: '350px' }}>
            <h3 style={styles.sectionTitle}>Account Credentials</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '4px 0 20px' }}>
              Update settings for your active workspace log.
            </p>

            {success && (
              <div style={styles.successBanner}>
                <CheckCircle size={16} color="var(--success)" />
                <span>Profile credentials updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile}>
              <FormInput
                label="Full Name"
                id="name-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={errors.name}
                required
              />

              <FormInput
                label="Email Address"
                id="email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                required
              />

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <FormInput
                    label="New Password (optional)"
                    id="pwd-input"
                    type="password"
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={errors.password}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <FormInput
                    label="Confirm New Password"
                    id="cpwd-input"
                    type="password"
                    placeholder="••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    error={errors.confirmPassword}
                  />
                </div>
              </div>

              <Button type="submit" variant="lime" style={{ marginTop: '12px' }}>
                Save Profile Changes
              </Button>
            </form>
          </div>
        </div>
      </div>
  );
}

const styles = {
  header: {
    marginBottom: '32px',
  },
  layout: {
    display: 'flex',
    gap: '32px',
    flexWrap: 'wrap',
  },
  avatarContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '12px 0',
  },
  avatar: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    backgroundColor: 'var(--bg-darker)',
    border: '2px solid var(--border-green)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleLabel: {
    fontSize: '11px',
    backgroundColor: 'var(--bg-darker)',
    border: '1px solid var(--border-green)',
    color: 'var(--accent-lime)',
    padding: '4px 10px',
    borderRadius: '9999px',
    marginTop: '8px',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  divider: {
    height: '1px',
    backgroundColor: 'var(--border-green)',
    margin: '24px 0',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text-white)',
  },
  sectionSubTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--text-white)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '12px',
  },
  rolesRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  },
  roleTab: {
    border: '1px solid',
    borderRadius: 'var(--radius-sm)',
    padding: '10px',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'var(--transition)',
  },
  logoutBtn: {
    width: '100%',
    padding: '12px',
  },
  successBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    border: '1px solid var(--success)',
    padding: '12px 16px',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-light)',
    fontSize: '14px',
    marginBottom: '24px',
  }
};


