import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Clock, MapPin, Users, CheckCircle2, User, Share, MoreHorizontal, X, Send, MessageCircle, Twitter, Linkedin, Facebook, Link as LinkIcon, Trash2, LogOut, Flag } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { usePods } from '../context/PodsContext'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import api from '../lib/api'

const toDatetimeLocal = (d) => {
  if (!d) return '';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export default function PodDetails() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { pods, loading, joinPod, leavePod, updatePodDetails, deletePod, currentUser } = usePods()
  const { requireAuth, isLoggedIn } = useAuth()
  
  const pod = pods.find(p => p.id === id)
  
  const [isEditing, setIsEditing] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [reportReason, setReportReason] = useState('Inappropriate content')
  const [reportDetails, setReportDetails] = useState('')
  const [reportSubmitting, setReportSubmitting] = useState(false)
  const [showAllMembers, setShowAllMembers] = useState(false)
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    dateTime: '',
    location: '',
  })

  // Initialize form when pod loads/changes
  useEffect(() => {
    if (pod && !isEditing) {
      setEditForm({
        title: pod.title || '',
        description: pod.description || '',
        dateTime: toDatetimeLocal(pod.dateTime || pod.date),
        location: pod.location || '',
      })
    }
  }, [pod, isEditing])

  if (loading) {
    return (
      <div className="py-20 text-center text-zinc-500 text-[13px] font-medium">
        Loading pod...
      </div>
    )
  }

  if (!pod) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-xl font-medium text-gray-900">Pod not found</h2>
        <Button variant="secondary" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    )
  }

  // If the user isn't logged in, they aren't the organizer or a member
  const role = isLoggedIn ? pod.role : 'none'

  const handleSave = async () => {
    try {
      await updatePodDetails(pod.id, editForm)
      setIsEditing(false)
    } catch {
      // Error already toasted by updatePodDetails
    }
  }

  const handleCancel = () => {
    setEditForm({
      title: pod.title,
      description: pod.description,
      dateTime: toDatetimeLocal(pod.dateTime || pod.date),
      location: pod.location,
    })
    setIsEditing(false)
  }

  const handleDelete = () => {
    deletePod(pod.id)
    navigate('/pods')
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
    setIsShareOpen(false);
  };

  const handleSendDMRequest = async (recipientId) => {
    if (recipientId === currentUser?._id) return;
    try {
      await api.post('/api/messages/requests/send', { recipientId });
      toast.success('Message request sent!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send request');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 fill-mode-both pb-12">
      
      {/* Top Navigation Bar */}
      <div className="flex items-center gap-4 py-2">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex flex-wrap gap-2">
           <span className="px-2 py-0.5 text-[11px] font-medium text-zinc-600 bg-zinc-100 rounded-sm border border-zinc-200/50">
             {pod.category}
           </span>
           {role === 'organizer' && (
             <span className="px-2 py-0.5 text-[11px] font-medium text-white bg-zinc-900 rounded-sm">
               Organizer
             </span>
           )}
        </div>
        <div className="ml-auto flex items-center gap-2 relative">
          <button 
            onClick={() => { setIsShareOpen(!isShareOpen); setShowMenu(false); }} 
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Share className="w-4 h-4" />
          </button>
          
          {isShareOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsShareOpen(false)} />
              <div className="absolute right-8 top-12 w-52 bg-white border border-zinc-200 rounded-xl shadow-lg z-20 py-2 flex flex-col animate-in fade-in zoom-in-95 duration-200">
                <div className="px-4 pt-1.5 pb-2">
                  <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Share Pod</span>
                </div>
                <div className="h-px bg-zinc-100 flex-shrink-0 mb-1" />
                <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out ${pod.title} on SyncUp! ${window.location.href}`)}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2.5 flex items-center gap-3 text-[14px] font-medium text-zinc-700 hover:bg-zinc-50 transition-colors" onClick={() => setIsShareOpen(false)}>
                  <MessageCircle className="w-4 h-4 text-green-600" /> WhatsApp
                </a>
                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${pod.title} on SyncUp!`)}&url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2.5 flex items-center gap-3 text-[14px] font-medium text-zinc-700 hover:bg-zinc-50 transition-colors" onClick={() => setIsShareOpen(false)}>
                  <Twitter className="w-4 h-4 text-black" /> X (Twitter)
                </a>
                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2.5 flex items-center gap-3 text-[14px] font-medium text-zinc-700 hover:bg-zinc-50 transition-colors" onClick={() => setIsShareOpen(false)}>
                  <Linkedin className="w-4 h-4 text-blue-700" /> LinkedIn
                </a>
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2.5 flex items-center gap-3 text-[14px] font-medium text-zinc-700 hover:bg-zinc-50 transition-colors" onClick={() => setIsShareOpen(false)}>
                  <Facebook className="w-4 h-4 text-blue-600" /> Facebook
                </a>
                <div className="h-px bg-zinc-100 my-1 flex-shrink-0" />
                <button onClick={handleCopyLink} className="px-4 py-2.5 flex items-center gap-3 text-[14px] text-left font-medium text-zinc-700 hover:bg-zinc-50 transition-colors">
                  <LinkIcon className="w-4 h-4 text-zinc-500" /> Copy Link
                </button>
              </div>
            </>
          )}

          <button 
            onClick={() => { setShowMenu(!showMenu); setIsShareOpen(false); }}
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-12 w-48 bg-white border border-zinc-200 rounded-xl shadow-lg z-20 py-2 flex flex-col animate-in fade-in zoom-in-95 duration-200">
                {role === 'organizer' ? (
                  <>
                    <button onClick={() => { handleDelete(); setShowMenu(false); }} className="px-4 py-2.5 text-left text-[14px] font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2">
                       <Trash2 className="w-4 h-4" /> Delete Pod
                    </button>
                    <div className="h-px bg-zinc-100 my-1 flex-shrink-0" />
                  </>
                ) : (
                  <>
                    {role === 'member' && (
                      <button onClick={() => { leavePod(pod.id); setShowMenu(false); }} className="px-4 py-2.5 text-left text-[14px] font-medium text-orange-600 hover:bg-orange-50 transition-colors flex items-center gap-2">
                         <LogOut className="w-4 h-4" /> Leave Pod
                      </button>
                    )}
                  </>
                )}
                <button 
                  onClick={() => { setIsReportOpen(true); setShowMenu(false); }} 
                  className="px-4 py-2.5 text-left text-[14px] font-medium text-zinc-600 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center gap-2"
                >
                   <Flag className="w-4 h-4" /> Report Issue
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="space-y-4">
            {isEditing ? (
              <input 
                value={editForm.title}
                onChange={e => setEditForm({...editForm, title: e.target.value})}
                className="w-full text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900 leading-tight px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
              />
            ) : (
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-gray-900 leading-tight">
                {pod.title}
              </h1>
            )}
            
            <div className="flex flex-wrap gap-2 pt-2">
              {(pod.tags || []).map(tag => (
                <span key={tag} className="px-3 py-1 text-sm font-medium text-blue-700 bg-blue-50/60 rounded border border-blue-100/50">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-5 border-y border-zinc-100">
            <div className="flex items-start gap-3">
               <Clock className="w-4 h-4 text-zinc-400 mt-0.5" />
               <div className="flex-1 pr-4">
                 {isEditing ? (
                   <div className="space-y-1">
                     <p className="font-medium text-zinc-900 text-sm mb-0.5">Date & Time</p>
                     <input 
                       type="datetime-local"
                       value={editForm.dateTime}
                       onChange={e => setEditForm({...editForm, dateTime: e.target.value})}
                       className="w-full font-medium text-zinc-900 px-3 py-1.5 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                     />
                   </div>
                 ) : (
                   <>
                     <p className="font-medium text-zinc-900 text-[15px] max-w-[150px]">{pod.time || new Date(pod.date).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                   </>
                 )}
               </div>
            </div>
            <div className="flex items-start gap-3">
               <MapPin className="w-4 h-4 text-zinc-400 mt-0.5" />
               <div className="flex-1 pr-4">
                 {isEditing ? (
                   <div className="space-y-1">
                     <p className="font-medium text-zinc-900 text-sm mb-0.5 mt-0.5">Location</p>
                     <input 
                       value={editForm.location}
                       onChange={e => setEditForm({...editForm, location: e.target.value})}
                       className="w-full text-zinc-900 px-3 py-1.5 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                     />
                   </div>
                 ) : (
                   <a 
                     href={pod.mapLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pod.location)}`}
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="block text-[15px] text-zinc-800 leading-snug hover:text-blue-600 transition-colors"
                   >
                     <span className="cursor-pointer border-b border-transparent hover:border-blue-300 pb-0.5">{pod.location}</span>
                     <span className="text-[11px] text-blue-500 block mt-1 underline decoration-blue-200 underline-offset-2">Open map directions ↗</span>
                   </a>
                 )}
               </div>
            </div>
            <div className="flex items-start gap-3">
               <Users className="w-4 h-4 text-zinc-400 mt-0.5" />
               <div className="flex-1 pr-4">
                  <p className="font-medium text-zinc-900 text-[15px]">Requirements</p>
                  <p className="text-[13px] text-zinc-500 font-medium mt-0.5">
                    {pod.minAge || pod.maxAge ? `Age ${pod.minAge || 18}+ ${pod.maxAge ? `(Max ${pod.maxAge})` : ''}` : 'Any Age'}
                  </p>
               </div>
            </div>
          </div>

          {/* About Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-medium text-gray-900 tracking-tight">About this pod</h2>
            {isEditing ? (
              <textarea 
                rows={5}
                value={editForm.description}
                onChange={e => setEditForm({...editForm, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 text-[15px] resize-none"
              />
            ) : (
              <p className="text-gray-600 leading-relaxed text-[15px]">
                {pod.description}
              </p>
            )}
          </div>

          {/* Organizer Section */}
          {!isEditing && (
            <div className="pt-6 border-t border-zinc-100 flex items-center gap-4">
               <Link to={`/profile/${pod.hostId}`} className="w-12 h-12 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center overflow-hidden flex-shrink-0 hover:ring-2 hover:ring-blue-100 transition-all">
                  <span className="text-sm font-medium text-zinc-600">
                    {pod.host.charAt(0)}
                  </span>
               </Link>
               <div>
                 <p className="text-[11px] text-zinc-500 font-medium tracking-wide uppercase mb-0.5">Organized by</p>
                 <Link to={`/profile/${pod.hostId}`} className="text-[15px] font-medium text-zinc-900 hover:text-blue-600 transition-colors">{pod.host}</Link>
               </div>
               {role !== 'organizer' && (
                 <div className="ml-auto">
                   <Link 
                     to={`/profile/${pod.hostId}`}
                     className="text-sm bg-white border border-zinc-200 font-medium text-zinc-700 hover:bg-zinc-50 rounded-md px-4 py-2 transition-colors inline-block text-center"
                   >
                     View Profile
                   </Link>
                 </div>
               )}
            </div>
          )}

        </div>

        {/* Action Sidebar Column */}
        <div className="space-y-6">
          
          {/* Main Action Card */}
          <div className="bg-white rounded-xl shadow-sm border border-zinc-200/80 p-6 space-y-6 sticky top-24">
            
            <div className="pb-5 border-b border-zinc-100">
               <div className="flex items-center justify-between mb-1">
                 <span className="text-2xl font-semibold text-zinc-900 tracking-tight">
                   {pod.membersCount} <span className="text-lg font-normal text-zinc-400">/ {pod.maxMembers}</span>
                 </span>
                 <span className="text-[11px] font-semibold tracking-wider uppercase text-zinc-500">
                   {pod.spotsLeft} spots left
                 </span>
               </div>
               <p className="text-[13px] font-medium text-zinc-500">Members joined</p>
            </div>

            {/* Dynamic Actions */}
            <div className="space-y-3">
               {isEditing ? (
                 <>
                   <Button variant="primary" className="w-full py-2.5 text-base" onClick={handleSave}>
                     Save Changes
                   </Button>
                   <Button variant="secondary" className="w-full text-base bg-white" onClick={handleCancel}>
                     Cancel
                   </Button>
                   <button onClick={handleDelete} className="w-full text-sm font-medium text-red-500 hover:text-red-600 py-3 transition-colors mt-2">
                     Delete Pod
                   </button>
                 </>
               ) : (
                 <>
                   {role === 'none' && (
                     <Button 
                       variant="primary" 
                       className={`w-full py-2.5 text-base ${pod.membersCount >= pod.maxMembers ? 'opacity-50 cursor-not-allowed' : ''}`}
                       onClick={() => pod.membersCount < pod.maxMembers && requireAuth(() => joinPod(pod.id))}
                       disabled={pod.membersCount >= pod.maxMembers}
                     >
                       {pod.membersCount >= pod.maxMembers ? 'Pod Full' : 'Join Pod'}
                     </Button>
                   )}
                   
                   {role === 'member' && (
                     <>
                       <div className="flex items-center gap-2 mb-4 text-[13px] font-medium text-emerald-600">
                          <CheckCircle2 className="w-4 h-4" /> You are going
                       </div>
                       
                       <Button 
                         variant="primary" 
                         className="w-full text-base mb-3 shadow-sm bg-blue-600 hover:bg-blue-700 text-white"
                         onClick={() => navigate('/messages')}
                       >
                         Open Group Chat
                       </Button>

                       <Button 
                         variant="secondary" 
                         className="w-full text-[15px] bg-white shadow-none border border-zinc-200 hover:bg-zinc-50 hover:text-red-600 transition-colors"
                         onClick={() => leavePod(pod.id)}
                       >
                         Leave Pod
                       </Button>
                     </>
                   )}

                   {role === 'organizer' && (
                     <>
                       <Button 
                         variant="primary" 
                         className="w-full py-2.5 text-base"
                         onClick={() => setIsEditing(true)}
                       >
                         Edit Pod
                       </Button>
                       <Button 
                         variant="secondary" 
                         className="w-full py-2.5 mt-3 text-base font-semibold border-zinc-200 text-zinc-900 bg-white shadow-sm hover:bg-zinc-50 transition-colors"
                         onClick={() => navigate('/messages')}
                       >
                         Open Group Chat
                       </Button>
                     </>
                   )}
                 </>
               )}
            </div>

            {!isEditing && (
              <p className="text-xs text-center font-medium text-gray-400">
                 {pod.lastUpdated}
              </p>
            )}
          </div>

          {/* Members Preview */}
          {!isEditing && (
            <div className="bg-white rounded-xl shadow-sm border border-zinc-200/80 p-6 space-y-4">
               <div className="flex items-center justify-between">
                  <h3 className="font-semibold tracking-tight text-zinc-900">Participants</h3>
                  {pod.membersList?.length > 5 && (
                    <button 
                      onClick={() => setShowAllMembers(!showAllMembers)}
                      className="text-[13px] text-zinc-500 font-semibold hover:text-zinc-900 transition-colors"
                    >
                      {showAllMembers ? 'Show Less' : 'See all'}
                    </button>
                  )}
               </div>
               
               {showAllMembers ? (
                  <div className="space-y-3 pt-2">
                    {pod.membersList?.map((m) => (
                      <div key={m.id} className="flex items-center justify-between border-b border-zinc-100 pb-2 last:border-0 last:pb-0">
                         <Link to={`/profile/${m.id}`} className="flex items-center gap-3 group cursor-pointer">
                           {m.profilePicture && m.profilePicture.includes('cloudinary') ? (
                              <img src={m.profilePicture} className="w-8 h-8 rounded-full object-cover shadow-sm bg-white group-hover:ring-2 group-hover:ring-blue-100 transition-all" alt="avatar" />
                           ) : (
                              <div className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center text-xs font-bold uppercase shadow-sm group-hover:ring-2 group-hover:ring-blue-100 transition-all">{m.name.charAt(0)}</div>
                           )}
                           <span className="text-[14px] font-semibold text-zinc-900 group-hover:text-blue-600 transition-colors">{m.name}</span>
                         </Link>
                        {currentUser && m.id !== currentUser._id && (
                           <Link 
                             to={`/profile/${m.id}`}
                             className="text-[12px] font-medium text-zinc-700 hover:text-blue-700 border border-zinc-200 bg-white hover:bg-zinc-50 px-3 py-1.5 rounded-md transition-colors"
                           >
                             View Profile
                           </Link>
                         )}
                      </div>
                    ))}
                  </div>
               ) : (
                 <div className="flex -space-x-3 overflow-hidden pt-2">
                    {pod.membersList?.slice(0, 5).map((m, idx) => {
                      if (m.profilePicture && m.profilePicture.includes('cloudinary')) {
                        return (
                          <Link key={m.id} to={`/profile/${m.id}`} className="inline-block relative z-10 hover:z-20 transition-all">
                            <img src={m.profilePicture} alt="Participant" className="h-10 w-10 rounded-full ring-2 ring-white object-cover bg-zinc-100 shadow-sm" />
                          </Link>
                        );
                      }
                      return (
                        <Link key={m.id} to={`/profile/${m.id}`} className="inline-flex h-10 w-10 items-center justify-center rounded-full ring-2 ring-white bg-gradient-to-br from-zinc-100 to-zinc-200 border border-zinc-200 text-xs font-bold text-zinc-600 uppercase relative z-10 hover:z-20 transition-all">
                          {m.name.charAt(0)}
                        </Link>
                      );
                    })}
                    {pod.membersCount > (pod.membersList?.length || 0) && (
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-full ring-2 ring-white bg-zinc-50 border border-zinc-200 text-[11px] font-bold text-zinc-500 relative z-10 shadow-sm cursor-pointer" onClick={() => setShowAllMembers(true)}>
                        +{pod.membersCount - Math.min((pod.membersList?.length || 0), 5)}
                      </div>
                    )}
                 </div>
               )}
            </div>
          )}

        </div>

      </div>
      
      {/* Report Modal */}
      {isReportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={() => !reportSubmitting && setIsReportOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-zinc-900 tracking-tight">Report Issue</h3>
                <p className="text-[14px] text-zinc-500 font-medium mt-1">What's wrong with this pod?</p>
              </div>
              <button onClick={() => !reportSubmitting && setIsReportOpen(false)} className="p-2 -mr-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!pod?.id || reportSubmitting) return;
              setReportSubmitting(true);
              try {
                await api.post('/api/reports', {
                  targetType: 'pod',
                  targetId: pod.id,
                  reason: reportReason,
                  details: reportDetails,
                });
                setIsReportOpen(false);
                setReportDetails('');
                setReportReason('Inappropriate content');
                toast.success('Report submitted to Trust & Safety team.');
              } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to submit report');
              } finally {
                setReportSubmitting(false);
              }
            }} className="space-y-5">
               <div>
                  <label className="block text-[13px] font-semibold text-zinc-700 mb-2">Reason</label>
                  <select
                    value={reportReason}
                    onChange={e => setReportReason(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2.5 text-[14px] text-zinc-900 focus:outline-none focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 transition-shadow"
                  >
                     <option>Inappropriate content</option>
                     <option>Spam or misleading</option>
                     <option>Harassment or hate speech</option>
                     <option>Suspicious activity</option>
                     <option>Other</option>
                  </select>
               </div>
               <div>
                  <label className="block text-[13px] font-semibold text-zinc-700 mb-2">Additional Details</label>
                  <textarea
                    value={reportDetails}
                    onChange={e => setReportDetails(e.target.value)}
                    rows={4}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-3 text-[14px] text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-300 focus:ring-1 focus:ring-zinc-300 transition-shadow resize-none"
                    placeholder="Provide more context..."
                  />
               </div>
            
            <div className="mt-8 flex gap-3">
               <button type="button" onClick={() => setIsReportOpen(false)} disabled={reportSubmitting} className="flex-1 px-4 py-2.5 bg-white border border-zinc-200 text-zinc-700 text-[14px] font-medium rounded-lg hover:bg-zinc-50 transition-colors disabled:opacity-50">
                 Cancel
               </button>
               <button type="submit" disabled={reportSubmitting} className="flex-1 px-4 py-2.5 bg-red-600 border border-red-600 text-white text-[14px] font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm focus:ring-2 focus:ring-red-600 focus:ring-offset-2 disabled:opacity-50">
                 {reportSubmitting ? 'Submitting...' : 'Submit Report'}
               </button>
            </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Chat Navigation Link (Slide-over replaced with Dedicated Dashboard) */}
      
    </div>
  )
}
