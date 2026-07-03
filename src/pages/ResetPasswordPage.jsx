import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authService } from '../services/authService';
import { Lock, ArrowLeft, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';
import { validatePassword } from '../utils/passwordValidation';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) { setError('New password is required.'); return; }
    if (!validatePassword(password).valid) { setError('Password does not meet all requirements.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (!token) { setError('Reset token is missing. Use the link from your email.'); return; }
    setError('');
    setLoading(true);
    try {
      await authService.resetPassword({ token, password });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={styles.container}>
        <div className="card" style={styles.card}>
          <div style={styles.iconContainer}>
            <CheckCircle2 size={48} color="var(--success)" />
          </div>
          <h2 style={styles.title}>Password Reset</h2>
          <p style={styles.message}>Your password has been reset successfully.</p>
          <Link to="/login" style={styles.backLink}>
            <ArrowLeft size={16} /> Back to Login
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
            <Lock size={24} color="var(--accent-lime)" />
          </div>
          <h2 style={styles.title}>Reset Password</h2>
          <p style={styles.message}>Enter your new password below.</p>
        </div>

        {error && (
          <div style={styles.errorBanner}>
            <AlertCircle size={18} color="var(--error)" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <FormInput
            label="New Password"
            id="password"
            type="password"
            placeholder="Min. 12 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error && !password ? error : ''}
            required
          />
          <PasswordStrengthIndicator password={password} onValidationChange={setPasswordValid} />
          <FormInput
            label="Confirm Password"
            id="confirm-password"
            type="password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <Button type="submit" variant="lime" style={{ width: '100%', marginTop: '12px' }} disabled={loading || (password.length > 0 && !passwordValid)}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>

        <div style={styles.footer}>
          <Link to="/login" style={styles.backLink}>
            <ArrowLeft size={16} /> Back to Login
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
