import React, { useState, useEffect, useRef } from 'react'
import { Search, Command, Hash, User, Calendar, MapPin, ArrowRight, Frown } from 'lucide-react'
import { usePods } from '../../context/PodsContext'
import { useNavigate } from 'react-router-dom'

export function OmnibarModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)
  
  const { pods } = usePods();
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    const handleOpen = () => setIsOpen(true)

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('open-omnibar', handleOpen)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('open-omnibar', handleOpen)
    }
  }, [])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    } else {
      setQuery('')
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-32 sm:pt-48 px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-2xl rounded-xl shadow-2xl border border-zinc-200/80 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Input Header */}
        <div className="flex items-center px-4 border-b border-zinc-100">
          <Search className="w-5 h-5 text-zinc-400" />
          <input 
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query.trim()) {
                navigate(`/?search=${encodeURIComponent(query.trim())}`);
                setIsOpen(false);
              }
            }}
            className="flex-1 w-full h-14 px-4 text-[15px] text-zinc-900 bg-transparent focus:outline-none placeholder-zinc-400 font-medium"
            placeholder="Search pods, members, or tags..."
          />
          <kbd className="hidden sm:inline-flex items-center justify-center h-6 px-2 text-[11px] font-semibold text-zinc-400 bg-zinc-50 border border-zinc-200 rounded">
            ESC
          </kbd>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          
          {!query.trim() && (
            <div className="px-3 py-2">
              <h3 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Suggestions</h3>
              <div className="space-y-1">
                <button 
                  onClick={() => { navigate(`/?search=${encodeURIComponent('Smart India Hackathon')}`); setIsOpen(false); }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-md hover:bg-zinc-100/80 text-left group transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-500">
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[14px] font-medium text-zinc-900">Smart India Hackathon</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-500" />
                </button>

                <button 
                  onClick={() => { navigate(`/?search=${encodeURIComponent('Engineering')}`); setIsOpen(false); }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-md hover:bg-zinc-100/80 text-left group transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-500">
                      <Hash className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[14px] font-medium text-zinc-900">Engineering</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-500" />
                </button>
              </div>
            </div>
          )}

          {query.trim() && (
            <div className="px-3 py-2">
              <h3 className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Pod Results</h3>
              <div className="space-y-1">
                {pods.filter(p => !p.isJoined && (p.title.toLowerCase().includes(query.toLowerCase()) || p.tags?.some(t => t.toLowerCase().includes(query.toLowerCase())))).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-zinc-500">
                    <Frown className="w-10 h-10 mb-3 text-zinc-300" />
                    <p className="text-[14px] font-medium">No results found for "{query}"</p>
                    <p className="text-[12px] mt-1">Try adjusting your spelling or tags.</p>
                  </div>
                ) : (
                  pods.filter(p => !p.isJoined && (p.title.toLowerCase().includes(query.toLowerCase()) || p.tags?.some(t => t.toLowerCase().includes(query.toLowerCase())))).map(pod => (
                    <button 
                      key={pod._id}
                      onClick={() => { navigate(`/pods/${pod._id}`); setIsOpen(false); }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-md hover:bg-zinc-100/80 text-left group transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                          {pod.title.substring(0, 2)}
                        </div>
                        <div>
                          <p className="text-[14px] font-semibold text-zinc-900">{pod.title}</p>
                          <p className="text-[11px] font-medium text-zinc-500">{pod.members?.length || 1} members • {pod.location}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-500" />
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
          
        </div>

      </div>
    </div>
  )
}
