import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Globe, Star, Activity, ShieldCheck, MessageSquare } from 'lucide-react';
import { StatCard } from '../components/ui/StatCard';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function PublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, requireAuth } = useAuth();
  
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState(null); // 'none', 'pending', 'accepted'
  
  // If the user tries to view their own profile, redirect natively backwards
  useEffect(() => {
    if (currentUser && currentUser._id === id) {
      navigate('/profile');
    }
  }, [currentUser, id, navigate]);

  useEffect(() => {
    fetchProfile();
    if (currentUser) {
      checkConnectionStatus();
    }
  }, [id, currentUser]);

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/api/users/${id}`);
      setProfileUser(res.data);
    } catch (err) {
      toast.error('User not found');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const checkConnectionStatus = async () => {
    try {
      const [reqRes, connRes] = await Promise.all([
        api.get('/api/messages/requests'),
        api.get('/api/messages/connections')
      ]);
      
      const isConnected = connRes.data.some(c => c._id === id);
      if (isConnected) {
        setConnectionStatus('accepted');
        return;
      }
      // If we made it here it's either unrequested or pending sent
      setConnectionStatus('none');
    } catch (err) {
      console.error(err);
    }
  };

  const handleConnect = async () => {
    try {
      await api.post('/api/messages/requests/send', { recipientId: id });
      setConnectionStatus('pending');
      toast.success('Connection request sent!');
    } catch (err) {
      if (err.response?.data?.message?.includes('pending')) {
        setConnectionStatus('pending');
        toast('Request already pending', { icon: '⏳' });
      } else if (err.response?.data?.message?.includes('accepted')) {
        setConnectionStatus('accepted');
        toast('You are already connected!', { icon: '🤝' });
      } else {
        toast.error('Failed to send request');
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20 text-zinc-500 text-[13px] font-medium">Loading profile...</div>;
  }

  if (!profileUser) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 delay-100 fill-mode-both max-w-5xl mx-auto pb-12">
      
      {/* User Header Card */}
      <Card className="p-8 relative overflow-hidden border-zinc-200/80 shadow-sm mt-4">
        <div className="absolute top-0 left-0 right-0 h-[4px] bg-zinc-900"></div>
        
        <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center mt-2">
          {profileUser.profilePicture && profileUser.profilePicture.includes('cloudinary') ? (
            <div className="w-20 h-20 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm relative group">
               <img src={profileUser.profilePicture} alt={profileUser.name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-zinc-100 to-zinc-200 border border-zinc-200 flex items-center justify-center flex-shrink-0 shadow-sm">
               <span className="text-3xl font-bold tracking-tight text-zinc-600 uppercase shadow-none">{profileUser.name.charAt(0)}</span>
            </div>
          )}
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-[26px] font-semibold tracking-tight text-zinc-900 flex items-center gap-2">
                {profileUser.name}
                {profileUser.isVerified && <ShieldCheck className="w-5 h-5 text-blue-500" strokeWidth={2.5} />}
              </h1>
              {profileUser.age && (
                <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded text-xs font-semibold border border-zinc-200/80">
                  Age {profileUser.age}
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-[13px] font-medium text-zinc-600">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-zinc-400" /> Joined {new Date(profileUser.createdAt || Date.now()).getFullYear()}
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            {connectionStatus === 'accepted' ? (
               <button 
                 onClick={() => navigate('/messages')}
                 className="px-5 py-2.5 bg-white border border-zinc-200 text-zinc-700 font-medium text-[13px] rounded-md hover:bg-zinc-50 transition-all cursor-pointer flex items-center gap-2 shadow-sm"
               >
                 <MessageSquare className="w-4 h-4" /> Message
               </button>
            ) : connectionStatus === 'pending' ? (
               <button 
                 disabled
                 className="px-5 py-2.5 bg-zinc-100 border border-zinc-200 text-zinc-500 font-medium text-[13px] rounded-md cursor-not-allowed flex items-center gap-2"
               >
                 Request Sent
               </button>
            ) : (
               <button 
                 onClick={() => requireAuth(handleConnect)}
                 className="px-5 py-2.5 bg-blue-600 border border-blue-600 text-white font-medium text-[13px] rounded-md shadow-sm hover:bg-blue-700 transition-all cursor-pointer flex items-center gap-2"
               >
                 <MessageSquare className="w-4 h-4" /> Connect
               </button>
            )}
          </div>
        </div>
      </Card>
      
      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-5">
        <StatCard title="Pods Created" value={profileUser.podsCreated || 0} icon={Star} />
        <StatCard title="Pods Joined" value={profileUser.podsJoined || 0} icon={Activity} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-6 sm:p-8 border-zinc-200/80 shadow-none">
            <h3 className="text-base font-semibold text-zinc-900 mb-4 tracking-tight">About</h3>
            <div className="prose prose-zinc max-w-none text-[15px] font-medium leading-relaxed space-y-4">
              {profileUser.bio ? (
                <p className="text-zinc-600">{profileUser.bio}</p>
              ) : (
                <div className="text-zinc-400 italic">This user hasn't added a bio yet.</div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column - Side Info */}
        <div className="space-y-8">
          <Card className="p-6 border-zinc-200/80 shadow-none">
            <h3 className="text-base font-semibold text-zinc-900 mb-4 tracking-tight">Interests</h3>
            {profileUser.interests && profileUser.interests.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {profileUser.interests.map((skill) => (
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
    </div>
  )
}
