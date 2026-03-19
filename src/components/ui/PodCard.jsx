import React from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Users, MapPin, Settings } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { usePods } from '../../context/PodsContext'

export function PodCard({ 
  id = '1',
  title, 
  category, 
  tags = [], 
  time, 
  location, 
  membersCount, 
  maxMembers, 
  status, 
  role,
  isJoined,
  avatars = [],
}) {
  const { requireAuth } = useAuth()
  const { setActiveFilter, leavePod } = usePods()
  
  const getStatusBadge = () => {
    switch (status) {
      case 'active':
      case 'confirmed':
        return (
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-700">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Confirmed
          </div>
        )
      case 'created':
      case 'planning':
        return (
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Planning
          </div>
        )
      case 'past':
        return (
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
            Past
          </div>
        )
      default:
        return null;
    }
  }

  const handleActionClick = (e) => {
    e.preventDefault();
    requireAuth(() => {
      if (isJoined) {
        leavePod(id);
      } else {
        // Handle join logic here if needed, or navigate to pod details
        // For now, let's assume clicking the card itself handles navigation
      }
    });
  };

  return (
    <Link 
      to={`/pods/${id}`}
      className={`bg-white rounded-xl border group flex flex-col p-5 transition-all duration-200 hover:-translate-y-[2px] cursor-pointer shadow-none hover:shadow-sm border-zinc-200/80 hover:border-zinc-300`}
    >
      
      {/* Header section */}
      <div className="flex justify-between items-start mb-1.5">
        <h3 className="font-semibold text-zinc-900 tracking-tight leading-tight group-hover:text-black transition-colors pr-2">
          {title}
        </h3>
        {getStatusBadge()}
      </div>
      
      {/* Role and Host */}
      <div className="flex items-center gap-2 mb-5">
        {role && (
          <span className={`text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded-sm ${
            role === 'organizer' 
              ? 'bg-zinc-900 text-white' 
              : 'bg-zinc-100 text-zinc-600 border border-zinc-200/50'
          }`}>
            {role === 'organizer' ? 'Organizer' : 'Member'}
          </span>
        )}
      </div>
      
      {/* Details list */}
      <div className="space-y-2 mb-5">
        <div className="flex items-center gap-2.5 text-[13px] text-zinc-600">
          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
          <span className="font-medium text-zinc-800">{time}</span>
        </div>
        <div className="flex items-center gap-2.5 text-[13px] text-zinc-500">
          <MapPin className="w-3.5 h-3.5 text-zinc-400" />
          <span className="truncate">{location}</span>
        </div>
      </div>
      
      {/* Category and Tags */}
      <div className="flex flex-wrap gap-1.5 mb-3 relative z-10">
        {category && (
          <span 
            onClick={(e) => { e.preventDefault(); setActiveFilter(category); }}
            className="px-2 py-0.5 text-[11px] font-medium text-zinc-600 bg-zinc-100 rounded-sm border border-zinc-200/50 cursor-pointer hover:bg-zinc-200/80 transition-colors"
          >
            {category}
          </span>
        )}
        {tags?.map(tag => (
          <span 
            key={tag} 
            onClick={(e) => { e.preventDefault(); setActiveFilter(tag); }}
            className="px-2 py-0.5 text-[11px] font-medium text-zinc-600 bg-zinc-100 rounded-sm border border-zinc-200/50 cursor-pointer hover:bg-zinc-200/80 transition-colors"
          >
            {tag}
          </span>
        ))}
      </div>
      
      <div className="mt-auto pt-4 border-t border-zinc-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2 overflow-hidden">
            {avatars.filter(Boolean).map((url, idx) => (
              <img 
                key={idx}
                src={url}
                alt="Avatar"
                className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover grayscale-[20%]"
              />
            ))}
            {membersCount > avatars.filter(Boolean).length && (
              <div className="inline-flex h-6 w-6 items-center justify-center rounded-full ring-2 ring-white bg-zinc-100 text-[9px] font-bold text-zinc-600 relative z-10 shadow-sm">
                +{membersCount - avatars.filter(Boolean).length}
              </div>
            )}
          </div>
          <div className="text-[11px] text-zinc-500 font-medium tracking-tight ml-1">
             <span className="text-zinc-900">{membersCount}</span> going
          </div>
        </div>
      </div>
    </Link>
  )
}
