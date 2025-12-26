import React, { useEffect, useRef } from 'react';

/**
 * ConfirmDialog - lightweight, dependency-free confirmation modal
 * Props:
 * - open: boolean
 * - title: string
 * - message: string | ReactNode
 * - confirmText: string (default "Löschen")
 * - cancelText: string (default "Abbrechen")
 * - onConfirm: () => void
 * - onCancel: () => void
 * - tone: 'danger' | 'default' (button style)
 */
export default function ConfirmDialog({
  open,
  title = 'Bestätigen',
  message,
  confirmText = 'Löschen',
  cancelText = 'Abbrechen',
  onConfirm,
  onCancel,
  tone = 'danger',
}) {
  const dialogRef = useRef(null);
  const cancelBtnRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    // Focus cancel button so keyboard users can quickly back out
    cancelBtnRef.current?.focus();

    function onKeyDown(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel?.();
      }
      if (e.key === 'Enter') {
        // Enter confirms
        e.preventDefault();
        onConfirm?.();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onCancel, onConfirm]);

  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
        padding: 16,
      }}
      aria-modal="true"
      role="dialog"
    >
      <div
        ref={dialogRef}
        style={{
          background: 'white',
          borderRadius: 12,
          width: 'min(520px, 100%)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', padding: 20, gap: 12 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background:
                tone === 'danger'
                  ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)'
                  : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: 'white',
              boxShadow:
                tone === 'danger'
                  ? '0 6px 16px rgba(239, 68, 68, 0.35)'
                  : '0 6px 16px rgba(59, 130, 246, 0.35)',
              flex: 'none',
            }}
            aria-hidden
          >
            {tone === 'danger' ? '🗑️' : '❓'}
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '2px 0 6px 0', color: '#111827' }}>{title}</h3>
            <div style={{ color: '#4b5563', fontSize: 14, lineHeight: 1.5 }}>{message}</div>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
            padding: '12px 20px 20px',
          }}
        >
          <button
            ref={cancelBtnRef}
            onClick={() => onCancel?.()}
            style={{
              padding: '10px 16px',
              background: '#f3f4f6',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 600,
              color: '#374151',
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={() => onConfirm?.()}
            style={{
              padding: '10px 16px',
              background:
                tone === 'danger'
                  ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 700,
              boxShadow:
                tone === 'danger'
                  ? '0 4px 10px rgba(239, 68, 68, 0.35)'
                  : '0 4px 10px rgba(16, 185, 129, 0.35)',
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
