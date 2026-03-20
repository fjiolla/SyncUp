import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    let cancelled = false;

    const verify = async () => {
      if (!token) {
        setStatus('failed');
        return;
      }

      try {
        await api.get(`/api/auth/verify/${token}`);
        if (cancelled) return;
        setStatus('success');
        toast.success('Email verified successfully. You can now log in.');
      } catch (error) {
        if (cancelled) return;
        setStatus('failed');
        toast.error(error.response?.data?.message || 'Verification failed');
      }
    };

    verify();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-zinc-200 rounded-xl p-6 text-center space-y-4 shadow-sm">
        {status === 'verifying' && (
          <>
            <h1 className="text-xl font-semibold text-zinc-900">Verifying your email...</h1>
            <p className="text-sm text-zinc-500">Please wait while we validate your verification link.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <h1 className="text-xl font-semibold text-zinc-900">Email verified</h1>
            <p className="text-sm text-zinc-500">Your account is now active. You can log in from the home page.</p>
            <button
              onClick={() => navigate('/')}
              className="w-full py-2.5 rounded-md bg-zinc-900 text-white text-sm font-medium hover:bg-black transition-colors"
            >
              Go to Home
            </button>
          </>
        )}

        {status === 'failed' && (
          <>
            <h1 className="text-xl font-semibold text-zinc-900">Verification failed</h1>
            <p className="text-sm text-zinc-500">This link is invalid or expired. Please request a new verification email.</p>
            <Link to="/" className="block w-full py-2.5 rounded-md border border-zinc-200 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors">
              Back to Home
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

