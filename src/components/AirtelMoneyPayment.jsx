import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import Button from './Button';
import { Loader2, CheckCircle, XCircle, AlertTriangle, Clock, Smartphone } from 'lucide-react';
import { paymentService } from '../services/paymentService';
import { formatCurrency } from '../utils/formatCurrency';

const POLL_INTERVAL = 3000;
const MAX_POLL_ATTEMPTS = 60;

export default function AirtelMoneyPayment({ transactionId, amount = 0, phone = '', onComplete, onCancel, t }) {
  const [phase, setPhase] = useState('confirm');
  const [status, setStatus] = useState('PENDING');
  const [message, setMessage] = useState('');
  const [pollAttempts, setPollAttempts] = useState(0);
  const [cancelling, setCancelling] = useState(false);
  const pollingRef = useRef(null);
  const mountedRef = useRef(true);

  const STATUS_ICONS = {
    PENDING: <Loader2 size={48} className="spin" style={{ color: 'var(--accent-lime)' }} />,
    COMPLETED: <CheckCircle size={48} style={{ color: 'var(--success)' }} />,
    FAILED: <XCircle size={48} style={{ color: 'var(--error)' }} />,
    CANCELLED: <AlertTriangle size={48} style={{ color: 'var(--warning)' }} />,
    EXPIRED: <Clock size={48} style={{ color: 'var(--warning)' }} />,
    TIMEOUT: <Clock size={48} style={{ color: 'var(--warning)' }} />,
  };

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (phase !== 'polling' || !transactionId) return;

    setMessage(t?.('airtelMoney.waitingForAuthorization') || 'Waiting for you to authorize the payment on your phone...');

    const pollStatus = async () => {
      if (!mountedRef.current) return;
      try {
        const res = await paymentService.checkAirtelStatus(transactionId);
        if (!mountedRef.current) return;

        const { status: newStatus, message: msg } = res.data || {};

        setStatus(newStatus);
        setMessage(msg || getDefaultMessage(newStatus));

        if (newStatus === 'COMPLETED') {
          if (pollingRef.current) clearInterval(pollingRef.current);
          setTimeout(() => onComplete?.(res.data), 2000);
          return;
        }

        if (['FAILED', 'CANCELLED', 'EXPIRED'].includes(newStatus)) {
          if (pollingRef.current) clearInterval(pollingRef.current);
          return;
        }

        setPollAttempts((prev) => {
          const next = prev + 1;
          if (next >= MAX_POLL_ATTEMPTS) {
            setStatus('TIMEOUT');
            setMessage(t?.('airtelMoney.timeoutMessage') || 'Payment confirmation is taking longer than expected.');
            if (pollingRef.current) clearInterval(pollingRef.current);
          }
          return next;
        });
      } catch {
        if (!mountedRef.current) return;
        setPollAttempts((prev) => {
          const next = prev + 1;
          if (next >= MAX_POLL_ATTEMPTS) {
            setStatus('TIMEOUT');
            setMessage(t?.('airtelMoney.timeoutMessage') || 'Payment confirmation is taking longer than expected.');
            if (pollingRef.current) clearInterval(pollingRef.current);
          }
          return next;
        });
      }
    };

    pollStatus();
    pollingRef.current = setInterval(pollStatus, POLL_INTERVAL);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [phase, transactionId, onComplete, t]);

  const getDefaultMessage = (s) => {
    const messages = {
      PENDING: t?.('airtelMoney.waitingForAuthorization') || 'Waiting for you to authorize the payment on your phone...',
      COMPLETED: t?.('airtelMoney.paymentCompleted') || 'Payment completed successfully. Thank you for your order.',
      FAILED: t?.('airtelMoney.paymentFailed') || 'Payment could not be completed. Please try again.',
      CANCELLED: t?.('airtelMoney.paymentCancelled') || 'Payment was cancelled.',
      EXPIRED: t?.('airtelMoney.paymentExpired') || 'The payment request has expired. Please initiate a new payment.',
      TIMEOUT: t?.('airtelMoney.timeoutMessage') || 'Payment confirmation is taking longer than expected.',
    };
    return messages[s] || '';
  };

  const handleConfirm = () => {
    setPhase('polling');
  };

  const handleCancelPayment = async () => {
    if (cancelling) return;
    setCancelling(true);
    if (phase === 'confirm') {
      try {
        await paymentService.cancelAirtelPayment(transactionId);
      } catch {
        // Cancel is best-effort; proceed with onCancel regardless
      }
    }
    onCancel?.();
  };

  const isTerminal = ['COMPLETED', 'FAILED', 'CANCELLED', 'EXPIRED', 'TIMEOUT'].includes(status);

  if (phase === 'confirm') {
    return (
      <Modal isOpen={true} onClose={handleCancelPayment} title={t?.('airtelMoney.paymentRequestSent') || 'Payment Request Sent'}>
        <div style={{ textAlign: 'center', padding: '24px 16px' }}>
          <div style={{ marginBottom: '20px' }}>
            <Smartphone size={48} style={{ color: 'var(--accent-lime)' }} />
          </div>
          <h3 style={{ color: 'var(--text-white)', marginBottom: '12px', fontSize: '18px' }}>
            {t?.('airtelMoney.paymentRequestTitle') || 'Payment Request Sent'}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6', marginBottom: '4px' }}>
            {t?.('airtelMoney.confirmAmountMsg') || 'A payment request of'}
          </p>
          <p style={{ color: 'var(--text-white)', fontSize: '22px', fontWeight: '800', marginBottom: '4px' }}>
            {formatCurrency(amount)}
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6', marginBottom: '4px' }}>
            {t?.('airtelMoney.confirmPhoneMsg') || 'has been sent to'}
          </p>
          <p style={{ color: 'var(--accent-lime)', fontSize: '16px', fontWeight: '700', marginBottom: '20px' }}>
            {phone}
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.5', marginBottom: '24px' }}>
            {t?.('airtelMoney.confirmInstruction') || 'Please check your phone and authorize the payment by entering your Airtel Money PIN.'}
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button variant="secondary" onClick={handleCancelPayment} disabled={cancelling} style={{ flex: 1 }}>
              {cancelling ? (t?.('common.cancelling') || 'Cancelling...') : (t?.('airtelMoney.cancelPayment') || 'Cancel Payment')}
            </Button>
            <Button variant="primary" onClick={handleConfirm} style={{ flex: 1 }}>
              {t?.('common.ok') || 'OK'}
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={true} onClose={isTerminal && status !== 'COMPLETED' ? handleCancelPayment : undefined} title={t?.('airtelMoney.paymentStatus') || 'Payment Status'}>
      <div style={{ textAlign: 'center', padding: '24px 16px' }}>
        <div style={{ marginBottom: '20px', animation: status === 'PENDING' ? 'pulse 2s infinite' : 'none' }}>
          {STATUS_ICONS[status]}
        </div>

        <h3 style={{ color: 'var(--text-white)', marginBottom: '12px', fontSize: '18px' }}>
          {status === 'PENDING'
            ? (t?.('airtelMoney.checkYourPhone') || 'Check your phone')
            : status === 'COMPLETED'
              ? (t?.('airtelMoney.paymentSuccessful') || 'Payment Successful')
              : status === 'FAILED'
                ? (t?.('airtelMoney.paymentFailedTitle') || 'Payment Failed')
                : status === 'CANCELLED'
                  ? (t?.('airtelMoney.paymentCancelledTitle') || 'Payment Cancelled')
                  : status === 'EXPIRED'
                    ? (t?.('airtelMoney.paymentExpiredTitle') || 'Payment Expired')
                    : (t?.('airtelMoney.paymentTimedOut') || 'Payment Confirmation Delayed')}
        </h3>

        <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' }}>
          {message}
        </p>

        {status === 'PENDING' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
            <Smartphone size={20} color="var(--accent-lime)" />
            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              {t?.('airtelMoney.dialPrompt') || 'Dial *111# or check your Airtel Money app'}
            </span>
          </div>
        )}

        {status === 'FAILED' && (
          <Button variant="primary" onClick={handleCancelPayment} style={{ width: '100%' }}>
            {t?.('airtelMoney.tryAgain') || 'Try Again'}
          </Button>
        )}

        {status === 'CANCELLED' && (
          <Button variant="primary" onClick={handleCancelPayment} style={{ width: '100%' }}>
            {t?.('airtelMoney.tryAgain') || 'Try Again'}
          </Button>
        )}

        {status === 'EXPIRED' && (
          <Button variant="primary" onClick={handleCancelPayment} style={{ width: '100%' }}>
            {t?.('airtelMoney.initiateNewPayment') || 'Initiate New Payment'}
          </Button>
        )}

        {status === 'TIMEOUT' && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="secondary" onClick={handleCancelPayment} style={{ flex: 1 }}>
              {t?.('common.cancel') || 'Cancel'}
            </Button>
            <Button variant="primary" onClick={handleCancelPayment} style={{ flex: 1 }}>
              {t?.('airtelMoney.tryAgain') || 'Try Again'}
            </Button>
          </div>
        )}

        {isTerminal && status !== 'COMPLETED' && status !== 'TIMEOUT' && (
          <Button variant="secondary" onClick={handleCancelPayment} style={{ width: '100%', marginTop: '8px' }}>
            {t?.('common.cancel') || 'Cancel'}
          </Button>
        )}
      </div>
    </Modal>
  );
}
