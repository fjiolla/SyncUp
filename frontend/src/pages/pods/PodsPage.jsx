import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlinePlusCircle } from 'react-icons/hi2';
import { podsApi } from '../../api/pods';
import { useAuthStore } from '../../store/authStore';
import { usePageTitle } from '../../hooks/usePageTitle';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import ActivityCard from '../../components/ActivityCard';
import Tabs from '../../components/ui/Tabs';

export default function PodsPage() {
  usePageTitle('My activities');
  const { isAuthenticated } = useAuthStore();
  const [pods, setPods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('upcoming');

  useEffect(() => {
    const fetchPods = async () => {
      try {
        if (isAuthenticated) {
          const res = await podsApi.getMyPods({ page: 1, limit: 100 });
          const items = (res.data?.results || []).map((m) => m.pod || m).filter(Boolean);
          setPods(items);
        } else {
          setPods([]);
        }
      } catch {}
      setLoading(false);
    };
    fetchPods();
  }, [isAuthenticated]);

  const now = new Date();
  const upcoming = pods
    .filter((p) => !p.endDate || new Date(p.endDate) >= now)
    .sort((a, b) => new Date(a.startDate || 0) - new Date(b.startDate || 0));
  const past = pods
    .filter((p) => p.endDate && new Date(p.endDate) < now)
    .sort((a, b) => new Date(b.startDate || 0) - new Date(a.startDate || 0));

  const visible = view === 'upcoming' ? upcoming : past;

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-surface-200 rounded-xl p-5 animate-pulse h-24" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-surface-900">My activities</h1>
          <p className="mt-1 text-surface-500">Activities you're hosting or attending</p>
        </div>
        {isAuthenticated && (
          <Link to="/pods/create">
            <Button size="md">
              <HiOutlinePlusCircle className="w-4 h-4 mr-2" /> Host activity
            </Button>
          </Link>
        )}
      </div>

      {!isAuthenticated ? (
        <div className="bg-white border border-surface-200 rounded-xl">
          <EmptyState
            message="Sign in to see your activities"
            description="Track what you're hosting and attending in one place."
            action={
              <Link to="/login" className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
                Sign in
              </Link>
            }
          />
        </div>
      ) : pods.length === 0 ? (
        <div className="bg-white border border-surface-200 rounded-xl">
          <EmptyState
            message="No activities yet"
            description="Browse activities to join, or host one of your own."
            action={
              <div className="flex gap-2">
                <Link to="/discover" className="inline-flex items-center gap-2 px-4 py-2.5 border border-surface-200 text-surface-700 text-sm font-medium rounded-lg hover:bg-surface-50 transition-colors">
                  Browse
                </Link>
                <Link to="/pods/create" className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
                  Host activity
                </Link>
              </div>
            }
          />
        </div>
      ) : (
        <>
          <Tabs
            tabs={[
              { key: 'upcoming', label: `Upcoming · ${upcoming.length}` },
              { key: 'past', label: `Past · ${past.length}` },
            ]}
            active={view}
            onChange={setView}
          />
          {visible.length === 0 ? (
            <div className="bg-white border border-surface-200 rounded-xl">
              <EmptyState message={view === 'upcoming' ? 'No upcoming activities' : 'No past activities yet'} size="sm" />
            </div>
          ) : (
            <div className="space-y-3">
              {visible.map((pod) => <ActivityCard key={pod._id} pod={pod} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}
