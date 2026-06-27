import { motion } from 'framer-motion';

const variants = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500/30',
  secondary: 'bg-surface-100 text-surface-700 hover:bg-surface-200 focus:ring-surface-500/20',
  ghost: 'text-surface-600 hover:bg-surface-50 hover:text-surface-900',
  danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500/30',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-sm',
};

export default function Button({ children, variant = 'primary', size = 'md', loading = false, className = '', ...props }) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={`inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </motion.button>
  );
}
