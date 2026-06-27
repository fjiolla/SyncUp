import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Sidebar from '../components/navigation/Sidebar';
import Header from '../components/navigation/Header';

export default function AppLayout() {
  const { isLoading, isAuthenticated, user } = useAuthStore();

  if (isLoading) return null;

  if (isAuthenticated && user?.needsOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="min-h-screen bg-surface-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 overflow-auto px-8 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
