import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { HiOutlineSparkles, HiOutlineCheck } from 'react-icons/hi2';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/auth';
import { usePageTitle } from '../../hooks/usePageTitle';
import Button from '../../components/ui/Button';
import SuccessAnimation from '../../components/ui/SuccessAnimation';

const INTERESTS = ['Technology', 'Design', 'Business', 'Education', 'Hobbies', 'Sports', 'Travel', 'Music', 'Art', 'Gaming', 'Health', 'Photography', 'Books', 'Food', 'Movies'];

export default function OnboardingPage() {
  usePageTitle('Complete your profile');
  const { user, setUser, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user && !user.needsOnboarding) return <Navigate to="/" replace />;

  const toggleInterest = (i) => {
    setSelectedInterests((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    );
  };

  const usernameValid = /^[a-zA-Z0-9_]{3,30}$/.test(username);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!usernameValid) {
      setError('Username must be 3-30 characters, letters/numbers/underscores only');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.completeOnboarding({
        username: username.toLowerCase(),
        bio: bio.trim() || undefined,
        interests: selectedInterests,
      });
      setUser(res.data);
      setSuccess(true);
      toast.success('Welcome to SyncUp!');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      const msg = err.message || 'Failed to complete onboarding';
      setError(msg);
      toast.error(msg);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto bg-primary-50 rounded-full flex items-center justify-center text-primary-600">
            <HiOutlineSparkles className="w-6 h-6" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-surface-900 tracking-tight">
            Welcome, {user?.fullName?.split(' ')[0]}
          </h1>
          <p className="mt-1.5 text-sm text-surface-500">Let's finish setting up your profile</p>
        </div>

        {success ? (
          <div className="bg-white border border-surface-200 rounded-xl p-12 text-center">
            <SuccessAnimation size={100} message="You're all set!" />
            <p className="mt-4 text-sm text-surface-500">Taking you to SyncUp...</p>
          </div>
        ) : (
          <div className="bg-white border border-surface-200 rounded-xl p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Pick a username</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-surface-400">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="yourname"
                    autoFocus
                    className="w-full pl-8 pr-3.5 py-2.5 bg-white border border-surface-200 rounded-lg text-sm text-surface-900 placeholder:text-surface-400 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
                <p className="mt-1 text-xs text-surface-400">Letters, numbers, underscores. 3-30 characters.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">Bio (optional)</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="Tell people what you're into..."
                  className="w-full px-3.5 py-2.5 bg-white border border-surface-200 rounded-lg text-sm placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-2">Your interests</label>
                <p className="text-xs text-surface-400 mb-3">We'll use these to recommend pods you might like.</p>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((interest) => {
                    const active = selectedInterests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggleInterest(interest)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          active
                            ? 'bg-primary-600 text-white border-primary-600'
                            : 'bg-white text-surface-700 border-surface-200 hover:border-primary-300 hover:bg-primary-50'
                        }`}
                      >
                        {active && <HiOutlineCheck className="w-3 h-3" />}
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>

              {error && (
                <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">{error}</div>
              )}

              <Button type="submit" loading={loading} className="w-full">
                Complete setup
              </Button>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
}
