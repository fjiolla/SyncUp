import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { HiOutlineUsers, HiOutlineUserGroup, HiOutlineDocumentText, HiOutlineCalendar, HiOutlineFlag, HiOutlineNoSymbol, HiOutlineMagnifyingGlass, HiOutlineArrowTrendingUp } from 'react-icons/hi2';
import { adminApi } from '../api/admin';
import { useAuthStore } from '../store/authStore';
import { usePageTitle } from '../hooks/usePageTitle';
import Tabs from '../components/ui/Tabs';
import Avatar from '../components/ui/Avatar';

const STAT_CARDS = [
  { key: 'users', icon: HiOutlineUsers, label: 'Users', color: 'bg-blue-50 text-blue-600' },
  { key: 'pods', icon: HiOutlineUserGroup, label: 'Pods', color: 'bg-primary-50 text-primary-600' },
  { key: 'posts', icon: HiOutlineDocumentText, label: 'Posts', color: 'bg-amber-50 text-amber-600' },
  { key: 'events', icon: HiOutlineCalendar, label: 'Events', color: 'bg-purple-50 text-purple-600' },
  { key: 'activePods', icon: HiOutlineArrowTrendingUp, label: 'Active Pods', color: 'bg-emerald-50 text-emerald-600' },
  { key: 'pendingReports', icon: HiOutlineFlag, label: 'Pending Reports', color: 'bg-red-50 text-red-600' },
];

export default function AdminPage() {
  usePageTitle('Admin');
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !['admin', 'superadmin'].includes(user?.role)) return;
    if (tab === 'overview') {
      setLoadingStats(true);
      adminApi.getStats()
        .then((res) => setStats(res.data))
        .catch(() => toast.error('Failed to load stats'))
        .finally(() => setLoadingStats(false));
    } else if (tab === 'users') {
      adminApi.listUsers({ search: userSearch || undefined, status: userFilter || undefined, limit: 50 })
        .then((res) => setUsers(res.data?.results || res.data || []))
        .catch(() => {});
    }
  }, [tab, userSearch, userFilter, isAuthenticated, user?.role]);

  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!['admin', 'superadmin'].includes(user?.role)) {
    return (
      <div className="max-w-2xl mx-auto bg-white border border-surface-200 rounded-xl p-12 text-center">
        <p className="text-surface-600">You don't have access to this page.</p>
        <Link to="/" className="mt-4 inline-block text-sm text-primary-600 hover:text-primary-700 font-medium">
          Back to home
        </Link>
      </div>
    );
  }

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await adminApi.updateUserStatus(userId, newStatus);
      setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, accountStatus: newStatus } : u));
      toast.success(`User ${newStatus}`);
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-surface-900">Admin dashboard</h1>
        <p className="mt-1 text-surface-500">Platform overview and moderation tools</p>
      </div>

      <Tabs
        tabs={[
          { key: 'overview', label: 'Overview' },
          { key: 'users', label: 'Users' },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === 'overview' && (
        <div className="space-y-6">
          {loadingStats || !stats ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {STAT_CARDS.map((s) => (
                <div key={s.key} className="bg-white border border-surface-200 rounded-xl p-5 animate-pulse">
                  <div className="w-10 h-10 bg-surface-100 rounded-lg" />
                  <div className="mt-3 h-7 bg-surface-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {STAT_CARDS.map(({ key, icon: Icon, label, color }) => (
                  <div key={key} className="bg-white border border-surface-200 rounded-xl p-5">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="mt-3 text-2xl font-bold text-surface-900">{stats.totals?.[key] ?? 0}</p>
                    <p className="text-xs text-surface-500 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-surface-200 rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-surface-900">User growth</h3>
                  <div className="mt-4 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-3xl font-bold text-surface-900">{stats.growth?.newUsers7d ?? 0}</p>
                      <p className="text-xs text-surface-500 mt-0.5">New users (7 days)</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-surface-900">{stats.growth?.newUsers30d ?? 0}</p>
                      <p className="text-xs text-surface-500 mt-0.5">New users (30 days)</p>
                    </div>
                  </div>
                  {stats.signupsByDay?.length > 0 && (
                    <SignupChart data={stats.signupsByDay} />
                  )}
                </div>

                <div className="bg-white border border-surface-200 rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-surface-900">Top pods by members</h3>
                  <div className="mt-3 space-y-2">
                    {stats.topPods?.length === 0 ? (
                      <p className="text-sm text-surface-400">No pods yet</p>
                    ) : (
                      stats.topPods?.map((pod) => (
                        <Link key={pod._id} to={`/pods/${pod.slug}`} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-surface-50 transition-colors">
                          <div>
                            <p className="text-sm font-medium text-surface-900">{pod.name}</p>
                            <p className="text-xs text-surface-500">{pod.category}</p>
                          </div>
                          <span className="text-xs text-surface-500">{pod.memberCount} members</span>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {stats.totals?.suspendedUsers > 0 && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-center gap-3">
                  <HiOutlineNoSymbol className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <p className="text-sm text-amber-700">
                    {stats.totals.suspendedUsers} {stats.totals.suspendedUsers === 1 ? 'user is' : 'users are'} suspended
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {tab === 'users' && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search by name, username, or email..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-surface-200 rounded-lg text-sm placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            >
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="deactivated">Deactivated</option>
            </select>
          </div>

          <div className="bg-white border border-surface-200 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-surface-50 border-b border-surface-200">
                <tr>
                  <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-4 py-3">User</th>
                  <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-4 py-3">Email</th>
                  <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-4 py-3">Role</th>
                  <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-right text-xs font-semibold text-surface-500 uppercase tracking-wider px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan="5" className="px-4 py-8 text-center text-sm text-surface-400">No users found</td></tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id} className="border-b border-surface-100 last:border-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar src={u.profileImage} name={u.fullName} size="sm" />
                          <div>
                            <p className="text-sm font-medium text-surface-900">{u.fullName}</p>
                            <p className="text-xs text-surface-500">@{u.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-surface-600">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium text-surface-600 capitalize">{u.role}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full ${
                          u.accountStatus === 'active' ? 'bg-emerald-50 text-emerald-700' :
                          u.accountStatus === 'suspended' ? 'bg-amber-50 text-amber-700' :
                          'bg-surface-100 text-surface-600'
                        }`}>{u.accountStatus}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {u.accountStatus === 'active' ? (
                          <button onClick={() => handleStatusChange(u._id, 'suspended')} className="text-xs text-amber-600 hover:text-amber-700 font-medium">Suspend</button>
                        ) : (
                          <button onClick={() => handleStatusChange(u._id, 'active')} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">Activate</button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function SignupChart({ data }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="mt-4 flex items-end gap-1 h-20">
      {data.slice(-14).map((d) => (
        <div key={d._id} className="flex-1 flex flex-col items-center gap-1" title={`${d._id}: ${d.count}`}>
          <div className="w-full bg-primary-200 rounded-sm transition-all hover:bg-primary-400" style={{ height: `${(d.count / max) * 100}%`, minHeight: '2px' }} />
        </div>
      ))}
    </div>
  );
}
