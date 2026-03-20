import React, { useState } from 'react'
import { Card } from '../components/ui/Card'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X, Plus, Search } from 'lucide-react'
import { usePods } from '../context/PodsContext'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import toast from 'react-hot-toast'

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Exact 2026 Prominent Indian Holidays
const indianHolidays = [
  { month: 0, date: 26, name: 'Republic Day', emoji: '🇮🇳' },
  { month: 2, date: 3, name: 'Holi', emoji: '🎨' },
  { month: 7, date: 15, name: 'Independence Day', emoji: '🇮🇳' },
  { month: 9, date: 2, name: 'Gandhi Jayanti', emoji: '🕊️' },
  { month: 10, date: 8, name: 'Diwali', emoji: '🪔' },
];

export default function Calendar() {
  const { pods, deletePod } = usePods();
  const { user, updateProfile, requireAuth } = useAuth();
  const navigate = useNavigate();
  
  // State for navigating months
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Custom Event Modal State
  const [activeDateModal, setActiveDateModal] = useState(null);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Search & Delete states
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const emptyDaysStart = Array.from({ length: firstDayOfMonth }, (_, i) => i);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const handlePrevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  const handleToday = () => setCurrentDate(new Date());

  const handleDayClick = (day) => {
    if (!user) {
      requireAuth(() => setActiveDateModal(day));
      return;
    }
    setActiveDateModal(day);
  };

  const handleNavigateToPods = (day) => {
    const selectedDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    navigate(`/?date=${selectedDateStr}`);
  };

  const handleAddCustomEvent = async (e) => {
    e.preventDefault();
    if (!newEventTitle.trim()) {
      toast.error('Event title cannot be empty');
      return;
    }
    
    const selectedDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(activeDateModal).padStart(2, '0')}`;

    // Check for duplicate custom events on exactly the same day
    const isDuplicate = user?.customEvents?.some(
      evt => evt.date === selectedDateStr && evt.title.trim().toLowerCase() === newEventTitle.trim().toLowerCase()
    );

    if (isDuplicate) {
      toast.error('This event already exists on this exact date');
      return;
    }
    
    setIsSaving(true);
    
    const newEvent = { date: selectedDateStr, title: newEventTitle.trim() };
    const updatedEvents = [...(user.customEvents || []), newEvent];
    
    // AuthContext's updateProfile hits PUT /api/users/profile, taking customEvents.
    const success = await updateProfile({ customEvents: updatedEvents });
    if (success) {
      setNewEventTitle('');
      setActiveDateModal(null);
      toast.success('Event added successfully!');
    } else {
      toast.error('Failed to add event.');
    }
    setIsSaving(false);
  };

  const confirmDeleteCustomEvent = async () => {
    if (!eventToDelete) return;
    
    setIsSaving(true);
    try {
      if (eventToDelete.type === 'Pod') {
        await deletePod(eventToDelete._id);
        setEventToDelete(null);
      } else {
        const updatedEvents = (user.customEvents || []).filter(
          evt => !(evt.date === eventToDelete.date && evt.title === eventToDelete.title)
        );
        await updateProfile({ customEvents: updatedEvents });
        setEventToDelete(null);
        toast.success('Event deleted');
      }
    } catch (error) {
      toast.error('Failed to remove event');
    } finally {
      setIsSaving(false);
    }
  };

  // Global cross-month search logic
  const getGlobalSearchResults = () => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    const results = [];
    
    // Search Indian Holidays
    indianHolidays.forEach(h => {
      if (h.name.toLowerCase().includes(q)) {
        results.push({
          id: `hol-${h.month}-${h.date}`,
          type: 'Holiday',
          title: h.name,
          emoji: h.emoji,
          year: 2026,
          month: h.month,
          date: h.date,
          dateObj: new Date(2026, h.month, h.date)
        });
      }
    });
    
    // Search Custom Events
    (user?.customEvents || []).forEach((evt, idx) => {
      if (evt.title.toLowerCase().includes(q)) {
        const [y, m, d] = evt.date.split('-');
        results.push({
          id: `cust-${idx}`,
          type: 'Personal',
          title: evt.title,
          emoji: '📅',
          year: parseInt(y),
          month: parseInt(m) - 1,
          date: parseInt(d),
          dateObj: new Date(parseInt(y), parseInt(m) - 1, parseInt(d))
        });
      }
    });
    
    // Search Pods
    pods.forEach(pod => {
      if (pod.dateTime && pod.title.toLowerCase().includes(q)) {
        const d = new Date(pod.dateTime);
        results.push({
          id: `pod-${pod._id}`,
          type: 'Pod',
          title: pod.title,
          emoji: '🤝',
          year: d.getFullYear(),
          month: d.getMonth(),
          date: d.getDate(),
          dateObj: d
        });
      } else if (pod.date && pod.title.toLowerCase().includes(q)) { // fallback for legacy mock pods without dateTime
        const d = new Date(pod.date);
        results.push({
          id: `pod-${pod._id}`,
          type: 'Pod',
          title: pod.title,
          emoji: '🤝',
          year: d.getFullYear(),
          month: d.getMonth(),
          date: d.getDate(),
          dateObj: d
        });
      }
    });

    results.sort((a, b) => a.dateObj - b.dateObj);
    return results.slice(0, 8);
  };

  const searchResults = getGlobalSearchResults();

  const handleJumpToEvent = (year, month) => {
    setCurrentDate(new Date(year, month, 1));
    setShowSearchDropdown(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 delay-100 fill-mode-both max-w-5xl mx-auto relative">
      <div className="flex items-center justify-between bg-white px-6 py-4 rounded-xl border border-zinc-200/80 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 flex items-center justify-center rounded-lg text-blue-600">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
            {monthNames[currentMonth]} {currentYear}
            {currentYear !== 2026 && (
              <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100 uppercase tracking-wide">
                Holidays: 2026 Only
              </span>
            )}
          </h2>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block w-48 lg:w-64">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input 
              type="text" 
              placeholder="Search holidays..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => { if(searchQuery) setShowSearchDropdown(true); }}
              onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
              className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-[13px] focus:outline-none focus:border-blue-400 focus:bg-white transition-colors"
            />
            
            {showSearchDropdown && searchQuery && (
              <div className="absolute top-11 right-0 w-[300px] bg-white border border-zinc-200 rounded-lg shadow-xl z-50 overflow-hidden">
                <div className="max-h-64 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    searchResults.map(res => (
                      <button 
                        key={res.id} 
                        onClick={() => handleJumpToEvent(res.year, res.month)}
                        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-zinc-50 border-b border-zinc-50 last:border-0 text-left transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[14px]">{res.emoji}</span>
                          <div>
                            <p className="text-[13px] font-semibold text-zinc-900">{res.title}</p>
                            <p className="text-[11px] font-medium text-zinc-500">
                              {monthNames[res.month]} {res.date}, {res.year} • {res.type}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-zinc-500 text-[13px] font-medium">
                      No matching events found.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 border-l border-zinc-200 pl-4 ml-1">
            <button onClick={handlePrevMonth} className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors cursor-pointer">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={handleToday} className="px-3 py-1.5 text-[13px] font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-md transition-colors shadow-sm cursor-pointer">
              Today
            </button>
            <button onClick={handleNextMonth} className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors cursor-pointer">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden bg-white border border-zinc-200/80 shadow-sm rounded-xl">
        <div className="grid grid-cols-7 border-b border-zinc-100 bg-zinc-50/50">
          {weekDays.map(day => (
             <div key={day} className="py-3.5 text-center text-[11px] font-bold text-zinc-500 uppercase tracking-widest bg-zinc-100/50">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 auto-rows-[140px]">
          {emptyDaysStart.map((_, i) => (
            <div key={`prev-${i}`} className="border-r border-b border-zinc-50 bg-zinc-50/30 p-2 opacity-40 pointer-events-none" />
          ))}
          
          {daysArray.map(day => {
            const isToday = new Date().getDate() === day && new Date().getMonth() === currentMonth && new Date().getFullYear() === currentYear;
            const fullDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            
            const holiday = currentYear === 2026 
              ? indianHolidays.find(h => h.date === day && h.month === currentMonth)
              : null;
            
            const dayPods = pods.filter(pod => {
              if (!pod.date) return false;
              if (pod.role !== 'organizer' && pod.role !== 'member') return false;
              const d = new Date(pod.date);
              return d.getFullYear() === currentYear && d.getMonth() === currentMonth && d.getDate() === day;
            });

            // Extract User's custom personal events
            const personalEvents = (user?.customEvents || []).filter(e => e.date === fullDateStr);

            // Search logic overlay
            const q = searchQuery.toLowerCase().trim();
            const hasMatch = q && (
              (holiday && holiday.name.toLowerCase().includes(q)) ||
              personalEvents.some(evt => evt.title.toLowerCase().includes(q)) ||
              dayPods.some(pod => pod.title.toLowerCase().includes(q))
            );
            
            const opacityClass = (q && !hasMatch) ? 'opacity-30 grayscale' : '';
            const highlightClass = hasMatch ? 'ring-2 ring-blue-500 ring-inset bg-blue-50/50 z-10' : '';

            return (
              <div 
                key={day} 
                onClick={() => handleDayClick(day)}
                className={`
                  relative border-r border-b border-zinc-100 p-2 hover:bg-blue-50/30 transition-all duration-300 group cursor-pointer 
                  flex flex-col gap-1 overflow-hidden
                  ${isToday ? 'bg-blue-50/10' : ''}
                  ${opacityClass}
                  ${highlightClass}
                `}
              >
                <div className="flex items-start justify-between">
                  <div className={`
                    inline-flex items-center justify-center w-7 h-7 rounded-full text-[13px] font-bold mt-1 ml-1 transition-all
                    ${isToday ? 'bg-blue-600 text-white shadow-sm' : 'text-zinc-700 group-hover:bg-zinc-200'}
                  `}>
                    {day}
                  </div>
                </div>

                <div className="mt-1 space-y-1.5 px-1 flex-1 overflow-y-auto custom-scrollbar">
                  {holiday && (
                    <div className="w-full text-[10px] font-bold truncate bg-orange-50 text-orange-700 px-2 py-1.5 rounded flex items-center gap-1.5 border border-orange-100/50" title={holiday.name}>
                      <span>{holiday.emoji}</span> {holiday.name}
                    </div>
                  )}

                  {personalEvents.map((evt, idx) => (
                    <div key={idx} onClick={(e) => { e.stopPropagation(); setEventToDelete(evt); }} className="w-full text-[11px] font-semibold truncate bg-purple-50 border border-purple-200 hover:border-red-300 hover:bg-red-50 hover:text-red-700 shadow-sm text-purple-700 px-2 py-1.5 rounded flex items-center gap-1.5 transition-colors" title="Click to delete">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0" />
                      {evt.title}
                    </div>
                  ))}

                  {dayPods.map(pod => (
                    <div 
                      key={pod._id} 
                      onClick={(e) => {
                        e.stopPropagation();
                        // Prevent opening the activeDate modal, either open delete config or navigate to feed
                        if (pod.role === 'organizer') {
                          setEventToDelete({ ...pod, type: 'Pod' });
                        } else {
                          navigate(`/?search=${encodeURIComponent(pod.title)}`);
                        }
                      }}
                      className="w-full text-[11px] font-semibold truncate bg-white border border-zinc-200/80 shadow-sm text-zinc-700 px-2 py-1.5 rounded flex items-center gap-1.5 group-hover:border-blue-200 transition-colors cursor-pointer" 
                      title={pod.role === 'organizer' ? 'Click to delete your pod' : pod.title}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                      {pod.title}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Popover Modal for Day Options */}
      {activeDateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={() => setActiveDateModal(null)} />
          
          <div className="relative bg-white rounded-xl shadow-xl border border-zinc-200/80 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-4 flex items-center justify-between border-b border-zinc-100/80 bg-zinc-50/50">
              <h2 className="text-[15px] font-semibold text-zinc-900 tracking-tight">
                {monthNames[currentMonth]} {activeDateModal}, {currentYear}
              </h2>
              <button onClick={() => setActiveDateModal(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-200/50 text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-[12px] font-semibold text-zinc-900 uppercase tracking-wide mb-3">Community Events</h3>
                <Button 
                  onClick={() => handleNavigateToPods(activeDateModal)}
                  className="w-full py-2.5 bg-zinc-900 hover:bg-black text-[13px] text-white shadow-sm flex items-center justify-center gap-2"
                >
                  <CalendarIcon className="w-4 h-4" /> Browse Pods
                </Button>
                <p className="text-[11px] text-zinc-500 font-medium mt-2 text-center">Search for events happening on this exact day</p>
              </div>

              <div className="border-t border-zinc-100 pt-5">
                <h3 className="text-[12px] font-semibold text-zinc-900 uppercase tracking-wide mb-3">Add Custom Holiday / Event</h3>
                <form onSubmit={handleAddCustomEvent} className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    placeholder="e.g. Birthday, Vacation..."
                    className="flex-1 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-[13px] focus:outline-none focus:border-blue-400 focus:bg-white transition-colors"
                  />
                  <Button type="submit" disabled={isSaving} className="px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow-sm h-[38px]">
                    <Plus className="w-4 h-4" />
                  </Button>
                </form>
                <p className="text-[11px] text-zinc-500 font-medium mt-2">Personal events are private to you. Click them on the calendar to delete.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {eventToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={() => setEventToDelete(null)} />
          
          <div className="relative bg-white rounded-xl shadow-xl border border-zinc-200/80 w-full max-w-[320px] overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-6 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <span className="text-xl">🗑️</span>
            </div>
            <h3 className="text-lg font-bold text-zinc-900 mb-2">Delete Event?</h3>
            <p className="text-[14px] text-zinc-500 mb-6">
              Are you sure you want to delete <span className="font-bold text-zinc-700">"{eventToDelete.title}"</span>? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3 w-full">
              <Button type="button" variant="secondary" onClick={() => setEventToDelete(null)} className="flex-1 py-2.5">
                Cancel
              </Button>
              <Button type="button" disabled={isSaving} onClick={confirmDeleteCustomEvent} className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-md shadow-sm py-2.5">
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
