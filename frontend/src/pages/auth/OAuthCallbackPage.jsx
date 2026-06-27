import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/auth';

export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      navigate('/login');
      return;
    }

    localStorage.setItem('accessToken', token);

    authApi.getProfile()
      .then((res) => {
        setUser(res.data);
        if (res.data?.needsOnboarding) {
          navigate('/onboarding');
        } else {
          navigate('/');
        }
      })
      .catch(() => {
        localStorage.removeItem('accessToken');
        navigate('/login');
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-surface-500">Signing you in...</p>
      </div>
    </div>
  );
}
