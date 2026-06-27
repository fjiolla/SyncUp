import { Outlet, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import LottiePlayer from '../components/ui/LottiePlayer';
import heroAnimation from '../assets/animations/hero-page.json';

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      <div className="hidden lg:flex flex-col items-center justify-center px-8 py-12 bg-primary-50 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm text-center flex flex-col items-center"
        >
          <h1 className="text-3xl font-bold text-primary-900 tracking-tight">Find your people.</h1>
          <p className="mt-3 text-sm text-primary-700/80 leading-relaxed">
            Join activities, meet curious people, and turn weekends into something memorable.
          </p>

          <div className="mt-6 w-full flex items-center justify-center">
            <LottiePlayer animationData={heroAnimation} width={300} height={300} />
          </div>

          <div className="mt-6 flex items-center justify-center gap-5 text-xs text-primary-700">
            <span className="flex items-center gap-1.5">🌱 Join pods</span>
            <span className="flex items-center gap-1.5">📅 Attend events</span>
            <span className="flex items-center gap-1.5">💬 Connect</span>
          </div>
        </motion.div>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <span className="text-xl font-semibold text-primary-700 tracking-tight">SyncUp</span>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
