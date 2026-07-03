import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppData';
import { useToast } from '../context/ToastContext';
import { UserPlus, ShieldAlert } from 'lucide-react';
import FormInput from '../components/FormInput';
import Button from '../components/Button';

export default function RegisterPage() {
  const { handleRegister } = useContext(AppContext);
  const navigate = useNavigate();
  const addToast = useToast();

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('customer');

  // Validation States
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'name':
        if (!value.trim()) error = 'Full name is required.';
        break;
      case 'email':
        if (!value) error = 'Email address is required.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Enter a valid email address.';
        break;
      case 'password':
        if (!value) error = 'Password is required.';
        else if (value.length < 6) error = 'Password must be at least 6 characters long.';
        break;
      case 'confirmPassword':
        if (value !== password) error = 'Passwords do not match.';
        break;
      case 'role':
        if (!value) error = 'Workspace role is required.';
        break;
    }
    setFieldErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const handleBlur = (name) => (e) => {
    validateField(name, e.target.value);
  };

  const validate = () => {
    const tempErrors = {};

    if (!name.trim()) tempErrors.name = 'Full name is required.';
    if (!email) tempErrors.email = 'Email address is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) tempErrors.email = 'Enter a valid email address.';
    if (!password) tempErrors.password = 'Password is required.';
    else if (password.length < 6) tempErrors.password = 'Password must be at least 6 characters long.';
    if (password !== confirmPassword) tempErrors.confirmPassword = 'Passwords do not match.';
    if (!role) tempErrors.role = 'Workspace role is required.';

    setFieldErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const result = await handleRegister(email, password, name, role);
      if (result.ok) {
        addToast('Registration successful! Check your email for OTP.', 'success');
        navigate('/verify-otp', { replace: true });
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
            onChange={(e) => { setName(e.target.value); if (fieldErrors.name) validateField('name', e.target.value); }}
            onBlur={handleBlur('name')}
            error={fieldErrors.name}
            ariaInvalid={!!fieldErrors.name}
            ariaDescribedby={fieldErrors.name ? 'error-name' : undefined}
            required
          />
          {fieldErrors.name && <span id="error-name" style={styles.fieldError}>{fieldErrors.name}</span>}

          <FormInput
            label="Email Address"
            id="email"
            type="email"
            placeholder="e.g. darrly@florasmart.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (fieldErrors.email) validateField('email', e.target.value); }}
            onBlur={handleBlur('email')}
            error={fieldErrors.email}
            ariaInvalid={!!fieldErrors.email}
            ariaDescribedby={fieldErrors.email ? 'error-email' : undefined}
            required
          />
          {fieldErrors.email && <span id="error-email" style={styles.fieldError}>{fieldErrors.email}</span>}

          <FormInput
            label="Workspace Role"
            id="role"
            type="select"
            value={role}
            onChange={(e) => { setRole(e.target.value); if (fieldErrors.role) validateField('role', e.target.value); }}
            onBlur={handleBlur('role')}
            error={fieldErrors.role}
            ariaInvalid={!!fieldErrors.role}
            ariaDescribedby={fieldErrors.role ? 'error-role' : undefined}
            options={[
              { value: 'customer', label: 'Customer (Shop, Track Orders, AI Advisor)' },
              { value: 'florist', label: 'Florist (Stems Match, Floral Inventory, Deliveries)' },
              { value: 'gardener', label: 'Gardener (Landscape Planner, Care database, Catalog)' },
              { value: 'admin', label: 'Admin (System Control, Logs, Global Inventory)' }
            ]}
          />
          {fieldErrors.role && <span id="error-role" style={styles.fieldError}>{fieldErrors.role}</span>}

          <div style={styles.pwdRow}>
            <div style={{ flex: 1 }}>
              <FormInput
                label="Password"
                id="password"
                type="password"
                placeholder="••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (fieldErrors.password) validateField('password', e.target.value); }}
                onBlur={handleBlur('password')}
                error={fieldErrors.password}
                ariaInvalid={!!fieldErrors.password}
                ariaDescribedby={fieldErrors.password ? 'error-password' : undefined}
                required
              />
              {fieldErrors.password && <span id="error-password" style={styles.fieldError}>{fieldErrors.password}</span>}
            </div>
            <div style={{ flex: 1 }}>
              <FormInput
                label="Confirm Password"
                id="confirmPassword"
                type="password"
                placeholder="••••••"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); if (fieldErrors.confirmPassword) validateField('confirmPassword', e.target.value); }}
                onBlur={handleBlur('confirmPassword')}
                error={fieldErrors.confirmPassword}
                ariaInvalid={!!fieldErrors.confirmPassword}
                ariaDescribedby={fieldErrors.confirmPassword ? 'error-confirmPassword' : undefined}
                required
              />
              {fieldErrors.confirmPassword && <span id="error-confirmPassword" style={styles.fieldError}>{fieldErrors.confirmPassword}</span>}
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
  fieldError: {
    color: '#e74c3c',
    fontSize: '12px',
    marginTop: '4px',
    display: 'block',
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



