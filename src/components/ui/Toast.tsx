import React, { useEffect } from 'react';
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react';
import type { ToastMessage } from '../../types/auth';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div 
      role="region" 
      aria-label="Notifications"
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full px-4 sm:px-0 pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

interface ToastItemProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-rose-400 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-sky-400 shrink-0" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success':
        return 'border-emerald-500/30';
      case 'warning':
        return 'border-amber-500/30';
      case 'error':
        return 'border-rose-500/30';
      default:
        return 'border-sky-500/30';
    }
  };

  return (
    <div
      role="status"
      className={`pointer-events-auto flex items-center justify-between gap-3 p-4 bg-[#0f172a]/95 backdrop-blur-md text-white rounded-lg shadow-2xl border ${getBorderColor()} animate-in fade-in slide-in-from-bottom-3 duration-200 transition-all`}
    >
      <div className="flex items-center gap-3">
        {getIcon()}
        <p className="text-sm font-medium text-slate-100 leading-snug">{toast.message}</p>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        aria-label="Close notification"
        className="p-1 text-slate-400 hover:text-white rounded transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
