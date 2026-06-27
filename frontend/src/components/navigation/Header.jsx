import { useState, useEffect } from 'react';
import { HiOutlineBell, HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import UserMenu from '../ui/UserMenu';

export default function Header() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const { unreadCount, refresh } = useNotificationStore();

  useEffect(() => {
    if (!isAuthenticated) return;
    refresh();
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, refresh]);

  useEffect(() => {
    if (isAuthenticated) refresh();
  }, [location.pathname, isAuthenticated, refresh]);

  const handleSearch = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (val.trim().length >= 2) {
      navigate(`/search?q=${encodeURIComponent(val.trim())}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <header className="h-16 border-b border-surface-200 bg-white px-8 flex items-center justify-between sticky top-0 z-10">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            value={query}
            onChange={handleSearch}
            onKeyDown={handleKeyDown}
            placeholder="Search pods, people, or events..."
            className="w-full pl-10 pr-4 py-2 bg-surface-50 border border-surface-200 rounded-lg text-sm placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <>
            <button
              onClick={() => navigate('/notifications')}
              className="relative p-2 rounded-lg hover:bg-surface-50 text-surface-500 hover:text-surface-700 transition-colors"
              aria-label="Notifications"
            >
              <HiOutlineBell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full" />
              )}
            </button>
            <UserMenu />
          </>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
          >
            Sign in
          </button>
        )}
      </div>
    </header>
  );
}
