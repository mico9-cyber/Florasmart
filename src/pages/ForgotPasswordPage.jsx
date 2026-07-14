import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '../services/authService';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';
import FormInput from '../components/FormInput';
import Button from '../components/Button';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setError('Email is required.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Enter a valid email address.'); return; }
    setError('');
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div style={styles.container}>
        <div className="card" style={styles.card}>
          <div style={styles.iconContainer}>
            <CheckCircle2 size={48} color="var(--success)" />
          </div>
          <h2 style={styles.title}>{t('auth.forgotPasswordTitle')}</h2>
          <p style={styles.message}>
            If an account exists for <strong>{email}</strong>, we have sent a password reset link.
          </p>
          <Link to="/login" style={styles.backLink}>
            <ArrowLeft size={16} /> {t('auth.backToLogin')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div className="card" style={styles.card}>
        <div style={styles.header}>
          <div style={styles.iconCircle}>
            <Mail size={24} color="var(--accent-lime)" />
          </div>
          <h2 style={styles.title}>{t('auth.forgotPasswordTitle')}</h2>
          <p style={styles.message}>{t('auth.forgotPasswordSubtitle')}</p>
        </div>

        {error && (
          <div style={styles.errorBanner}>
            <AlertCircle size={18} color="var(--error)" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <FormInput
            label={t('auth.emailLabel')}
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
            required
          />
          <Button type="submit" variant="lime" style={{ width: '100%', marginTop: '12px' }} disabled={loading}>
            {loading ? 'Sending...' : t('auth.sendResetLink')}
          </Button>
        </form>

        <div style={styles.footer}>
          <Link to="/login" style={styles.backLink}>
            <ArrowLeft size={16} /> {t('auth.backToLogin')}
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: 'calc(100vh - 144px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '40px 20px',
  },
  card: { maxWidth: '450px', width: '100%', padding: '40px 32px' },
  header: { textAlign: 'center', marginBottom: '28px' },
  iconCircle: {
    width: '48px', height: '48px', borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--bg-darker)', border: '1px solid var(--border-green)',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px',
  },
  iconContainer: { marginBottom: '16px' },
  title: { fontSize: '24px', fontWeight: '800', marginBottom: '8px' },
  message: { fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.4' },
  errorBanner: {
    display: 'flex', alignItems: 'center', gap: '10px',
    backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid var(--error)',
    padding: '12px 16px', borderRadius: 'var(--radius-sm)',
    marginBottom: '20px', fontSize: '14px', color: 'var(--text-light)',
  },
  footer: { marginTop: '24px', textAlign: 'center' },
  backLink: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    color: 'var(--accent-lime)', fontWeight: '600', fontSize: '14px',
    textDecoration: 'none',
  },
};
