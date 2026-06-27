import { RouterProvider } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { router } from './router/index';
import { useAuth } from './hooks/useAuth';
import { useAuthStore } from './store/authStore';
import SplashScreen from './components/SplashScreen';
import ConfirmHost from './components/ui/ConfirmHost';

export default function App() {
  useAuth();
  const isLoading = useAuthStore((s) => s.isLoading);

  return (
    <>
      <AnimatePresence>
        {isLoading && <SplashScreen />}
      </AnimatePresence>
      {!isLoading && <RouterProvider router={router} />}
      <ConfirmHost />
    </>
  );
}
