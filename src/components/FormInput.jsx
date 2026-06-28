import React from 'react';
import { AlertCircle } from 'lucide-react';

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
  rows = 3
}) {
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
        />
      ) : (
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="form-control"
          style={{ borderColor: error ? 'var(--error)' : 'var(--border-green)' }}
        />
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

