import React, { useState, useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppContext } from '../context/AppData';
import { useToast } from '../context/ToastContext';
import { LogIn, ShieldAlert } from 'lucide-react';
import FormInput from '../components/FormInput';
import Button from '../components/Button';

export default function LoginPage() {
  const { t } = useTranslation();
  const { handleLogin } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  const addToast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  const clearError = (field) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    if (submitError) setSubmitError('');
  };

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

    if (!role) {
      tempErrors.role = 'Please select a workspace role.';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const result = await handleLogin(email, password, role);
      if (result.ok) {
        addToast('Logged in successfully.', 'success');
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
          <h2 style={styles.title}>{t('auth.welcomeBack')}</h2>
          <p style={styles.subtitle}>{t('auth.loginSubtitle')}</p>
        </div>

        {submitError && (
          <div style={styles.errorBanner}>
            <ShieldAlert size={18} color="var(--error)" />
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <FormInput
            label={t('auth.emailLabel')}
            id="email"
            type="email"
            placeholder="e.g. gardener@florasmart.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); clearError('email'); }}
            error={errors.email}
            required
          />

          <FormInput
            label={t('auth.passwordLabel')}
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => { setPassword(e.target.value); clearError('password'); }}
            error={errors.password}
            required
          />

          <FormInput
            label={t('auth.workspaceRole')}
            id="role"
            type="select"
            value={role}
            onChange={(e) => { setRole(e.target.value); clearError('role'); }}
            error={errors.role}
            options={[
              { value: '', label: t('auth.selectRole') },
              { value: 'customer', label: t('roles.customer') },
              { value: 'florist', label: t('roles.florist') },
              { value: 'gardener', label: t('roles.gardener') },
              { value: 'admin', label: t('roles.admin') },
            ]}
          />

          <div style={styles.forgotRow}>
            <Link to="/forgot-password" style={styles.forgotLink}>{t('auth.forgotPassword')}</Link>
          </div>

          <Button type="submit" variant="primary" style={styles.submitBtn}>
            {t('auth.signIn')}
          </Button>
        </form>

        <div style={styles.footer}>
          <span style={styles.footerText}>{t('auth.noAccount')}</span>
          <Link to="/register" style={styles.registerLink}>{t('auth.createOne')}</Link>
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
    marginBottom: '24px',
    fontSize: '13px',
    textAlign: 'right',
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
