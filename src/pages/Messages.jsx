import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePods } from '../context/PodsContext';
import api from '../lib/api';
import io from 'socket.io-client';
import { Send, Check, X, Users, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Messages() {
  const { user, requireAuth } = useAuth();
  const { pods } = usePods();
    
  const [activeTab, setActiveTab] = useState('dms'); 
  const [activeChat, setActiveChat] = useState(null); 
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  
  const [requests, setRequests] = useState([]);
  const [connections, setConnections] = useState([]);
  
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    
    socketRef.current = io(process.env.NODE_ENV === 'production' ? 'https://your-backend.com' : 'http://localhost:5000');
    
    socketRef.current.on('new_message', (msg) => {
      setMessages(prev => {
        // Prevent duplicate append if sender is me (optimistic update optional, backend pushes to room)
        if (prev.some(m => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });
    
    loadDMData();

    return () => socketRef.current?.disconnect();
  }, [user]);

  useEffect(() => {
    if (activeChat) {
      loadChatHistory();
      const roomName = activeChat.type === 'pod' ? `pod_${activeChat.id}` : `dm_${[user._id, activeChat.id].sort().join('_')}`;
      socketRef.current.emit('join_chat_room', roomName);
    } else {
      setMessages([]);
    }
  }, [activeChat]);

  const loadDMData = async () => {
    try {
      const [reqRes, connRes] = await Promise.all([
        api.get('/messages/requests'),
        api.get('/messages/connections')
      ]);
      setRequests(reqRes.data);
      setConnections(connRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadChatHistory = async () => {
    try {
      const endpoint = activeChat.type === 'pod' ? `/messages/pod/${activeChat.id}` : `/messages/dm/${activeChat.id}`;
      const res = await api.get(endpoint);
      setMessages(res.data);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err) {
      toast.error('Failed to load messages');
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeChat) return;

    const payload = { content: inputMessage.trim() };
    if (activeChat.type === 'pod') payload.podId = activeChat.id;
    else payload.recipientId = activeChat.id;

    setInputMessage(''); 
    try {
      await api.post('/messages', payload);
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  const handleRequestResponse = async (id, status) => {
    try {
      await api.put(`/messages/requests/respond/${id}`, { status });
      toast.success(`Request ${status}`);
      loadDMData(); 
    } catch (err) {
      toast.error('Failed to respond');
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center space-y-4">
        <h2 className="text-xl font-semibold text-zinc-900 tracking-tight">Sign in to check messages</h2>
        <button onClick={() => requireAuth(() => {})} className="px-5 py-2.5 bg-zinc-900 text-white text-[13px] font-medium rounded-md hover:bg-black transition-colors">
          Log In or Sign Up
        </button>
      </div>
    );
  }

  const myPods = pods.filter(p => p.role === 'member' || p.role === 'organizer');

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-sm animate-in fade-in duration-500 max-w-5xl mx-auto">
      {/* Sidebar */}
      <div className="w-80 border-r border-zinc-100 flex flex-col bg-zinc-50/30">
        <div className="flex border-b border-zinc-100">
          <button 
            onClick={() => { setActiveTab('dms'); setActiveChat(null); }}
            className={`flex-1 py-4 text-[13px] font-bold tracking-wide uppercase flex items-center justify-center gap-2 transition-colors ${activeTab === 'dms' ? 'text-blue-600 bg-blue-50/50 border-b-2 border-blue-600' : 'text-zinc-500 hover:bg-zinc-100'}`}
          >
            <MessageSquare className="w-4 h-4" /> DMs
          </button>
          <button 
            onClick={() => { setActiveTab('pods'); setActiveChat(null); }}
            className={`flex-1 py-4 text-[13px] font-bold tracking-wide uppercase flex items-center justify-center gap-2 transition-colors ${activeTab === 'pods' ? 'text-blue-600 bg-blue-50/50 border-b-2 border-blue-600' : 'text-zinc-500 hover:bg-zinc-100'}`}
          >
            <Users className="w-4 h-4" /> Pods
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === 'dms' ? (
            <>
              {requests.length > 0 && (
                <div className="space-y-2 mb-6">
                  <h3 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest px-2">Pending Requests</h3>
                  {requests.map(req => (
                    <div key={req._id} className="bg-white p-3 rounded-lg border border-zinc-200/80 shadow-sm flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 truncate">
                        {req.requester.profilePicture && req.requester.profilePicture.includes('cloudinary') ? (
                           <img src={req.requester.profilePicture} className="w-8 h-8 rounded-full object-cover" alt="avatar" />
                        ) : (
                           <div className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-500 flex items-center justify-center text-xs font-bold uppercase">{req.requester.name.charAt(0)}</div>
                        )}
                        <span className="text-[13px] font-semibold text-zinc-900 truncate">{req.requester.name}</span>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => handleRequestResponse(req._id, 'accepted')} className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-md transition-colors"><Check className="w-4 h-4" /></button>
                        <button onClick={() => handleRequestResponse(req._id, 'rejected')} className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition-colors"><X className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="space-y-2">
                <h3 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest px-2">Connections</h3>
                {connections.length === 0 ? (
                  <p className="text-[12px] text-zinc-500 px-2 italic font-medium">No active connections yet.</p>
                ) : (
                  connections.map(friend => (
                     <button 
                       key={friend._id}
                       onClick={() => setActiveChat({ type: 'dm', id: friend._id, name: friend.name, picture: friend.profilePicture })}
                       className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${activeChat?.id === friend._id ? 'bg-blue-50 border border-blue-200 shadow-sm' : 'hover:bg-zinc-100 border border-transparent'}`}
                     >
                       {friend.profilePicture && friend.profilePicture.includes('cloudinary') ? (
                           <img src={friend.profilePicture} className="w-10 h-10 rounded-full object-cover shadow-sm bg-white" alt="avatar" />
                        ) : (
                           <div className="w-10 h-10 rounded-full bg-zinc-200 border border-zinc-300 text-zinc-600 flex items-center justify-center text-[13px] font-bold uppercase shadow-sm">{friend.name.charAt(0)}</div>
                        )}
                        <span className="text-[14px] font-bold text-zinc-900">{friend.name}</span>
                     </button>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <h3 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest px-2">Your Pod Chats</h3>
              {myPods.length === 0 ? (
                <p className="text-[12px] text-zinc-500 px-2 italic font-medium">Join a pod to chat with members.</p>
              ) : (
                myPods.map(pod => (
                  <button 
                    key={pod._id}
                    onClick={() => setActiveChat({ type: 'pod', id: pod._id, name: pod.title })}
                    className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${activeChat?.id === pod._id ? 'bg-blue-50 border border-blue-200 shadow-sm' : 'hover:bg-zinc-100 border border-transparent'}`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 text-white flex items-center justify-center text-sm font-bold shadow-sm flex-shrink-0">{pod.title.charAt(0)}</div>
                    <span className="text-[14px] font-bold text-zinc-900 truncate">{pod.title}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {activeChat ? (
          <>
            <div className="h-16 border-b border-zinc-100 flex items-center px-6 gap-4 shadow-sm z-10 w-full mb-2">
              {activeChat.type === 'dm' && activeChat.picture && activeChat.picture.includes('cloudinary') ? (
                 <img src={activeChat.picture} className="w-9 h-9 rounded-full object-cover shadow-sm" alt="avatar" />
              ) : activeChat.type === 'dm' ? (
                 <div className="w-9 h-9 rounded-full bg-zinc-200 border border-zinc-300 text-zinc-600 flex items-center justify-center text-[13px] font-bold uppercase shadow-sm">{activeChat.name.charAt(0)}</div>
              ) : (
                 <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">{activeChat.name.charAt(0)}</div>
              )}
              <h3 className="text-[15px] font-bold text-zinc-900 tracking-tight">{activeChat.name}</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white custom-scrollbar mt-2">
              {messages.map(msg => {
                const isMe = msg.sender._id === user._id;
                return (
                  <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] ${isMe ? 'order-2' : ''}`}>
                      {!isMe && activeChat.type === 'pod' && (
                        <span className="text-[10px] font-bold text-zinc-500 ml-1 mb-1 block">{msg.sender.name}</span>
                      )}
                      <div className={`px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-zinc-100 border border-zinc-200 text-zinc-800 rounded-bl-sm'}`}>
                        {msg.content}
                      </div>
                      <span className={`text-[9px] font-semibold text-zinc-400 mt-1 block ${isMe ? 'text-right mr-1' : 'ml-1'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-zinc-100 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] z-10 relative">
              <div className="relative flex items-center w-full">
                <input 
                  type="text" 
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full pl-4 pr-12 py-3 bg-zinc-50 border border-zinc-200 rounded-full text-[14px] focus:outline-none focus:border-blue-400 focus:bg-white transition-colors"
                />
                <button 
                  type="submit" 
                  disabled={!inputMessage.trim()}
                  className="absolute right-2 w-9 h-9 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-colors shadow-sm"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 space-y-3 bg-zinc-50/50">
            <MessageSquare className="w-12 h-12 opacity-20" />
            <p className="text-[14px] font-medium">Select a conversation to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
}
