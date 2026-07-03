import React, { createContext, useCallback, useContext, useState } from 'react';

export const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div style={styles.container}>
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              ...styles.toast,
              ...(t.type === 'success' ? styles.success : {}),
              ...(t.type === 'error' ? styles.error : {}),
              ...(t.type === 'warning' ? styles.warning : {}),
              ...(t.type === 'info' ? styles.info : {}),
            }}
            role="alert"
          >
            <span style={{ flex: 1, fontSize: '14px' }}>{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              style={styles.closeBtn}
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) return () => {};
  return ctx;
}

const styles = {
  container: {
    position: 'fixed',
    top: '16px',
    right: '16px',
    zIndex: 10000,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    maxWidth: '400px',
    width: '100%',
    pointerEvents: 'none',
  },
  toast: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    pointerEvents: 'auto',
    animation: 'slideIn 0.3s ease-out',
    color: '#fff',
    fontSize: '14px',
    lineHeight: '1.4',
    borderLeft: '4px solid transparent',
  },
  success: {
    backgroundColor: '#065f46',
    borderLeftColor: '#22c55e',
  },
  error: {
    backgroundColor: '#7f1d1d',
    borderLeftColor: '#ef4444',
  },
  warning: {
    backgroundColor: '#713f12',
    borderLeftColor: '#f59e0b',
  },
  info: {
    backgroundColor: '#1e3a5f',
    borderLeftColor: '#3b82f6',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.6)',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '0',
    lineHeight: '1',
    flexShrink: 0,
  },
};
