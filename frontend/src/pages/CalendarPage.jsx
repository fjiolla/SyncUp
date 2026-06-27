import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineArrowTopRightOnSquare } from 'react-icons/hi2';
import { motion, AnimatePresence } from 'framer-motion';
import { podsApi } from '../api/pods';
import { useAuthStore } from '../store/authStore';
import { usePageTitle } from '../hooks/usePageTitle';
import EmptyState from '../components/ui/EmptyState';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function CalendarPage() {
  usePageTitle('Calendar');
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activities, setActivities] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const params = { limit: 100 };
        const [discoverRes, mineRes] = await Promise.all([
          podsApi.discover(params).catch(() => ({ data: { results: [] } })),
          isAuthenticated ? podsApi.getMyPods({ limit: 100 }).catch(() => ({ data: { results: [] } })) : Promise.resolve({ data: { results: [] } }),
        ]);
        const discoverPods = discoverRes.data?.results || [];
        const myPods = (mineRes.data?.results || []).map((m) => m.pod || m).filter(Boolean);
        const merged = [...myPods, ...discoverPods];
        const seen = new Set();
        const unique = merged.filter((p) => {
          if (!p?._id || seen.has(p._id.toString())) return false;
          seen.add(p._id.toString());
          return true;
        });
        setActivities(unique);
      } catch {}
    };
    fetchActivities();
  }, [isAuthenticated]);

  const getDaysInMonth = () => {
    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  };

  const activitiesOnDay = (day) => {
    if (!day) return [];
    return activities.filter((p) => {
      if (!p.startDate) return false;
      const d = new Date(p.startDate);
      return d.getDate() === day && d.getMonth() === month - 1 && d.getFullYear() === year;
    });
  };

  const hasActivities = (day) => activitiesOnDay(day).length > 0;

  const prevMonth = () => setCurrentDate(new Date(year, month - 2, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month, 1));

  const days = getDaysInMonth();
  const today = new Date();
  const isToday = (day) => day === today.getDate() && month - 1 === today.getMonth() && year === today.getFullYear();

  const dayActivities = selectedDay ? activitiesOnDay(selectedDay) : [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-surface-900">Calendar</h1>
        <p className="mt-1 text-surface-500">Activities by date</p>
      </div>

      <div className="bg-white border border-surface-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-surface-50 text-surface-600 transition-colors">
            <HiOutlineChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold text-surface-900">{MONTHS[month - 1]} {year}</h2>
          <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-surface-50 text-surface-600 transition-colors">
            <HiOutlineChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-surface-400 py-2">{d}</div>
          ))}
          {days.map((day, i) => (
            <button
              key={i}
              onClick={() => day && setSelectedDay(day)}
              disabled={!day}
              className={`relative aspect-square flex items-center justify-center rounded-lg text-sm transition-all ${
                !day ? 'cursor-default' :
                selectedDay === day ? 'bg-primary-600 text-white font-medium' :
                isToday(day) ? 'bg-primary-50 text-primary-700 font-medium' :
                'hover:bg-surface-50 text-surface-700'
              }`}
            >
              {day}
              {hasActivities(day) && day !== selectedDay && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary-500 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedDay && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-white border border-surface-200 rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-surface-900 mb-4">
              Activities on {MONTHS[month - 1]} {selectedDay}, {year}
            </h3>

            {dayActivities.length === 0 ? (
              <EmptyState message="No activities on this day" size="sm" />
            ) : (
              <div className="space-y-3">
                {dayActivities.map((pod) => (
                  <button
                    key={pod._id}
                    onClick={() => navigate(`/pods/${pod.slug}`)}
                    className="w-full text-left border border-surface-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-surface-900">{pod.name}</h4>
                        <p className="text-xs text-surface-500 mt-1">
                          {new Date(pod.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {' · '}{pod.eventType === 'in-person' ? 'In person' : pod.eventType === 'virtual' ? 'Virtual' : 'Hybrid'}
                        </p>
                        {pod.location && <p className="text-xs text-surface-400 mt-0.5">{pod.location}</p>}
                      </div>
                      <HiOutlineArrowTopRightOnSquare className="w-4 h-4 text-surface-400 flex-shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
