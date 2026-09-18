import React from 'react';
import Modal from './Modal';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isDeleting = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '0.5rem' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.12)',
            color: 'var(--danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.5rem',
          }}
        >
          <AlertTriangle size={22} />
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{message}</p>
        <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
          <button className="btn btn-outline" style={{ flex: 1 }} onClick={onClose} disabled={isDeleting}>
            {cancelText}
          </button>
          <button className="btn btn-danger" style={{ flex: 1 }} onClick={onConfirm} disabled={isDeleting}>
            {isDeleting && <RefreshCw size={14} className="pulse" />}
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
