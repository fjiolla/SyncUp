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
              {/* No unread dots since system is not hooked to backend yet */}
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
                    
                    <div className="px-4 py-8 text-center flex flex-col items-center justify-center">
                      <div className="w-10 h-10 bg-zinc-50 rounded-full flex items-center justify-center mb-3">
                        <Bell className="w-5 h-5 text-zinc-300" />
                      </div>
                      <p className="text-[13px] font-medium text-zinc-500">No new notifications</p>
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
                {user.profilePicture && user.profilePicture.includes('cloudinary') ? (
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
