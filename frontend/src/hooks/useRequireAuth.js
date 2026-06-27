import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function useRequireAuth() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const requireAuth = (callback) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    callback();
  };

  return { isAuthenticated, requireAuth };
}
