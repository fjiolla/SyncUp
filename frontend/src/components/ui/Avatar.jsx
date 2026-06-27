import { HiOutlineUser } from 'react-icons/hi2';

const sizes = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-xl',
  xl: 'w-24 h-24 text-2xl',
};

export default function Avatar({ src, name, size = 'md', className = '' }) {
  const initial = name?.charAt(0)?.toUpperCase();
  return (
    <div className={`${sizes[size]} rounded-full bg-primary-100 flex items-center justify-center font-semibold text-primary-700 overflow-hidden flex-shrink-0 ${className}`}>
      {src ? (
        <img src={src} alt={name || 'User'} className="w-full h-full object-cover" />
      ) : initial ? (
        initial
      ) : (
        <HiOutlineUser className="w-1/2 h-1/2" />
      )}
    </div>
  );
}
