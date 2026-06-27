import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineCalendar, HiOutlineSparkles, HiOutlineArrowRight } from 'react-icons/hi2';
import { useAuthStore } from '../store/authStore';
import { podsApi } from '../api/pods';
import { usePageTitle } from '../hooks/usePageTitle';
import ActivityCard from '../components/ActivityCard';

export default function DashboardPage() {
  usePageTitle('Home');
  const { user, isAuthenticated } = useAuthStore();
  const [upcoming, setUpcoming] = useState([]);
  const [myActivities, setMyActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      podsApi.discover({ limit: 8, sort: 'startDate' }).then((r) => r.data?.results || []).catch(() => []),
      isAuthenticated
        ? podsApi.getMyPods({ limit: 5 }).then((r) => r.data?.results || []).catch(() => [])
        : Promise.resolve([]),
    ]).then(([up, mine]) => {
      const now = new Date();
      const filtered = up.filter((p) => !p.endDate || new Date(p.endDate) >= now);
      setUpcoming(filtered);
      const mineNormalized = mine
        .map((m) => m.pod || m)
        .filter((p) => p && p.endDate && new Date(p.endDate) >= now)
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
      setMyActivities(mineNormalized);
      setLoading(false);
    });
  }, [isAuthenticated]);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-surface-900">
          {isAuthenticated ? `Welcome back, ${user?.fullName?.split(' ')[0]}` : 'Find activities. Meet people. Make memories.'}
        </h1>
        <p className="mt-1 text-surface-500">
          {isAuthenticated ? 'Here\'s what\'s happening soon' : 'Discover hackathons, adventures, workshops, and more'}
        </p>
      </div>

      {isAuthenticated && myActivities.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-surface-900">Your upcoming activities</h2>
            <Link to="/pods" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              See all <HiOutlineArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {myActivities.slice(0, 3).map((pod) => <ActivityCard key={pod._id} pod={pod} compact />)}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-surface-900">Happening soon</h2>
          <Link to="/discover" className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
            Browse all <HiOutlineArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-surface-200 rounded-xl p-5 animate-pulse h-24" />
            ))}
          </div>
        ) : upcoming.length === 0 ? (
          <div className="bg-white border border-surface-200 rounded-xl p-12 text-center">
            <HiOutlineCalendar className="w-12 h-12 mx-auto text-surface-300" />
            <p className="mt-3 text-surface-500">No upcoming activities yet. Be the first to host one!</p>
            <Link to="/pods/create" className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
              <HiOutlineSparkles className="w-4 h-4" /> Host an activity
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((pod) => <ActivityCard key={pod._id} pod={pod} />)}
          </div>
        )}
      </div>
    </div>
  );
}
