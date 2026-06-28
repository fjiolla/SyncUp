import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineBell, HiOutlineCheckCircle, HiOutlineUserPlus, HiOutlineUserGroup,
  HiOutlineCheck, HiOutlineXMark, HiOutlineChatBubbleLeftRight, HiOutlineCalendarDays,
} from 'react-icons/hi2';
import { notificationsApi } from '../api/notifications';
import { followApi } from '../api/follow';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { usePageTitle } from '../hooks/usePageTitle';
import { toast } from 'sonner';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';

const TYPE_ICON = {
  follow_request: HiOutlineUserPlus,
  follow_accept: HiOutlineCheck,
  new_follower: HiOutlineUserPlus,
  join_request: HiOutlineUserGroup,
  join_approved: HiOutlineCheck,
  join_rejected: HiOutlineXMark,
  pod_invite: HiOutlineUserGroup,
  event_invite: HiOutlineCalendarDays,
  event_update: HiOutlineCalendarDays,
  event_reminder: HiOutlineCalendarDays,
  event_cancelled: HiOutlineXMark,
  role_change: HiOutlineUserGroup,
  new_message: HiOutlineChatBubbleLeftRight,
};

export default function NotificationsPage() {
  usePageTitle('Notifications');
  const { isAuthenticated } = useAuthStore();
  const refreshUnread = useNotificationStore((s) => s.refresh);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [actioningId, setActioningId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchNotifications = async () => {
      setLoadError(false);
      try {
        const res = await notificationsApi.getAll({ page: 1, limit: 50 });
        setNotifications(res.data?.results || []);
      } catch {
        setLoadError(true);
      }
      setLoading(false);
    };
    fetchNotifications();
  }, [isAuthenticated]);

  const handleMarkRead = async (id) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
      refreshUnread();
    } catch {}
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      refreshUnread();
    } catch {}
    setMarkingAll(false);
  };

  const handleClick = async (n) => {
    if (n.type === 'follow_request') return;
    if (!n.isRead) await handleMarkRead(n._id);
    if (n.type === 'new_message') {
      navigate('/chat');
      return;
    }
    if (n.referenceType === 'Pod' && n.referenceSlug) {
      navigate(`/pods/${n.referenceSlug}`);
      return;
    }
    if (n.sender?.username) {
      navigate(`/u/${n.sender.username}`);
    }
  };

  const handleAcceptFollow = async (n) => {
    if (!n.sender?._id) return;
    setActioningId(n._id);
    try {
      await followApi.accept(n.sender._id);
      setNotifications((prev) => prev.filter((x) => x._id !== n._id));
      refreshUnread();
      toast.success(`Accepted @${n.sender.username}'s request`);
    } catch (err) {
      toast.error(err.message || 'Failed to accept');
    }
    setActioningId(null);
  };

  const handleDeclineFollow = async (n) => {
    if (!n.sender?._id) return;
    setActioningId(n._id);
    try {
      await followApi.decline(n.sender._id);
      setNotifications((prev) => prev.filter((x) => x._id !== n._id));
      refreshUnread();
      toast.success('Request declined');
    } catch (err) {
      toast.error(err.message || 'Failed to decline');
    }
    setActioningId(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto bg-white border border-surface-200 rounded-xl p-12 text-center">
        <HiOutlineBell className="w-12 h-12 mx-auto text-surface-300" />
        <p className="mt-3 text-surface-600">Sign in to see your notifications</p>
        <button onClick={() => navigate('/login')} className="mt-4 px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
          Sign in
        </button>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const subtitle = notifications.length === 0
    ? 'All caught up'
    : unreadCount > 0
      ? `${unreadCount} unread`
      : `${notifications.length} notification${notifications.length === 1 ? '' : 's'}`;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-surface-900">Notifications</h1>
          <p className="mt-1 text-surface-500">{subtitle}</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" loading={markingAll} onClick={handleMarkAllRead}>
            <HiOutlineCheckCircle className="w-4 h-4 mr-1.5" /> Mark all read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border border-surface-200 rounded-xl p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-surface-100 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-surface-100 rounded w-1/2" />
                  <div className="h-3 bg-surface-100 rounded w-3/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : loadError ? (
        <div className="bg-white border border-surface-200 rounded-xl">
          <EmptyState
            message="Couldn't load notifications"
            description="Something went wrong. Please try again."
          />
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white border border-surface-200 rounded-xl">
          <EmptyState message="No notifications yet" description="When something happens, you'll see it here." />
        </div>
      ) : (
        <AnimatePresence>
          <div className="space-y-2">
            {notifications.map((n) => {
              const Icon = TYPE_ICON[n.type] || HiOutlineBell;
              return (
                <motion.div
                  key={n._id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer hover:shadow-sm ${
                    n.isRead ? 'bg-white border-surface-200' : 'bg-primary-50/30 border-primary-100'
                  }`}
                  onClick={() => handleClick(n)}
                >
                  <div className="relative flex-shrink-0">
                    {n.sender ? (
                      <Avatar src={n.sender.profileImage} name={n.sender.fullName} size="md" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-surface-100 flex items-center justify-center text-surface-500">
                        <Icon className="w-5 h-5" />
                      </div>
                    )}
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary-600 text-white flex items-center justify-center ring-2 ring-white">
                      <Icon className="w-3 h-3" />
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-900">{n.title}</p>
                    {n.body && <p className="text-xs text-surface-500 mt-0.5">{n.body}</p>}
                    <p className="text-xs text-surface-400 mt-1">
                      {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {n.type === 'follow_request' && (
                      <div className="mt-2 flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleAcceptFollow(n)}
                          disabled={actioningId === n._id}
                          className="px-3 py-1.5 rounded-md bg-primary-600 text-white text-xs font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                        >
                          <HiOutlineCheck className="w-3.5 h-3.5" /> Accept
                        </button>
                        <button
                          onClick={() => handleDeclineFollow(n)}
                          disabled={actioningId === n._id}
                          className="px-3 py-1.5 rounded-md border border-surface-200 text-surface-600 text-xs font-medium hover:bg-surface-50 transition-colors disabled:opacity-50 flex items-center gap-1"
                        >
                          <HiOutlineXMark className="w-3.5 h-3.5" /> Decline
                        </button>
                      </div>
                    )}
                  </div>
                  {!n.isRead && <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-2" />}
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}
