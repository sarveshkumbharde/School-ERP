import React from 'react';

const SelectInput = ({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select option',
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
      <div className="relative font-sans">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon size={18} />
          </div>
        )}
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`w-full text-slate-800 bg-white border rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all appearance-none ${
            Icon ? 'pl-11' : ''
          } ${
            error
              ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500'
              : 'border-slate-200 focus:ring-primary-500/20 focus:border-primary-500'
          } ${disabled ? 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-100' : ''}`}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {/* Custom arrow indicator */}
        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && (
        <span className="text-xs font-medium text-red-500 animate-in fade-in slide-in-from-top-1 duration-150">
          {error}
        </span>
      )}
    </div>
  );
};

export default SelectInput;
