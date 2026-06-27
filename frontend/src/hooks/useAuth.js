import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/auth';

export function useAuth() {
  const { setUser, setLoading, isLoading } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }

    authApi.getProfile()
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem('accessToken');
        setLoading(false);
      });
  }, [setUser, setLoading]);

  return { isLoading };
}
