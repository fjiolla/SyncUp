import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, MapPin, Users, CheckCircle2, User, Share, MoreHorizontal, X, Send } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { usePods } from '../context/PodsContext'
import { useAuth } from '../context/AuthContext'

export default function PodDetails() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { pods, joinPod, leavePod, updatePodDetails, deletePod, currentUser } = usePods()
  const { requireAuth, isLoggedIn } = useAuth()
  
  const pod = pods.find(p => p.id === id)
  
  const [isEditing, setIsEditing] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    time: '',
    location: '',
  })

  // Initialize form when pod loads/changes
  useEffect(() => {
    if (pod && !isEditing) {
      setEditForm({
        title: pod.title || '',
        description: pod.description || '',
        time: pod.time || '',
        location: pod.location || '',
      })
    }
  }, [pod, isEditing])

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

  const handleSave = () => {
    updatePodDetails(pod.id, editForm)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditForm({
      title: pod.title,
      description: pod.description,
      time: pod.time,
      location: pod.location,
    })
    setIsEditing(false)
  }

  const handleDelete = () => {
    deletePod(pod.id)
    navigate('/my-pods')
  }

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
        <div className="ml-auto flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Share className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
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
              {pod.tags.map(tag => (
                <span key={tag} className="px-3 py-1 text-sm font-medium text-blue-700 bg-blue-50/60 rounded border border-blue-100/50">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-5 border-y border-zinc-100">
            <div className="flex items-start gap-3">
               <Clock className="w-4 h-4 text-zinc-400 mt-0.5" />
               <div className="flex-1 pr-4">
                 {isEditing ? (
                   <div className="space-y-1">
                     <p className="font-medium text-zinc-900 text-sm mb-0.5">Time</p>
                     <input 
                       value={editForm.time}
                       onChange={e => setEditForm({...editForm, time: e.target.value})}
                       className="w-full font-medium text-zinc-900 px-3 py-1.5 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                     />
                   </div>
                 ) : (
                   <>
                     <p className="font-medium text-zinc-900 text-[15px]">{pod.time}</p>
                     <p className="text-[13px] text-zinc-500 font-medium mt-0.5">{pod.urgency}</p>
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
                   <p className="text-[15px] text-zinc-800 leading-snug">{pod.location}</p>
                 )}
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
               <div className="w-12 h-12 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                  <span className="text-sm font-medium text-zinc-600">
                    {pod.host.charAt(0)}
                  </span>
               </div>
               <div>
                 <p className="text-[11px] text-zinc-500 font-medium tracking-wide uppercase mb-0.5">Organized by</p>
                 <p className="text-[15px] font-medium text-zinc-900">{pod.host}</p>
               </div>
               {role !== 'organizer' && (
                 <div className="ml-auto">
                   <Button 
                     variant="secondary" 
                     className="text-sm bg-white border-zinc-200 shadow-none px-4"
                     onClick={() => requireAuth(() => setIsChatOpen(true))}
                   >
                     Message
                   </Button>
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
                   {pod.joinedCount || pod.membersCount} <span className="text-lg font-normal text-zinc-400">/ {pod.maxMembers}</span>
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
                         variant="secondary" 
                         className="w-full text-[15px] bg-white shadow-none border border-zinc-200 hover:bg-zinc-50 hover:text-red-600 transition-colors"
                         onClick={() => leavePod(pod.id)}
                       >
                         Leave Pod
                       </Button>
                     </>
                   )}

                   {role === 'organizer' && (
                     <Button 
                       variant="primary" 
                       className="w-full py-2.5 text-base"
                       onClick={() => setIsEditing(true)}
                     >
                       Edit Pod
                     </Button>
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
                  <span className="text-[13px] text-zinc-500 font-semibold hover:text-zinc-900 hover:underline cursor-pointer transition-colors">
                    See all
                  </span>
               </div>
               
               <div className="flex -space-x-3 overflow-hidden pt-2">
                  {pod.avatars?.map((url, idx) => (
                    <img 
                      key={idx}
                      src={url}
                      alt="Participant avatar"
                      className="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover bg-zinc-100 shadow-sm"
                    />
                  ))}
                  {pod.joinedCount > (pod.avatars?.length || 0) && (
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-full ring-2 ring-white bg-zinc-50 border border-zinc-200 text-[11px] font-bold text-zinc-500 relative z-10 shadow-sm">
                      +{pod.joinedCount - pod.avatars.length}
                    </div>
                  )}
                </div>
            </div>
          )}

        </div>

      </div>
      
      {/* Chat Slide-over */}
      {isChatOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div 
            className="absolute inset-0 bg-gray-900/20 backdrop-blur-[2px] transition-opacity"
            onClick={() => setIsChatOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white h-full border-l border-zinc-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Chat Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-white shadow-sm z-10">
              <div>
                <h3 className="font-semibold tracking-tight text-zinc-900 leading-tight">Pod Chat</h3>
                <p className="text-[13px] font-medium text-zinc-500 truncate">{pod.title}</p>
              </div>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
               >
                 <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-zinc-50/50">
               {/* Mock Message 1 */}
               <div className="flex gap-3">
                 <div className="w-8 h-8 rounded-full bg-zinc-200 border border-zinc-300 flex-shrink-0 mt-0.5 overflow-hidden shadow-sm">
                   {pod.avatars?.[0] && <img src={pod.avatars[0]} className="w-full h-full object-cover" alt="" />}
                 </div>
                 <div className="space-y-1">
                   <div className="flex items-center gap-2">
                     <span className="text-[13px] font-semibold text-zinc-900">{pod.host}</span>
                     <span className="text-[11px] font-medium text-zinc-400">10:42 AM</span>
                   </div>
                   <div className="bg-white border border-zinc-200 rounded-2xl rounded-tl-sm px-4 py-2.5 text-[14px] text-zinc-700 shadow-sm leading-snug">
                     Hey everyone! So excited for this. Let me know if you have any questions before we start. We're going to have a blast!
                   </div>
                 </div>
               </div>
               
               {/* Mock Message 2 */}
               <div className="flex gap-3">
                 <div className="w-8 h-8 rounded-full bg-zinc-200 border border-zinc-300 flex-shrink-0 mt-0.5 overflow-hidden shadow-sm">
                   {pod.avatars?.[1] && <img src={pod.avatars[1]} className="w-full h-full object-cover" alt="" />}
                 </div>
                 <div className="space-y-1">
                   <div className="flex items-center gap-2">
                     <span className="text-[13px] font-semibold text-zinc-900">Sarah</span>
                     <span className="text-[11px] font-medium text-zinc-400">11:15 AM</span>
                   </div>
                   <div className="bg-white border border-zinc-200 rounded-2xl rounded-tl-sm px-4 py-2.5 text-[14px] text-zinc-700 shadow-sm leading-snug">
                     What time should we aim to arrive? Should we bring anything specific?
                   </div>
                 </div>
               </div>
            </div>
            
            {/* Chat Input */}
            <div className="p-4 bg-white border-t border-zinc-200">
               <div className="relative">
                 <input 
                   type="text" 
                   className="w-full bg-zinc-50 border border-zinc-200/80 rounded-full pl-4 pr-12 py-3 text-[14px] text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-300 focus:border-zinc-300 font-medium transition-all"
                   placeholder="Message the pod..."
                 />
                 <button className="absolute right-1.5 top-1.5 bottom-1.5 w-9 bg-zinc-900 hover:bg-black text-white rounded-full flex items-center justify-center transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900">
                   <Send className="w-4 h-4 ml-0.5" />
                 </button>
               </div>
            </div>
          </div>
        </div>
      )}
      
    </div>
  )
}
