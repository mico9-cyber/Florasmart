import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppData';
import { UserPlus, ShieldAlert } from 'lucide-react';
import FormInput from '../components/FormInput';
import Button from '../components/Button';

export default function RegisterPage() {
  const { handleRegister } = useContext(AppContext);
  const navigate = useNavigate();

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('customer');

  // Validation States
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  const validate = () => {
    const tempErrors = {};
    
    if (!name.trim()) {
      tempErrors.name = 'Full name is required.';
    }

    if (!email) {
      tempErrors.email = 'Email address is required.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) tempErrors.email = 'Enter a valid email address.';
    }

    if (!password) {
      tempErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters long.';
    }

    if (password !== confirmPassword) {
      tempErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const result = handleRegister(email, password, name, role);
      if (result.ok) {
        navigate(`/${result.role}-dashboard`);
      } else {
        setSubmitError(result.error);
      }
    } catch {
      setSubmitError('An error occurred. Please try again.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.registerCard} className="card">
        <div style={styles.header}>
          <div style={styles.iconContainer}>
            <UserPlus size={24} color="var(--accent-lime)" />
          </div>
          <h2 style={styles.title}>Join FloraSmart</h2>
          <p style={styles.subtitle}>Unlock AI-driven botanicals, planners, and logistics tools.</p>
        </div>

        {submitError && (
          <div style={styles.errorBanner}>
            <ShieldAlert size={18} color="var(--error)" />
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <FormInput
            label="Full Name"
            id="name"
            placeholder="e.g. Darrly Garden"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            required
          />

          <FormInput
            label="Email Address"
            id="email"
            type="email"
            placeholder="e.g. darrly@florasmart.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            required
          />

          <FormInput
            label="Workspace Role"
            id="role"
            type="select"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            options={[
              { value: 'customer', label: 'Customer (Shop, Track Orders, AI Advisor)' },
              { value: 'florist', label: 'Florist (Stems Match, Floral Inventory, Deliveries)' },
              { value: 'gardener', label: 'Gardener (Landscape Planner, Care database, Catalog)' },
              { value: 'admin', label: 'Admin (System Control, Logs, Global Inventory)' }
            ]}
          />

          <div style={styles.pwdRow}>
            <div style={{ flex: 1 }}>
              <FormInput
                label="Password"
                id="password"
                type="password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <FormInput
                label="Confirm Password"
                id="confirmPassword"
                type="password"
                placeholder="••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={errors.confirmPassword}
                required
              />
            </div>
          </div>

          <div style={styles.termsRow}>
            <label style={styles.termsLabel}>
              <input type="checkbox" required style={{ marginRight: '8px' }} />
              I agree to the <a href="#" style={styles.termsLink}>Privacy Policy</a> & <a href="#" style={styles.termsLink}>Terms of Service</a>
            </label>
          </div>

          <Button type="submit" variant="primary" style={styles.submitBtn}>
            Register Workspace Account
          </Button>
        </form>

        <div style={styles.footer}>
          <span style={styles.footerText}>Already have an account?</span>
          <Link to="/login" style={styles.loginLink}>Sign In</Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: 'calc(100vh - 144px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    background: 'radial-gradient(circle, rgba(132,204,22,0.03) 0%, transparent 70%)',
  },
  registerCard: {
    maxWidth: '520px',
    width: '100%',
    padding: '40px 32px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '28px',
  },
  iconContainer: {
    width: '48px',
    height: '48px',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--bg-darker)',
    border: '1px solid var(--border-green)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '800',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    lineHeight: '1.4',
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid var(--error)',
    padding: '12px 16px',
    borderRadius: 'var(--radius-sm)',
    marginBottom: '20px',
    fontSize: '14px',
    color: 'var(--text-light)',
  },
  pwdRow: {
    display: 'flex',
    gap: '16px',
  },
  termsRow: {
    marginBottom: '24px',
    fontSize: '13px',
  },
  termsLabel: {
    display: 'flex',
    alignItems: 'center',
    color: 'var(--text-muted)',
    cursor: 'pointer',
  },
  termsLink: {
    color: 'var(--accent-lime)',
    fontWeight: '600',
  },
  submitBtn: {
    width: '100%',
    padding: '14px',
  },
  footer: {
    marginTop: '28px',
    textAlign: 'center',
    borderTop: '1px solid var(--border-green)',
    paddingTop: '20px',
    fontSize: '14px',
  },
  footerText: {
    color: 'var(--text-muted)',
    marginRight: '6px',
  },
  loginLink: {
    color: 'var(--accent-lime)',
    fontWeight: '700',
  }
};



