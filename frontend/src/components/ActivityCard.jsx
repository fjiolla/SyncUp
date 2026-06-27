import { Link } from 'react-router-dom';
import { HiOutlineMapPin, HiOutlineUserGroup, HiOutlineClock, HiOutlineGlobeAlt, HiOutlineVideoCamera } from 'react-icons/hi2';

const TYPE_META = {
  'virtual': { label: 'Virtual', icon: HiOutlineGlobeAlt, color: 'bg-blue-50 text-blue-700' },
  'in-person': { label: 'In person', icon: HiOutlineMapPin, color: 'bg-emerald-50 text-emerald-700' },
  'hybrid': { label: 'Hybrid', icon: HiOutlineVideoCamera, color: 'bg-purple-50 text-purple-700' },
  'online': { label: 'Virtual', icon: HiOutlineGlobeAlt, color: 'bg-blue-50 text-blue-700' },
  'offline': { label: 'In person', icon: HiOutlineMapPin, color: 'bg-emerald-50 text-emerald-700' },
};

export default function ActivityCard({ pod, compact = false }) {
  const start = pod.startDate ? new Date(pod.startDate) : null;
  const end = pod.endDate ? new Date(pod.endDate) : null;
  const isPast = end && end < new Date();
  const isFull = pod.memberCount >= pod.maxMembers;
  const type = TYPE_META[pod.eventType] || TYPE_META['in-person'];
  const TypeIcon = type.icon;

  const month = start ? start.toLocaleDateString([], { month: 'short' }).toUpperCase() : '—';
  const day = start ? start.getDate() : '';
  const time = start ? start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null;

  return (
    <Link
      to={`/pods/${pod.slug}`}
      className={`block bg-white border border-surface-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow`}
    >
      <div className="flex">
        {pod.banner && (
          <div className="hidden sm:block w-32 flex-shrink-0 bg-surface-100">
            <img src={pod.banner} alt={pod.name} className="w-full h-full object-cover" />
          </div>
        )}
        <div className={`flex-1 ${compact ? 'p-4' : 'p-5'}`}>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-14 text-center">
              <div className={`rounded-lg overflow-hidden ${isPast ? 'bg-surface-100 text-surface-400' : 'bg-primary-50 text-primary-700'}`}>
                <div className="text-[10px] font-semibold uppercase tracking-wide py-0.5 border-b border-current/10">{month}</div>
                <div className="text-xl font-bold py-1">{day || '?'}</div>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-surface-900 truncate">{pod.name}</h3>
                  <p className="text-xs text-surface-500">{pod.category}{pod.customCategory ? ` · ${pod.customCategory}` : ''}</p>
                </div>
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${type.color}`}>
                  <TypeIcon className="w-3 h-3" /> {type.label}
                </span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-surface-500">
                {time && <span className="flex items-center gap-1"><HiOutlineClock className="w-3.5 h-3.5" />{time}</span>}
                {pod.location && pod.eventType !== 'virtual' && <span className="flex items-center gap-1 truncate max-w-[12rem]"><HiOutlineMapPin className="w-3.5 h-3.5" />{pod.location}</span>}
                <span className="flex items-center gap-1"><HiOutlineUserGroup className="w-3.5 h-3.5" />{pod.memberCount}/{pod.maxMembers}{isFull ? ' · full' : ''}</span>
              </div>

              {!compact && pod.description && (
                <p className="mt-2 text-xs text-surface-600 line-clamp-2">{pod.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
