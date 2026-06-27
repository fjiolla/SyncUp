import { useState, useEffect } from 'react';
import { HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import { podsApi } from '../api/pods';
import { usePageTitle } from '../hooks/usePageTitle';
import ActivityCard from '../components/ActivityCard';
import EmptyState from '../components/ui/EmptyState';

const CATEGORIES = ['All', 'Hackathons', 'Adventures', 'Sports', 'Tech', 'Workshops', 'Music', 'Art', 'Networking', 'Travel', 'Wellness', 'Gaming', 'Food'];

export default function DiscoverPage() {
  usePageTitle('Browse activities');
  const [pods, setPods] = useState([]);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = { page: 1, limit: 30 };
    if (search) params.search = search;
    if (category !== 'All') params.category = category;
    const t = setTimeout(() => {
      podsApi.discover(params)
        .then((res) => {
          const items = res.data?.results || [];
          const now = new Date();
          const upcoming = items
            .filter((p) => !p.endDate || new Date(p.endDate) >= now)
            .sort((a, b) => {
              if (!a.startDate) return 1;
              if (!b.startDate) return -1;
              return new Date(a.startDate) - new Date(b.startDate);
            });
          setPods(upcoming);
        })
        .catch(() => setPods([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [search, category]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-surface-900">Browse activities</h1>
        <p className="mt-1 text-surface-500">Hackathons, treks, workshops, meetups — find something to join</p>
      </div>

      <div className="relative">
        <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, description, or tag..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-surface-200 rounded-lg text-sm placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              category === c ? 'bg-primary-600 text-white' : 'bg-white border border-surface-200 text-surface-600 hover:border-primary-300'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border border-surface-200 rounded-xl p-5 animate-pulse h-24" />
          ))}
        </div>
      ) : pods.length === 0 ? (
        <div className="bg-white border border-surface-200 rounded-xl">
          <EmptyState
            message={search ? 'No activities match your search' : 'No upcoming activities in this category'}
            description={search ? 'Try a different search term.' : 'Be the first to host one!'}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {pods.map((pod) => <ActivityCard key={pod._id} pod={pod} />)}
        </div>
      )}
    </div>
  );
}
