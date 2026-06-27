import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { HiOutlineCheck, HiOutlineXMark } from 'react-icons/hi2';
import { followApi } from '../api/follow';
import { useAuthStore } from '../store/authStore';
import { usePageTitle } from '../hooks/usePageTitle';
import Avatar from '../components/ui/Avatar';
import EmptyState from '../components/ui/EmptyState';

export default function FollowRequestsPage() {
  usePageTitle('Follow requests');
  const { isAuthenticated } = useAuthStore();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null);

  const fetchRequests = async () => {
    try {
      const res = await followApi.getPendingRequests({ limit: 50 });
      setRequests(res.data?.results || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchRequests();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const handleAccept = async (userId) => {
    setActioningId(userId);
    try {
      await followApi.accept(userId);
      setRequests((p) => p.filter((r) => (r.follower?._id || r.follower) !== userId));
      toast.success('Follow request accepted');
    } catch (err) {
      toast.error(err.message || 'Failed to accept');
    }
    setActioningId(null);
  };

  const handleDecline = async (userId) => {
    setActioningId(userId);
    try {
      await followApi.decline(userId);
      setRequests((p) => p.filter((r) => (r.follower?._id || r.follower) !== userId));
      toast.success('Request declined');
    } catch (err) {
      toast.error(err.message || 'Failed to decline');
    }
    setActioningId(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto bg-white border border-surface-200 rounded-xl p-12 text-center">
        <p className="text-surface-600">Sign in to see follow requests</p>
        <Link to="/login" className="mt-4 inline-block px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">Sign in</Link>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-surface-900">Follow requests</h1>
        <p className="mt-1 text-surface-500">Approve who can follow you and see your connections</p>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="bg-white border border-surface-200 rounded-xl p-4 h-16 animate-pulse" />)}
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white border border-surface-200 rounded-xl">
          <EmptyState
            message="No pending requests"
            description="You'll see follow requests here when people want to connect."
          />
        </div>
      ) : (
        <div className="space-y-2">
          {requests.map((r) => {
            const u = r.follower || {};
            const userId = u._id;
            const busy = actioningId === userId;
            return (
              <div key={r._id} className="flex items-center gap-3 p-3 bg-white border border-surface-200 rounded-xl">
                <Link to={`/u/${u.username}`} className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar src={u.profileImage} name={u.fullName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-900 truncate">{u.fullName}</p>
                    <p className="text-xs text-surface-500 truncate">@{u.username}</p>
                  </div>
                </Link>
                <button
                  onClick={() => handleAccept(userId)}
                  disabled={busy}
                  className="px-3 py-1.5 rounded-md bg-primary-600 text-white text-xs font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-1"
                >
                  <HiOutlineCheck className="w-3.5 h-3.5" /> Accept
                </button>
                <button
                  onClick={() => handleDecline(userId)}
                  disabled={busy}
                  className="px-3 py-1.5 rounded-md border border-surface-200 text-surface-600 text-xs font-medium hover:bg-surface-50 transition-colors disabled:opacity-50 flex items-center gap-1"
                >
                  <HiOutlineXMark className="w-3.5 h-3.5" /> Decline
                </button>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
