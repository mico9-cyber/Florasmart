import React, { useState } from 'react';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function FormInput({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  options = [],
  required = false,
  rows = 3,
  ariaInvalid,
  ariaDescribedby
}) {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={id} className="form-label">
          {label} {required && <span style={{ color: 'var(--error)' }}>*</span>}
        </label>
      )}
      
      {type === 'select' ? (
        <select
          id={id}
          value={value}
          onChange={onChange}
          className="form-control"
          style={{ borderColor: error ? 'var(--error)' : 'var(--border-green)' }}
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedby}
          required={required}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          id={id}
          rows={rows}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="form-control"
          style={{
            borderColor: error ? 'var(--error)' : 'var(--border-green)',
            resize: 'vertical'
          }}
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedby}
          required={required}
        />
      ) : (
        <div style={{ position: 'relative' }}>
          <input
            id={id}
            type={inputType}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className="form-control"
            style={{
              borderColor: error ? 'var(--error)' : 'var(--border-green)',
              paddingRight: isPassword ? '40px' : undefined,
            }}
            aria-invalid={ariaInvalid}
            aria-describedby={ariaDescribedby}
            required={required}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
                color: 'var(--text-muted)',
              }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>
      )}

      {error && (
        <span className="form-error">
          <AlertCircle size={14} />
          {error}
        </span>
      )}
    </div>
  );
}

