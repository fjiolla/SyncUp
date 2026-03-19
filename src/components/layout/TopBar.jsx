import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Bell, Users, Calendar } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { usePods } from '../../context/PodsContext'
import { CreatePodModal } from '../ui/CreatePodModal'

export default function TopBar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { addPod } = usePods()
  const { requireAuth, user, logout } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  
  useEffect(() => {
    const handleOpenModal = () => requireAuth(() => setIsModalOpen(true));
    document.addEventListener('open-create-pod', handleOpenModal);
    return () => document.removeEventListener('open-create-pod', handleOpenModal);
  }, [requireAuth]);
  
  // Basic title mapping based on route path
  const titleMap = {
    '/': 'Dashboard',
    '/pods': 'My Pods',
    '/calendar': 'Calendar',
    '/profile': 'Profile',
  }
  
  const pageTitle = titleMap[location.pathname] || 'SyncUp'

  const handleCreatePod = (podData) => {
    addPod(podData)
    // Optional: redirect to pods after creating if not already there
    if (location.pathname !== '/pods') {
      navigate('/pods')
    }
  }

  return (
    <>
      <header className="h-16 border-b border-zinc-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-8">
        <h2 className="text-[17px] font-semibold tracking-tight text-zinc-900">
          {pageTitle}
        </h2>
        
        <div className="flex items-center gap-6">
          
          <div className="relative">
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative text-zinc-400 hover:text-zinc-900 transition-colors mt-1"
            >
              <Bell className="w-[18px] h-[18px]" />
              {/* Unread dot */}
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white" />
            </button>
            
            {isNotificationsOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsNotificationsOpen(false)} 
                />
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-zinc-200/80 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                    <span className="text-[13px] font-semibold text-zinc-900 tracking-tight">Notifications</span>
                    <button className="text-[11px] text-zinc-500 hover:text-zinc-900 font-medium transition-colors">Mark all read</button>
                  </div>
                  <div className="max-h-[60vh] overflow-y-auto">
                    
                    <div className="px-4 py-3 border-b border-zinc-100 hover:bg-zinc-50 transition-colors cursor-pointer flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <p className="text-[13px] text-zinc-800 leading-snug">
                          <span className="font-semibold text-zinc-900">Alex</span> joined your <span className="font-medium text-zinc-900">Hackathon Team</span> pod.
                        </p>
                        <p className="text-[11px] text-zinc-400 font-medium">2 hours ago</p>
                      </div>
                    </div>

                    <div className="px-4 py-3 border-b border-zinc-100 hover:bg-zinc-50 transition-colors cursor-pointer flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Calendar className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <p className="text-[13px] text-zinc-800 leading-snug">
                          <span className="font-semibold text-zinc-900">Sunset Photography Walk</span> starts in 2 hours.
                        </p>
                        <p className="text-[11px] text-zinc-400 font-medium">4 hours ago</p>
                      </div>
                    </div>

                    <div className="px-4 py-3 hover:bg-zinc-50 transition-colors cursor-pointer flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-zinc-500 text-[10px] font-bold">L</span>
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <p className="text-[13px] text-zinc-800 leading-snug">
                          <span className="font-semibold text-zinc-900">Leena</span> updated the time for <span className="font-medium text-zinc-900">Saturday Badminton</span>.
                        </p>
                        <p className="text-[11px] text-zinc-400 font-medium">Yesterday</p>
                      </div>
                    </div>

                  </div>
                </div>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => requireAuth(() => setIsModalOpen(true))}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded text-[13px] font-medium transition-all hover:scale-[1.02] active:scale-95 shadow-sm"
            >
              Create Pod
            </button>
            
            {user ? (
              <button onClick={() => navigate('/profile')} title="View Profile" className="w-8 h-8 rounded-full border border-zinc-200 overflow-hidden hover:opacity-80 transition-opacity cursor-pointer bg-zinc-100 flex items-center justify-center">
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover bg-white" />
                ) : (
                  <span className="text-[11px] font-semibold text-zinc-600 tracking-wider">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </button>
            ) : (
              <button 
                onClick={() => requireAuth(() => navigate('/profile'))}
                className="bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-900 px-4 py-1.5 rounded-full text-[13px] font-semibold transition-colors shadow-sm cursor-pointer"
              >
                Log In
              </button>
            )}
          </div>
        </div>
      </header>
      
      <CreatePodModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreatePod}
      />
    </>
  )
}
