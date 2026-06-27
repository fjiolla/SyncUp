import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { authApi } from '../../api/auth';
import { API_BASE_URL } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { usePageTitle } from '../../hooks/usePageTitle';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(50),
  username: z.string().min(3, 'Username must be at least 3 characters').max(30).regex(/^[a-zA-Z0-9]+$/, 'Letters and numbers only'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const GitHubIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

export default function RegisterPage() {
  usePageTitle('Create account');
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setApiError('');
    setLoading(true);
    try {
      const res = await authApi.register(data);
      localStorage.setItem('accessToken', res.data.accessToken);
      setUser(res.data.user);
      toast.success('Account created');
      navigate('/');
    } catch (err) {
      const message = err.message || 'Registration failed';
      setApiError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Create your account</h1>
        <p className="mt-1.5 text-sm text-surface-500">Join SyncUp and find your community</p>
      </div>

      {apiError && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Full Name" placeholder="Leena Shah" error={errors.fullName?.message} {...register('fullName')} />
        <Input label="Username" placeholder="leenashah" error={errors.username?.message} {...register('username')} />
        <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
        <Input label="Password" type="password" placeholder="8+ characters" error={errors.password?.message} {...register('password')} />

        <Button type="submit" loading={loading} className="w-full">
          Create account
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="flex-1 h-px bg-surface-200" />
        <span className="text-xs text-surface-400">or sign up with</span>
        <div className="flex-1 h-px bg-surface-200" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <a href={`${API_BASE_URL}/auth/google`} className="flex items-center justify-center gap-2 px-4 py-2.5 border border-surface-200 rounded-lg text-sm font-medium text-surface-700 hover:bg-surface-50 transition-colors">
          <GoogleIcon /> Google
        </a>
        <a href={`${API_BASE_URL}/auth/github`} className="flex items-center justify-center gap-2 px-4 py-2.5 border border-surface-200 rounded-lg text-sm font-medium text-surface-700 hover:bg-surface-50 transition-colors">
          <GitHubIcon /> GitHub
        </a>
      </div>

      <p className="mt-8 text-center text-sm text-surface-500">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}
