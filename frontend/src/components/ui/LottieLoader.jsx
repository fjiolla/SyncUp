import LottiePlayer from './LottiePlayer';

export default function LottieLoader({ animationData, size = 120, message }) {
  if (!animationData) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
        {message && <p className="text-sm text-surface-500">{message}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <LottiePlayer animationData={animationData} width={size} height={size} />
      {message && <p className="text-sm text-surface-500">{message}</p>}
    </div>
  );
}
