import React, { useState, useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AppContext } from '../context/AppData';
import { LogIn, ShieldAlert } from 'lucide-react';
import FormInput from '../components/FormInput';
import Button from '../components/Button';

export default function LoginPage() {
  const { handleLogin } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');

  // Validation Errors
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  const validate = () => {
    const tempErrors = {};
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

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const result = handleLogin(email, password, role);
      if (result.ok) {
        navigate(location.state?.from || `/${result.role}-dashboard`);
      } else {
        setSubmitError(result.error);
      }
    } catch {
      setSubmitError('An error occurred during login. Please try again.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginCard} className="card">
        <div style={styles.header}>
          <div style={styles.iconContainer}>
            <LogIn size={24} color="var(--accent-lime)" />
          </div>
          <h2 style={styles.title}>Sign In to FloraSmart</h2>
          <p style={styles.subtitle}>Enter your details below to access your garden dashboard</p>
        </div>

        {submitError && (
          <div style={styles.errorBanner}>
            <ShieldAlert size={18} color="var(--error)" />
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <FormInput
            label="Email Address"
            id="email"
            type="email"
            placeholder="e.g. gardener@florasmart.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            required
          />

          <FormInput
            label="Password"
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            required
          />

          <FormInput
            label="Select Workspace Role"
            id="role"
            type="select"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            options={[
              { value: 'customer', label: 'Customer Portal' },
              { value: 'florist', label: 'Florist Studio Dashboard' },
              { value: 'gardener', label: 'Gardener Landscaping Dashboard' },
              { value: 'admin', label: 'System Administrator Console' }
            ]}
          />

          <div style={styles.forgotRow}>
            <label style={styles.rememberMe}>
              <input type="checkbox" style={{ marginRight: '8px' }} />
              Remember device
            </label>
            <a href="#" style={styles.forgotLink}>Forgot password?</a>
          </div>

          <Button type="submit" variant="primary" style={styles.submitBtn}>
            Sign In
          </Button>
        </form>

        <div style={styles.footer}>
          <span style={styles.footerText}>New to FloraSmart?</span>
          <Link to="/register" style={styles.registerLink}>Create an Account</Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: 'calc(100vh - 144px)', // Deducting nav and footer height
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    background: 'radial-gradient(circle, rgba(132,204,22,0.03) 0%, transparent 70%)',
  },
  loginCard: {
    maxWidth: '450px',
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
  forgotRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    fontSize: '13px',
  },
  rememberMe: {
    display: 'flex',
    alignItems: 'center',
    color: 'var(--text-muted)',
    cursor: 'pointer',
  },
  forgotLink: {
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
  registerLink: {
    color: 'var(--accent-lime)',
    fontWeight: '700',
  }
};



