import { HiStar, HiOutlineStar } from 'react-icons/hi2';

export default function StarRating({ value = 0, max = 5, size = 'md', onChange, interactive = false }) {
  const sizeClass = { sm: 'w-3.5 h-3.5', md: 'w-4 h-4', lg: 'w-5 h-5', xl: 'w-6 h-6' }[size];
  return (
    <div className="inline-flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.round(value);
        const Icon = filled ? HiStar : HiOutlineStar;
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(i + 1)}
            className={`${sizeClass} ${filled ? 'text-amber-400' : 'text-surface-300'} ${interactive ? 'hover:text-amber-500 cursor-pointer transition-colors' : 'cursor-default'}`}
            aria-label={`${i + 1} star`}
          >
            <Icon className="w-full h-full" />
          </button>
        );
      })}
    </div>
  );
}
