import React from 'react';

const FormInput = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  icon: Icon,
}) => {
  return (
    <div className="w-full flex flex-col gap-1.5 mb-4">
      {label && (
        <label htmlFor={name} className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon size={18} />
          </div>
        )}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`w-full text-slate-800 bg-white border rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all ${
            Icon ? 'pl-11' : ''
          } ${
            error
              ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
              : 'border-slate-200 focus:ring-primary-500/20 focus:border-primary-500'
          } ${disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-100' : ''}`}
        />
      </div>
      {error && (
        <span className="text-xs font-medium text-red-500 animate-in fade-in slide-in-from-top-1 duration-150">
          {error}
        </span>
      )}
    </div>
  );
};

export default FormInput;
