import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineUser, HiOutlineCog6Tooth, HiOutlineArrowRightOnRectangle } from 'react-icons/hi2';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/auth';

export default function UserMenu() {
  const { user, clearUser } = useAuthStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {}
    clearUser();
    toast.success('Signed out');
    navigate('/login');
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-sm font-medium text-primary-700 hover:ring-2 hover:ring-primary-200 transition-all"
        aria-label="User menu"
      >
        {user?.profileImage ? (
          <img src={user.profileImage} alt={user.fullName} className="w-full h-full rounded-full object-cover" />
        ) : (
          user?.fullName?.charAt(0) || 'U'
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-60 bg-white border border-surface-200 rounded-xl shadow-lg overflow-hidden z-50"
          >
            <div className="px-4 py-3 border-b border-surface-100">
              <p className="text-sm font-semibold text-surface-900 truncate">{user?.fullName}</p>
              <p className="text-xs text-surface-500 truncate">{user?.email}</p>
            </div>
            <div className="py-1">
              <button
                onClick={() => { setOpen(false); navigate('/profile'); }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50 transition-colors"
              >
                <HiOutlineUser className="w-4 h-4" /> Profile
              </button>
              <button
                onClick={() => { setOpen(false); navigate('/profile?tab=settings'); }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50 transition-colors"
              >
                <HiOutlineCog6Tooth className="w-4 h-4" /> Settings
              </button>
            </div>
            <div className="py-1 border-t border-surface-100">
              <button
                onClick={() => { setOpen(false); handleLogout(); }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <HiOutlineArrowRightOnRectangle className="w-4 h-4" /> Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
