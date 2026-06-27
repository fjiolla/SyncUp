import { motion } from 'framer-motion';
import LottiePlayer from './ui/LottiePlayer';
import appLoader from '../assets/animations/app-loader.json';

export default function SplashScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col items-center"
      >
        <LottiePlayer animationData={appLoader} width={200} height={200} />
        <p className="mt-6 text-xl font-semibold text-primary-700 tracking-tight">SyncUp</p>
        <p className="mt-1.5 text-sm text-surface-400">Finding your community</p>
      </motion.div>
    </motion.div>
  );
}
