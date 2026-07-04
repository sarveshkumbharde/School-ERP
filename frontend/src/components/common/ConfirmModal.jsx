import React from 'react';
import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  type = 'danger', // 'danger' | 'info' | 'success'
}) => {
  if (!isOpen) return null;

  const icons = {
    danger: <AlertTriangle className="text-red-600" size={24} />,
    info: <Info className="text-primary-600" size={24} />,
    success: <CheckCircle2 className="text-emerald-600" size={24} />,
  };

  const buttonClasses = {
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    info: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />

      {/* Modal Box */}
      <div className="relative bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full overflow-hidden transform transition-all p-6 z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full bg-slate-50 flex-shrink-0`}>
            {icons[type]}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-800 mb-1">{title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 btn-transition"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 font-medium text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 btn-transition ${buttonClasses[type]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
