import React from 'react';
import { useToast } from '../../context/ToastContext';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const iconMap = {
  success: { Icon: CheckCircle2, cls: 'toast-icon-success' },
  error: { Icon: XCircle, cls: 'toast-icon-error' },
  warning: { Icon: AlertTriangle, cls: 'toast-icon-warning' },
  info: { Icon: Info, cls: 'toast-icon-info' },
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        const { Icon, cls } = iconMap[toast.type] || iconMap.success;
        return (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
              <Icon size={18} className={cls} style={{ marginTop: '0.1rem', flexShrink: 0 }} />
              <div>
                <div className="toast-title">{toast.title}</div>
                {toast.message && <div className="toast-message">{toast.message}</div>}
              </div>
            </div>
            <button className="toast-close" onClick={() => removeToast(toast.id)} aria-label="Dismiss">
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
