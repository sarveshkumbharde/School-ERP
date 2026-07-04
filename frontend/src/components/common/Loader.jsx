import React from 'react';

const Loader = ({ fullPage = false, size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-3',
    lg: 'h-16 w-16 border-4',
  };

  const containerClasses = fullPage
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-slate-50/80 backdrop-blur-sm'
    : 'flex items-center justify-center p-8 w-full';

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center gap-3">
        <div
          className={`${sizeClasses[size] || sizeClasses.md} animate-spin rounded-full border-primary-100 border-t-primary-600`}
        />
        {fullPage && (
          <p className="text-slate-500 font-medium text-sm animate-pulse">
            Loading School ERP...
          </p>
        )}
      </div>
    </div>
  );
};

export default Loader;
