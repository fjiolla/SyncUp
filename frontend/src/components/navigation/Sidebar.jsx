import { NavLink, useNavigate } from 'react-router-dom';
import { HiOutlineHome, HiOutlineUserGroup, HiOutlineCalendar, HiOutlinePlusCircle, HiOutlineChatBubbleLeftRight, HiOutlineUser, HiOutlineSparkles, HiOutlineArrowRightOnRectangle, HiOutlineShieldCheck } from 'react-icons/hi2';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/auth';

const navItems = [
  { to: '/', icon: HiOutlineHome, label: 'Home', end: true },
  { to: '/discover', icon: HiOutlineSparkles, label: 'Browse', end: true },
  { to: '/pods', icon: HiOutlineUserGroup, label: 'My activities', end: true },
  { to: '/events', icon: HiOutlineCalendar, label: 'Calendar', end: true },
  { to: '/pods/create', icon: HiOutlinePlusCircle, label: 'Host activity', end: true },
];

const authOnlyItems = [
  { to: '/chat', icon: HiOutlineChatBubbleLeftRight, label: 'Messages', end: true },
  { to: '/profile', icon: HiOutlineUser, label: 'Profile', end: true },
];

export default function Sidebar() {
  const { user, isAuthenticated, clearUser } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {}
    clearUser();
    toast.success('Signed out');
    navigate('/login');
  };

  return (
    <aside className="w-60 h-screen sticky top-0 border-r border-surface-200 bg-white flex flex-col">
      <div className="h-16 flex items-center gap-2.5 px-6 border-b border-surface-200">
        <img src="/favicon2.jpg" alt="SyncUp" className="w-8 h-8 rounded-lg object-cover" />
        <span className="text-lg font-semibold text-primary-700 tracking-tight">SyncUp</span>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-primary-50 text-primary-700' : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {label}
              </NavLink>
            </li>
          ))}
          {isAuthenticated && authOnlyItems.map(({ to, icon: Icon, label, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-primary-50 text-primary-700' : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {label}
              </NavLink>
            </li>
          ))}
          {isAuthenticated && ['admin', 'superadmin'].includes(user?.role) && (
            <li>
              <NavLink to="/admin" end className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary-50 text-primary-700' : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
                }`
              }>
                <HiOutlineShieldCheck className="w-5 h-5 flex-shrink-0" />
                Admin
              </NavLink>
            </li>
          )}
        </ul>
      </nav>

      {isAuthenticated && (
        <div className="p-3 border-t border-surface-200">
          <div className="flex items-center gap-2.5 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-sm font-medium text-primary-700 flex-shrink-0 overflow-hidden">
              {user?.profileImage ? (
                <img src={user.profileImage} alt={user.fullName} className="w-full h-full object-cover" />
              ) : (
                user?.fullName?.charAt(0) || 'U'
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-surface-900 truncate">{user?.fullName}</p>
              <p className="text-xs text-surface-500 truncate">@{user?.username}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-md hover:bg-surface-100 text-surface-400 hover:text-red-600 transition-colors flex-shrink-0"
              aria-label="Sign out"
              title="Sign out"
            >
              <HiOutlineArrowRightOnRectangle className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
