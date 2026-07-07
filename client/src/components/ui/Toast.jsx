import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '../../utils/helpers';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(({ title, message, type = 'info', duration = 3000 }) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}

      <div
        className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
        role="status"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ toast, onRemove }) => {
  const { title, message, type } = toast;

  const icons = {
    success: <CheckCircle className="text-success" size={20} aria-hidden="true" />,
    error: <AlertCircle className="text-accent" size={20} aria-hidden="true" />,
    info: <Info className="text-primary-400" size={20} aria-hidden="true" />,
  };

  const borders = {
    success: 'border-l-success',
    error: 'border-l-accent',
    info: 'border-l-primary-400',
  };

  return (
    <div
      className={cn(
        'flex w-80 items-start gap-3 p-4 glass-panel border-l-4 rounded-xl shadow-2xl animate-slide-up pointer-events-auto',
        borders[type] || borders.info
      )}
    >
      <div className="flex-shrink-0 mt-0.5">
        {icons[type] || icons.info}
      </div>
      <div className="flex-1 pt-0.5">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {message && <p className="mt-1 text-sm text-gray-300">{message}</p>}
      </div>
      <button
        onClick={onRemove}
        className="flex-shrink-0 ml-4 text-gray-400 hover:text-white transition-colors"
        aria-label="Dismiss notification"
      >
        <X size={16} />
      </button>
    </div>
  );
};
