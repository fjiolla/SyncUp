import LottiePlayer from './LottiePlayer';
import successCheck from '../../assets/animations/success-check.json';

export default function SuccessAnimation({ size = 80, message }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <LottiePlayer animationData={successCheck} width={size} height={size} loop={false} />
      {message && <p className="text-sm font-medium text-surface-700">{message}</p>}
    </div>
  );
}
