import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { authApi } from '../../api/auth';
import { usePageTitle } from '../../hooks/usePageTitle';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
});

export default function ForgotPasswordPage() {
  usePageTitle('Reset password');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authApi.forgotPassword(data);
    } catch {}
    setSent(true);
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-surface-900 tracking-tight">Reset your password</h1>
        <p className="mt-2 text-sm text-surface-500">We'll send you a link to reset it</p>
      </div>

      <div className="bg-white border border-surface-200 rounded-xl p-8 shadow-sm">
        {sent ? (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 mx-auto bg-primary-50 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <p className="text-sm text-surface-600">If an account with that email exists, we've sent a reset link. Check your inbox.</p>
            <Link to="/login" className="inline-block text-sm text-primary-600 hover:text-primary-700 font-medium">
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register('email')} />
            <Button type="submit" loading={loading} className="w-full">
              Send reset link
            </Button>
          </form>
        )}
      </div>

      {!sent && (
        <p className="mt-6 text-center text-sm text-surface-500">
          Remember your password?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Sign in
          </Link>
        </p>
      )}
    </motion.div>
  );
}
