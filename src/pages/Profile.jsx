import React, { useState } from 'react'
import { Card } from '../components/ui/Card'
import { MapPin, Mail, Briefcase, Globe, Star, Users, Activity, LogOut, ShieldCheck } from 'lucide-react'
import { StatCard } from '../components/ui/StatCard'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'
import { usePods } from '../context/PodsContext'
import { EditProfileModal } from '../components/ui/EditProfileModal'

export default function Profile() {
  const { user, isLoading, logout, requireAuth } = useAuth();
  const { pods } = usePods();
  const [isEditing, setIsEditing] = useState(false);

  if (isLoading) {
    return <div className="flex justify-center py-20 text-zinc-500 text-[13px] font-medium">Loading profile...</div>;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center space-y-4 animate-in fade-in duration-500">
        <h2 className="text-xl font-semibold text-zinc-900 tracking-tight">Sign in to view your profile</h2>
        <p className="text-[13px] text-zinc-500 max-w-sm font-medium">Create an account or log in to manage your pods, update your details, and connect with others.</p>
        <div className="pt-2">
          <button 
            onClick={() => requireAuth(() => {})} 
            className="px-5 py-2.5 bg-zinc-900 text-white text-[13px] font-medium rounded-md hover:bg-black transition-colors shadow-sm cursor-pointer"
          >
            Log In or Sign Up
          </button>
        </div>
      </div>
    );
  }

  // Calculate some real stats from the pods context
  const createdCount = pods.filter(p => p.role === 'organizer').length;
  const joinedCount = pods.filter(p => p.role === 'member').length;
  const trustScore = 50 + (20 * joinedCount) + (30 * createdCount);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 delay-100 fill-mode-both max-w-5xl mx-auto">
      
      {/* User Header Card */}
      <Card className="p-8 relative overflow-hidden border-zinc-200/80 shadow-sm">
        {/* Accent Top Bar */}
        <div className="absolute top-0 left-0 right-0 h-[4px] bg-zinc-900"></div>
        
        <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center mt-2">
          {user.profilePicture ? (
            <div className="w-20 h-20 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center overflow-hidden flex-shrink-0">
               <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center flex-shrink-0">
               <span className="text-2xl font-semibold tracking-widest text-zinc-500 uppercase">{user.name.charAt(0)}</span>
            </div>
          )}
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-[26px] font-semibold tracking-tight text-zinc-900">{user.name}</h1>
              {user.age && (
                <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded text-xs font-semibold border border-zinc-200/80">
                  Age {user.age}
                </span>
              )}
              <div className="px-2.5 py-0.5 bg-blue-50 text-blue-600 rounded-md text-xs font-bold border border-blue-100/50 flex flex-col items-start justify-center" title="Trust Score">
                <span className="flex items-center gap-1 tracking-wide font-extrabold uppercase text-[9px] text-blue-500/80 mb-[1px]">
                  <ShieldCheck className="w-2.5 h-2.5" /> Trust Index
                </span>
                <span className="leading-none text-sm">{trustScore}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-[13px] font-medium text-zinc-600">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-zinc-400" /> Member since {new Date(user.createdAt || Date.now()).getFullYear()}
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setIsEditing(true)}
              className="px-5 py-2.5 bg-white border border-zinc-200 text-zinc-700 font-medium text-[13px] rounded-md shadow-none hover:bg-zinc-50 transition-all cursor-pointer"
            >
              Edit Profile
            </button>
            <button onClick={logout} className="px-4 py-2.5 bg-red-50 text-red-600 font-medium text-[13px] rounded-md hover:bg-red-100 transition-all border border-red-100 flex items-center gap-2 cursor-pointer shadow-sm hover:shadow-md">
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </Card>
      
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <StatCard title="Pods Created" value={createdCount} icon={Star} />
        <StatCard title="Pods Joined" value={joinedCount} icon={Activity} />
        <StatCard title="Connections" value="-" icon={Users} />
        <StatCard title="Total Following" value="-" icon={Users} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-6 sm:p-8 border-zinc-200/80 shadow-none">
            <h3 className="text-base font-semibold text-zinc-900 mb-4 tracking-tight">About</h3>
            <div className="prose prose-zinc max-w-none text-[15px] font-medium leading-relaxed space-y-4">
              {user.bio ? (
                <p className="text-zinc-600">{user.bio}</p>
              ) : (
                <div className="text-zinc-400 italic">This user hasn't added a bio yet. When they do, it will show up here.</div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column - Side Info */}
        <div className="space-y-8">
          <Card className="p-6 border-zinc-200/80 shadow-none">
            <h3 className="text-base font-semibold text-zinc-900 mb-4 tracking-tight">Contact Info</h3>
            <div className="space-y-4 text-[13px] font-medium">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-zinc-400" />
                <div>
                  <p className="text-zinc-900">Email</p>
                  <a href={`mailto:${user.email}`} className="text-zinc-500 hover:text-zinc-900 hover:underline">{user.email}</a>
                </div>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 border-zinc-200/80 shadow-none">
            <h3 className="text-base font-semibold text-zinc-900 mb-4 tracking-tight">Interests</h3>
            {user.interests && user.interests.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {user.interests.map((skill) => (
                  <span key={skill} className="px-2 py-0.5 text-[11px] font-medium text-zinc-600 bg-zinc-100/50 border border-zinc-200/50 rounded-sm">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-[13px] text-zinc-400 font-medium italic">No interests added</span>
            )}
          </Card>
        </div>
      </div>
      
      <EditProfileModal isOpen={isEditing} onClose={() => setIsEditing(false)} />
    </div>
  )
}
