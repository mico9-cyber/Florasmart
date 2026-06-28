import React from 'react';

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  icon,
  style = {}
}) {
  let btnClass = 'btn-primary';
  if (variant === 'secondary') btnClass = 'btn-secondary';
  if (variant === 'lime') btnClass = 'btn-lime';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn ${btnClass}`}
      style={{ ...style }}
    >
      {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
      {children}
    </button>
  );
}

