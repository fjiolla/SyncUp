import React from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Users, MapPin, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { usePods } from '../../context/PodsContext'
import { Button } from './Button'
import { Card } from './Card'

export function SocialPodCard({ 
  id, 
  title, 
  description, 
  category, 
  tags = [], 
  time, 
  location, 
  host, 
  role, 
  isFeatured, 
  joined, 
  spotsLeft, 
  urgency, 
  avatars = [], 
  isJoined 
}) {
  const { requireAuth } = useAuth()
  const { setActiveFilter } = usePods()

  const handleJoin = (e) => {
    e.preventDefault()
    requireAuth(() => {
      console.log('Joined pod', id)
    })
  }
  
  return (
    <Link 
      to={`/pods/${id}`}
      className={`block rounded-xl border group flex flex-col p-6 transition-all duration-200 hover:-translate-y-[2px] shadow-sm hover:shadow-md border-zinc-200/80 hover:border-zinc-300 ${
        isFeatured ? 'md:col-span-2 lg:col-span-2 bg-zinc-50/30' : 'bg-white'
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="space-y-1.5">
          {urgency && (
            <div className={`inline-flex items-center gap-1.5 text-xs font-medium tracking-wide ${
              urgency.toLowerCase().includes('today') || urgency.toLowerCase().includes('soon') || urgency.toLowerCase().includes('hours') 
                ? 'text-emerald-600' 
                : 'text-zinc-500'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${urgency.toLowerCase().includes('today') || urgency.toLowerCase().includes('soon') || urgency.toLowerCase().includes('hours') ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
              {urgency}
            </div>
          )}
          <h3 className={`font-semibold text-zinc-900 tracking-tight leading-tight group-hover:text-black transition-colors ${
            isFeatured ? 'text-2xl pt-1' : 'text-lg'
          }`}>
            {title}
          </h3>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-1.5 mb-4 relative z-10">
        <span 
          onClick={(e) => { e.preventDefault(); setActiveFilter(category); }}
          className="px-2 py-0.5 text-[11px] font-medium text-zinc-600 bg-zinc-100 rounded-sm border border-zinc-200/50 cursor-pointer hover:bg-zinc-200/80 transition-colors"
        >
          {category}
        </span>
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
      
      <div className="mt-auto space-y-2.5 text-[13px] text-zinc-600 mb-6">
        <div className="flex items-center gap-2.5">
          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
          <span className="font-medium text-zinc-800">{time}</span>
        </div>
        
        <div className="flex items-center gap-2.5">
          <MapPin className="w-3.5 h-3.5 text-zinc-400" />
          <span>{location}</span>
        </div>
      </div>
      
      <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
        <div className="flex flex-col">
          <div className="text-[13px] font-medium text-zinc-900">
             {joined} joined
          </div>
          <div className="text-[11px] font-medium text-zinc-500">
            {spotsLeft} spots left
          </div>
        </div>
        
        <div className="flex -space-x-2.5 overflow-hidden">
          {avatars.map((url, idx) => (
            <img 
              key={idx}
              src={url}
              alt="Avatar"
              className="inline-block h-7 w-7 rounded-full ring-2 ring-white object-cover grayscale-[20%]"
            />
          ))}
          {joined > avatars.length && (
            <div className="inline-flex h-7 w-7 items-center justify-center rounded-full ring-2 ring-white bg-zinc-100 text-[10px] font-medium text-zinc-600 relative z-10">
              +{joined - avatars.length}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
