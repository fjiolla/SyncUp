import { Link, useLocation } from 'react-router-dom'
import { Home, Users, Calendar, User, MessageSquare, ShieldCheck } from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '../../context/AuthContext'

const baseNavItems = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'My Pods', path: '/pods', icon: Users },
  { name: 'Calendar', path: '/calendar', icon: Calendar },
  { name: 'Messages', path: '/messages', icon: MessageSquare },
  { name: 'Profile', path: '/profile', icon: User },
]

export default function Sidebar() {
  const location = useLocation()
  const { user } = useAuth()
  const navItems = [
    ...baseNavItems,
    ...(user?.role === 'admin' ? [{ name: 'Admin', path: '/admin', icon: ShieldCheck }] : []),
  ]

  return (
    <div className="w-64 border-r border-zinc-200/80 bg-zinc-50/50 min-h-screen flex flex-col p-4">
      <div className="flex items-center gap-2.5 px-3 py-2 mb-6 mt-2">
        <div className="w-5 h-5 bg-zinc-900 rounded-[4px] shadow-sm flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-[1px]" />
        </div>
        <span className="font-semibold text-[15px] tracking-tight text-zinc-900">SyncUp</span>
      </div>
      
      <nav className="flex-1 space-y-0.5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={clsx(
                "flex items-center gap-3 px-3 py-2 rounded-md text-[13px] transition-all",
                isActive 
                  ? "bg-white text-zinc-900 font-medium shadow-sm border border-zinc-200/60" 
                  : "text-zinc-500 hover:bg-zinc-200/40 hover:text-zinc-900 border border-transparent"
              )}
            >
              <Icon className="w-[15px] h-[15px]" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
