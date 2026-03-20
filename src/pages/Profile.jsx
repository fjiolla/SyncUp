import React, { useState, useEffect } from 'react'
import { Card } from '../components/ui/Card'
import { MapPin, Mail, Briefcase, Globe, Star, Users, Activity, LogOut, ShieldCheck, Clock } from 'lucide-react'
import { StatCard } from '../components/ui/StatCard'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'
import { usePods } from '../context/PodsContext'
import { EditProfileModal } from '../components/ui/EditProfileModal'
import api from '../lib/api'

export default function Profile() {
  const { user, isLoading, logout, requireAuth } = useAuth();
  const { pods } = usePods();
  const [isEditing, setIsEditing] = useState(false);
  const [connectionsCount, setConnectionsCount] = useState(0);

  useEffect(() => {
    const refresh = () => {
      if (user) {
        api.get('/api/messages/connections')
           .then(res => setConnectionsCount(res.data.length))
           .catch(err => console.error(err));
      }
    };
    refresh();
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('connections_updated', refresh);
    return () => {
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('connections_updated', refresh);
    };
  }, [user]);

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

  // Read aggregated stats directly from the synchronized backend session payload
  const createdCount = user.podsCreated || 0;
  const joinedCount = user.podsJoined || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 delay-100 fill-mode-both max-w-5xl mx-auto">
      
      {/* User Header Card */}
      <Card className="p-8 relative overflow-hidden border-zinc-200/80 shadow-sm">
        {/* Accent Top Bar */}
        <div className="absolute top-0 left-0 right-0 h-[4px] bg-zinc-900"></div>
        
        <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center mt-2">
          {user.profilePicture && user.profilePicture.includes('cloudinary') ? (
            <div className="w-20 h-20 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm relative group">
               <img src={user.profilePicture} alt={user.name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-zinc-100 to-zinc-200 border border-zinc-200 flex items-center justify-center flex-shrink-0 shadow-sm">
               <span className="text-3xl font-bold tracking-tight text-zinc-600 uppercase shadow-none">{user.name.charAt(0)}</span>
            </div>
          )}
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-[26px] font-semibold tracking-tight text-zinc-900 flex items-center gap-2">
                {user.name}
                {user.isVerified && <ShieldCheck className="w-5 h-5 text-blue-500" strokeWidth={2.5} />}
              </h1>
              {user.age && (
                <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded text-xs font-semibold border border-zinc-200/80">
                  Age {user.age}
                </span>
              )}
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
      <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
        <StatCard title="Pods Created" value={createdCount} icon={Star} />
        <StatCard title="Pods Joined" value={joinedCount} icon={Activity} />
        <StatCard title="Connections" value={connectionsCount} icon={Users} />
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

          <Card className="p-6 sm:p-8 border-zinc-200/80 shadow-none">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-zinc-900 tracking-tight">Peer Experiences</h3>
              <button className="text-[12px] font-semibold text-blue-600 hover:text-blue-700 transition-colors">Add Review</button>
            </div>
            <div className="flex flex-col items-center justify-center py-6 text-center border border-dashed border-zinc-200/80 rounded-xl bg-zinc-50/50">
              <p className="text-[13px] text-zinc-500 font-medium">No experiences shared yet.</p>
              <p className="text-[12px] text-zinc-400 mt-1 max-w-xs mx-auto">Comments from other users about {user.name} will appear here continuously.</p>
            </div>
          </Card>

          <Card className="p-6 sm:p-8 border-zinc-200/80 shadow-none">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-zinc-900 tracking-tight">Past Events Memory Gallery</h3>
              <button className="text-[12px] font-semibold text-blue-600 hover:text-blue-700 transition-colors">Upload Photo</button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="aspect-square bg-zinc-50 border border-dashed border-zinc-200 rounded-lg flex items-center justify-center">
                 <span className="text-[12px] font-medium text-zinc-400 text-center px-4">Upload an event photo</span>
              </div>
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
                <div className="w-full flex-1">
                  <p className="text-zinc-900 flex justify-between items-center w-full">
                    Email
                    {user.isVerified ? (
                      <span className="text-[10px] items-center gap-1 font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-widest border border-green-200">Verified</span>
                    ) : (
                      <span className="text-[10px] items-center gap-1 font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full uppercase tracking-widest border border-rose-200">Unverified</span>
                    )}
                  </p>
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
