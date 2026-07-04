import React from 'react';
import { Plus } from 'lucide-react';

const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-slate-100 shadow-sm max-w-lg mx-auto my-8">
      <div className="p-4 bg-slate-50 rounded-full text-slate-400 mb-4">
        {Icon ? <Icon size={36} /> : <div className="text-4xl">📭</div>}
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-slate-500 text-sm mb-6 max-w-sm">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm rounded-lg shadow-sm hover:shadow btn-transition bounce-hover"
        >
          <Plus size={16} />
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
