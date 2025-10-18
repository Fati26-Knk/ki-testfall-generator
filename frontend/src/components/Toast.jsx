import React from 'react';

export default function Toast({ message, type = 'info', onClose }) {
  if (!message) return null;
  const base = 'toast';
  return (
    <div className={`${base} ${base}--${type}`} role="status">
      <div className="toast__message">{message}</div>
      <button className="toast__close" onClick={onClose} aria-label="Close">×</button>
    </div>
  );
}
