import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineUserGroup, HiOutlineCalendar, HiOutlineUser, HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import { searchApi } from '../api/search';
import { usePageTitle } from '../hooks/usePageTitle';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'pods', label: 'Pods' },
  { key: 'events', label: 'Events' },
  { key: 'users', label: 'People' },
];

export default function SearchPage() {
  usePageTitle('Search');
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [activeTab, setActiveTab] = useState('all');
  const [results, setResults] = useState({ pods: [], events: [], users: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults({ pods: [], events: [], users: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const type = activeTab !== 'all' ? activeTab : undefined;
        const res = await searchApi.search(q, type);
        setResults(res.data || { pods: [], events: [], users: [] });
      } catch {}
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, activeTab]);

  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setSearchParams(val ? { q: val } : {});
  };

  const isEmpty = results.pods.length === 0 && results.events.length === 0 && results.users.length === 0;
  const hasQuery = query.trim().length >= 2;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-surface-900">Search</h1>
        <p className="mt-1 text-surface-500">Find pods, events, and people</p>
      </div>

      <div className="relative">
        <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleQueryChange}
          placeholder="Search for anything..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-surface-200 rounded-xl text-sm placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
        />
      </div>

      {hasQuery && (
        <div className="flex gap-1 border-b border-surface-200">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
                activeTab === tab.key
                  ? 'text-primary-700'
                  : 'text-surface-500 hover:text-surface-900'
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />
              )}
            </button>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-surface-200 rounded-xl p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-surface-100 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-surface-100 rounded w-1/3" />
                    <div className="h-3 bg-surface-100 rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        ) : hasQuery && isEmpty ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white border border-surface-200 rounded-xl p-12 text-center">
            <HiOutlineMagnifyingGlass className="w-12 h-12 mx-auto text-surface-300" />
            <p className="mt-3 text-surface-500">No results found for "{query}"</p>
          </motion.div>
        ) : (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {(activeTab === 'all' || activeTab === 'pods') && results.pods.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3">Pods</h2>
                <div className="space-y-2">
                  {results.pods.map((pod) => (
                    <Link key={pod._id} to={`/pods/${pod.slug}`} className="flex items-center gap-3 p-4 bg-white border border-surface-200 rounded-xl hover:shadow-sm transition-all">
                      <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 flex-shrink-0">
                        <HiOutlineUserGroup className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-surface-900 truncate">{pod.name}</p>
                        <p className="text-xs text-surface-500 truncate">{pod.description}</p>
                      </div>
                      <span className="text-xs text-surface-400 flex-shrink-0">{pod.memberCount} members</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {(activeTab === 'all' || activeTab === 'events') && results.events.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3">Events</h2>
                <div className="space-y-2">
                  {results.events.map((event) => (
                    <Link key={event._id} to={event.pod?.slug ? `/pods/${event.pod.slug}` : '#'} className="flex items-center gap-3 p-4 bg-white border border-surface-200 rounded-xl hover:shadow-sm transition-all">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                        <HiOutlineCalendar className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-surface-900 truncate">{event.title}</p>
                        <p className="text-xs text-surface-500">
                          {event.pod?.name && `${event.pod.name} • `}
                          {new Date(event.startDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <span className="text-xs text-surface-400 capitalize flex-shrink-0">{event.eventType}</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {(activeTab === 'all' || activeTab === 'users') && results.users.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3">People</h2>
                <div className="space-y-2">
                  {results.users.map((user) => (
                    <Link key={user._id} to={`/u/${user.username}`} className="flex items-center gap-3 p-4 bg-white border border-surface-200 rounded-xl hover:shadow-sm transition-all">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-sm font-semibold text-primary-700 flex-shrink-0">
                        {user.fullName?.charAt(0) || <HiOutlineUser className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-surface-900 truncate">{user.fullName}</p>
                        <p className="text-xs text-surface-500">@{user.username}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
