import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { validatePassword } from '../utils/passwordValidation';
import { useTranslation } from 'react-i18next';

export default function PasswordStrengthIndicator({ password, onValidationChange }) {
  const { t } = useTranslation();
  const { valid, rules, score } = validatePassword(password);

  React.useEffect(() => {
    if (onValidationChange) onValidationChange(valid);
  }, [valid, onValidationChange]);

  if (!password) return null;

  const getBarColor = () => {
    if (score <= 33) return 'var(--error)';
    if (score <= 66) return 'var(--warning)';
    return 'var(--success)';
  };

  const getStrengthLabel = () => {
    if (score <= 33) return 'Weak';
    if (score <= 66) return 'Fair';
    if (score < 100) return 'Good';
    return 'Strong';
  };

  return (
    <div style={styles.container}>
      <div style={styles.barRow}>
        <div style={styles.barTrack}>
          <div style={{ ...styles.barFill, width: `${score}%`, backgroundColor: getBarColor() }} />
        </div>
        <span style={{ ...styles.strengthLabel, color: getBarColor() }}>{getStrengthLabel()}</span>
      </div>
      <div style={styles.rulesList}>
        {rules.map((rule) => (
          <div key={rule.id} style={styles.ruleRow}>
            {rule.passed ? (
              <CheckCircle size={13} color="var(--success)" style={{ flexShrink: 0 }} />
            ) : (
              <XCircle size={13} color="var(--text-muted)" style={{ flexShrink: 0 }} />
            )}
            <span style={{ ...styles.ruleLabel, color: rule.passed ? 'var(--success)' : 'var(--text-muted)' }}>
              {rule.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    marginTop: '8px',
    marginBottom: '4px',
  },
  barRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '8px',
  },
  barTrack: {
    flex: 1,
    height: '4px',
    backgroundColor: 'var(--border-green)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease, background-color 0.3s ease',
  },
  strengthLabel: {
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    minWidth: '48px',
    textAlign: 'right',
  },
  rulesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  ruleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  ruleLabel: {
    fontSize: '12px',
    lineHeight: '1.4',
  },
};
