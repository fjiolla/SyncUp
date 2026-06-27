import { forwardRef } from 'react';

const Input = forwardRef(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-surface-700">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`w-full px-3.5 py-2.5 bg-white border border-surface-200 rounded-lg text-sm text-surface-900 placeholder:text-surface-400 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 ${error ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
