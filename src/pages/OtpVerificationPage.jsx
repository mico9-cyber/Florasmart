import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppData';
import { ShieldCheck, Mail, RefreshCw, AlertCircle } from 'lucide-react';
import Button from '../components/Button';

export default function OtpVerificationPage() {
  const { pendingRegistration, handleVerifyOtp, handleResendOtp } = useContext(AppContext);
  const navigate = useNavigate();

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState('');

  useEffect(() => {
    if (!pendingRegistration?.email) {
      navigate('/register', { replace: true });
    }
  }, [pendingRegistration, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      setError('Please enter a valid 6-digit OTP code.');
      return;
    }
    setLoading(true);
    setError('');
    const result = await handleVerifyOtp(pendingRegistration.email, otp);
    setLoading(false);
    if (result.ok) {
      navigate(`/${result.role}-dashboard`, { replace: true });
    } else {
      setError(result.error);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setResendMsg('');
    const result = await handleResendOtp(pendingRegistration.email);
    setResending(false);
    if (result.ok) {
      setResendMsg('A new OTP has been sent to your email.');
    } else {
      setError(result.error);
    }
  };

  if (!pendingRegistration?.email) return null;

  return (
    <div style={styles.container}>
      <div style={styles.card} className="card">
        <div style={styles.header}>
          <div style={styles.iconContainer}>
            <ShieldCheck size={24} color="var(--accent-lime)" />
          </div>
          <h2 style={styles.title}>Verify Your Email</h2>
          <p style={styles.subtitle}>
            We sent a 6-digit OTP code to <strong>{pendingRegistration.email}</strong>.
            Enter it below to activate your account.
          </p>
        </div>

        {error && (
          <div style={styles.errorBanner}>
            <AlertCircle size={18} color="var(--error)" />
            <span>{error}</span>
          </div>
        )}

        {resendMsg && (
          <div style={styles.successBanner}>
            <Mail size={18} color="var(--accent-lime)" />
            <span>{resendMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.otpRow}>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              style={styles.otpInput}
              autoFocus
            />
          </div>

          <Button type="submit" variant="primary" style={styles.submitBtn} disabled={loading}>
            {loading ? 'Verifying...' : 'Verify Account'}
          </Button>
        </form>

        <div style={styles.resendRow}>
          <span style={styles.resendText}>Didn&apos;t receive the code?</span>
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            style={styles.resendLink}
          >
            <RefreshCw size={14} style={{ marginRight: 4 }} />
            {resending ? 'Sending...' : 'Resend OTP'}
          </button>
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
  card: {
    maxWidth: '440px',
    width: '100%',
    padding: '40px 32px',
    textAlign: 'center',
  },
  header: { marginBottom: '28px' },
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
  title: { fontSize: '24px', fontWeight: '800', marginBottom: '8px' },
  subtitle: { fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.5' },
  errorBanner: {
    display: 'flex', alignItems: 'center', gap: '10px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--error)',
    padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: '20px',
    fontSize: '14px', color: 'var(--text-light)', textAlign: 'left',
  },
  successBanner: {
    display: 'flex', alignItems: 'center', gap: '10px',
    backgroundColor: 'rgba(132, 204, 22, 0.1)', border: '1px solid var(--accent-lime)',
    padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: '20px',
    fontSize: '14px', color: 'var(--text-light)', textAlign: 'left',
  },
  form: { marginBottom: '20px' },
  otpRow: { marginBottom: '24px' },
  otpInput: {
    width: '100%', maxWidth: '240px', margin: '0 auto',
    padding: '16px 20px', fontSize: '32px', letterSpacing: '12px',
    textAlign: 'center', fontFamily: 'monospace',
    backgroundColor: 'var(--bg-darker)', border: '2px solid var(--border-green)',
    borderRadius: 'var(--radius-sm)', color: 'var(--text-light)',
    outline: 'none',
  },
  submitBtn: { width: '100%', padding: '14px' },
  resendRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
    fontSize: '14px', borderTop: '1px solid var(--border-green)', paddingTop: '20px',
  },
  resendText: { color: 'var(--text-muted)' },
  resendLink: {
    background: 'none', border: 'none', color: 'var(--accent-lime)',
    fontWeight: '700', cursor: 'pointer', display: 'inline-flex',
    alignItems: 'center', fontSize: '14px',
  },
};
