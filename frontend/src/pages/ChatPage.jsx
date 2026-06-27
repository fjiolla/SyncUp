import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { HiOutlinePaperAirplane, HiOutlineChatBubbleLeftRight, HiOutlineCheck, HiOutlineXMark } from 'react-icons/hi2';
import { chatApi } from '../api/chat';
import { useAuthStore } from '../store/authStore';
import { usePageTitle } from '../hooks/usePageTitle';
import { confirmDialog } from '../store/confirmStore';
import Avatar from '../components/ui/Avatar';
import EmptyState from '../components/ui/EmptyState';

export default function ChatPage() {
  usePageTitle('Messages');
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [tab, setTab] = useState('inbox');
  const messagesEndRef = useRef(null);

  const loadConversations = () => {
    chatApi.getConversations()
      .then((res) => setConversations(res.data?.results || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    loadConversations();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!selectedConv) return;
    chatApi.getMessages(selectedConv._id, { page: 1, limit: 50 })
      .then((res) => {
        setMessages(res.data?.results || []);
        chatApi.markAsRead(selectedConv._id).catch(() => {});
      })
      .catch(() => {});
  }, [selectedConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getOther = (conv) => {
    if (!conv?.participants) return null;
    return conv.participants.find((p) => (p._id || p) !== user?._id) || conv.participants[0];
  };

  const isIncomingRequest = (conv) =>
    conv.status === 'pending' && (conv.initiator?._id || conv.initiator) !== user?._id;

  const isMyPendingRequest = (conv) =>
    conv.status === 'pending' && (conv.initiator?._id || conv.initiator) === user?._id;

  const inbox = conversations.filter((c) => c.status === 'accepted' || isMyPendingRequest(c));
  const requests = conversations.filter((c) => isIncomingRequest(c));

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConv || sending) return;
    setSending(true);
    try {
      const res = await chatApi.sendMessage(selectedConv._id, { content: newMessage.trim() });
      setMessages((prev) => [...prev, res.data]);
      setNewMessage('');
      loadConversations();
    } catch (err) {
      toast.error(err.message || 'Could not send message');
    }
    setSending(false);
  };

  const handleAccept = async (conv) => {
    try {
      await chatApi.acceptConversation(conv._id);
      toast.success('Message request accepted');
      setSelectedConv({ ...conv, status: 'accepted' });
      setTab('inbox');
      loadConversations();
    } catch (err) {
      toast.error(err.message || 'Could not accept');
    }
  };

  const handleDecline = async (conv) => {
    const ok = await confirmDialog({
      title: 'Delete this message request?',
      message: 'This conversation and its messages will be removed. This cannot be undone.',
      confirmLabel: 'Delete',
      tone: 'danger',
    });
    if (!ok) return;
    try {
      await chatApi.declineConversation(conv._id);
      toast.success('Request deleted');
      if (selectedConv?._id === conv._id) setSelectedConv(null);
      loadConversations();
    } catch (err) {
      toast.error(err.message || 'Could not delete');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto bg-white border border-surface-200 rounded-xl p-12 text-center">
        <HiOutlineChatBubbleLeftRight className="w-12 h-12 mx-auto text-surface-300" />
        <p className="mt-3 text-surface-600">Sign in to access messages</p>
        <button onClick={() => navigate('/login')} className="mt-4 px-4 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
          Sign in
        </button>
      </div>
    );
  }

  const list = tab === 'inbox' ? inbox : requests;
  const selectedIsRequest = selectedConv && isIncomingRequest(selectedConv);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex h-[calc(100vh-8rem)] bg-white border border-surface-200 rounded-xl overflow-hidden">
        <div className="w-72 border-r border-surface-200 flex flex-col">
          <div className="p-4 border-b border-surface-200">
            <h2 className="text-base font-semibold text-surface-900 mb-3">Messages</h2>
            <div className="flex gap-1 bg-surface-100 rounded-lg p-1">
              <button
                onClick={() => setTab('inbox')}
                className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors ${tab === 'inbox' ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500'}`}
              >
                Inbox
              </button>
              <button
                onClick={() => setTab('requests')}
                className={`flex-1 text-xs font-medium py-1.5 rounded-md transition-colors flex items-center justify-center gap-1 ${tab === 'requests' ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-500'}`}
              >
                Requests
                {requests.length > 0 && (
                  <span className="bg-primary-600 text-white text-[10px] px-1.5 rounded-full">{requests.length}</span>
                )}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-10 h-10 bg-surface-100 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 bg-surface-100 rounded w-1/2" />
                      <div className="h-3 bg-surface-100 rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : list.length === 0 ? (
              <EmptyState message={tab === 'inbox' ? 'No conversations yet' : 'No message requests'} size="sm" />
            ) : (
              list.map((conv) => {
                const other = getOther(conv);
                const name = typeof other === 'object' ? (other?.fullName || other?.username || 'User') : 'User';
                return (
                  <button
                    key={conv._id}
                    onClick={() => setSelectedConv(conv)}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-50 transition-colors text-left ${selectedConv?._id === conv._id ? 'bg-primary-50' : ''}`}
                  >
                    <Avatar src={typeof other === 'object' ? other?.profileImage : null} name={name} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-surface-900 truncate">{name}</p>
                      <p className="text-xs text-surface-400 truncate">
                        {isMyPendingRequest(conv) ? 'Request sent' : (conv.lastMessage || 'Start a conversation')}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {!selectedConv ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <HiOutlineChatBubbleLeftRight className="w-12 h-12 mx-auto text-surface-300" />
                <p className="mt-3 text-sm text-surface-400">Select a conversation</p>
              </div>
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-surface-200 flex items-center gap-3">
                {(() => {
                  const other = getOther(selectedConv);
                  const name = typeof other === 'object' ? (other?.fullName || other?.username || 'User') : 'User';
                  return (
                    <>
                      <Avatar src={typeof other === 'object' ? other?.profileImage : null} name={name} size="sm" />
                      <span className="text-sm font-semibold text-surface-900">{name}</span>
                    </>
                  );
                })()}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <AnimatePresence initial={false}>
                  {messages.map((msg) => {
                    const isMine = (msg.sender?._id || msg.sender) === user?._id;
                    return (
                      <motion.div
                        key={msg._id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${isMine ? 'bg-primary-600 text-white rounded-br-sm' : 'bg-surface-100 text-surface-900 rounded-bl-sm'}`}>
                          {msg.content}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {selectedIsRequest ? (
                <div className="p-4 border-t border-surface-200 bg-surface-50">
                  <p className="text-xs text-surface-500 text-center mb-3">
                    {(() => {
                      const other = getOther(selectedConv);
                      const name = typeof other === 'object' ? (other?.fullName || 'This person') : 'This person';
                      return `${name} wants to send you a message. Accept to reply.`;
                    })()}
                  </p>
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => handleAccept(selectedConv)}
                      className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors flex items-center gap-1.5"
                    >
                      <HiOutlineCheck className="w-4 h-4" /> Accept
                    </button>
                    <button
                      onClick={() => handleDecline(selectedConv)}
                      className="px-4 py-2 rounded-lg border border-surface-200 text-surface-600 text-sm font-medium hover:bg-white transition-colors flex items-center gap-1.5"
                    >
                      <HiOutlineXMark className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </div>
              ) : isMyPendingRequest(selectedConv) ? (
                <div className="p-4 border-t border-surface-200 bg-surface-50 text-center">
                  <p className="text-xs text-surface-500">Message request sent. You can send more once they accept.</p>
                </div>
              ) : (
                <form onSubmit={handleSend} className="p-4 border-t border-surface-200 flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-lg text-sm placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="p-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                  >
                    <HiOutlinePaperAirplane className="w-5 h-5" />
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
