import { Link } from 'react-router-dom';
import { HiOutlineMapPin, HiOutlineUserGroup, HiOutlineClock } from 'react-icons/hi2';

export default function EventCard({ event, onRsvp, isRegistered, registering, compact = false }) {
  const start = new Date(event.startDate);
  const isPast = new Date(event.endDate) < new Date();
  const isFull = event.attendeeCount >= event.maxParticipants;
  const month = start.toLocaleDateString([], { month: 'short' }).toUpperCase();
  const day = start.getDate();
  const time = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const typeColors = { online: 'bg-blue-50 text-blue-700', offline: 'bg-emerald-50 text-emerald-700', hybrid: 'bg-purple-50 text-purple-700' };

  return (
    <div className={`bg-white border border-surface-200 rounded-xl ${compact ? 'p-4' : 'p-5'} hover:shadow-md transition-shadow`}>
      <div className="flex gap-4">
        <div className="flex-shrink-0 w-14 text-center">
          <div className={`rounded-lg overflow-hidden ${isPast ? 'bg-surface-100 text-surface-400' : 'bg-primary-50 text-primary-700'}`}>
            <div className="text-[10px] font-semibold uppercase tracking-wide py-0.5 border-b border-current/10">{month}</div>
            <div className="text-xl font-bold py-1">{day}</div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-surface-900 truncate">{event.title}</h3>
              {event.pod && (
                <Link to={`/pods/${event.pod.slug}`} className="text-xs text-surface-500 hover:text-primary-700 transition-colors">
                  by {event.pod.name}
                </Link>
              )}
            </div>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 capitalize ${typeColors[event.eventType] || 'bg-surface-100 text-surface-600'}`}>
              {event.eventType}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-surface-500">
            <span className="flex items-center gap-1"><HiOutlineClock className="w-3.5 h-3.5" />{time}</span>
            {event.location && <span className="flex items-center gap-1"><HiOutlineMapPin className="w-3.5 h-3.5" />{event.location}</span>}
            <span className="flex items-center gap-1"><HiOutlineUserGroup className="w-3.5 h-3.5" />{event.attendeeCount}/{event.maxParticipants}</span>
          </div>

          {!compact && event.description && (
            <p className="mt-2 text-xs text-surface-600 line-clamp-2">{event.description}</p>
          )}

          {!isPast && onRsvp && (
            <div className="mt-3">
              {isRegistered ? (
                <button onClick={() => onRsvp(event._id, true)} disabled={registering} className="text-xs font-medium text-primary-700 bg-primary-50 px-3 py-1.5 rounded-md hover:bg-primary-100 transition-colors">
                  ✓ You're going
                </button>
              ) : isFull ? (
                <span className="text-xs font-medium text-surface-400 px-3 py-1.5 bg-surface-50 rounded-md">Event full</span>
              ) : (
                <button onClick={() => onRsvp(event._id, false)} disabled={registering} className="text-xs font-medium text-white bg-primary-600 px-3 py-1.5 rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50">
                  Register
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
