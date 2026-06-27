import LottiePlayer from './LottiePlayer';
import emptyFeed from '../../assets/animations/empty-feed.json';

export default function EmptyState({ message = 'Nothing here yet', description, action, size = 'md' }) {
  const lottieSize = { sm: 120, md: 160, lg: 200 }[size];
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <LottiePlayer animationData={emptyFeed} width={lottieSize} height={lottieSize} />
      <p className="mt-2 text-sm font-medium text-surface-700">{message}</p>
      {description && <p className="mt-1 text-xs text-surface-500 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
