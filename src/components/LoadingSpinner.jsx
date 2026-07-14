import React from 'react';
import { RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function LoadingSpinner({ text = 'Loading...', style }) {
  const { t } = useTranslation();
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '48px 20px', color: 'var(--text-muted)', fontSize: '14px', ...style }}>
      <RefreshCw size={20} className="spin" />
      <span>{text}</span>
    </div>
  );
}

export function InlineSpinner({ size = 16 }) {
  return <RefreshCw size={size} className="spin" style={{ animation: 'spin 1.5s linear infinite' }} />;
}
