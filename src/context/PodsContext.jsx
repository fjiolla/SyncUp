import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { socket } from '../lib/socket';

const PodsContext = createContext(undefined);

export function PodsProvider({ children }) {
  const { user } = useAuth();
  const [pods, setPods] = useState([]);
  const [activeFilter, setActiveFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('syncup_token');
    if (token) {
      socket.auth = { token };
      socket.connect();
    } else {
      socket.disconnect();
    }

    return () => {
      socket.disconnect();
    };
  }, [user]);

  // Initial fetch and socket setup
  useEffect(() => {
    const fetchPods = async () => {
      try {
        const res = await api.get('/api/pods');
        setPods(res.data);
      } catch (error) {
        console.error('Error fetching pods', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPods();

    // Socket Event Listeners
    const handlePodCreated = (newPod) => {
      setPods((prev) => {
        if (prev.some(p => p._id === newPod._id)) return prev;
        return [newPod, ...prev];
      });
    };
    socket.on('pod_created', handlePodCreated);

    socket.on('pod_updated', (updatedPod) => {
      setPods((prev) => prev.map((p) => (p._id === updatedPod._id ? updatedPod : p)));
    });

    socket.on('pod_deleted', (podId) => {
      const idStr = String(podId);
      setPods((prev) => prev.filter((p) => String(p._id) !== idStr));
    });

    socket.on('live_notification', (message) => {
      toast(message, { icon: '👋' });
    });

    return () => {
      socket.off('pod_created', handlePodCreated);
      socket.off('pod_updated');
      socket.off('pod_deleted');
      socket.off('live_notification');
    };
  }, []);

  // Format pod mapping logic locally for UI components (role mapping)
  const formattedPods = useMemo(() => {
    const myId = user?._id != null ? String(user._id) : null;
    return pods.map(pod => {
      const orgId = pod.organizer?._id != null ? String(pod.organizer._id) : null;
      const isOrganizer = myId && orgId && orgId === myId;
      const isJoined = myId && (isOrganizer || (pod.members || []).some(m => String(m._id) === myId));

      const spotsLeft = pod.maxMembers - (pod.members?.length || 0);
      const urgency = spotsLeft <= 2 && spotsLeft > 0 ? `${spotsLeft} spots left` :
                      spotsLeft === 0 ? 'Full' : null;

      const podDate = new Date(pod.dateTime || pod.date);
      const status = podDate > new Date() ? 'active' : 'past';

      return {
        ...pod,
        id: pod._id,
        role: isOrganizer ? 'organizer' : isJoined ? 'member' : 'none',
        isJoined: !!isJoined,
        date: pod.dateTime,
        status,
        host: pod.organizer?.name,
        hostId: pod.organizer?._id,
        membersCount: pod.members?.length ?? 0,
        avatars: (pod.members || []).map(m => m.profilePicture),
        membersList: (pod.members || []).map(m => ({ id: m._id, name: m.name, profilePicture: m.profilePicture })),
        time: new Date(pod.dateTime).toLocaleString([], { weekday: 'long', hour: '2-digit', minute: '2-digit' }),
        urgency,
        spotsLeft,
      };
    });
  }, [pods, user]);

  const addPod = async (newPodData) => {
    try {
      const res = await api.post('/api/pods', {
        ...newPodData,
        // backend expects maxMembers as number
        maxMembers: parseInt(newPodData.maxMembers) || 10,
        // Backend expects dateTime as Date string
        dateTime: newPodData.dateTime || new Date().toISOString()
      });
      // The socket event will broadcast 'pod_created', but we can also eagerly add it
      setPods((prev) => {
        if (prev.some(p => p._id === res.data._id)) return prev;
        return [res.data, ...prev];
      });
      toast.success('Pod created!');
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create pod');
      throw error;
    }
  };

  const joinPod = async (id) => {
    try {
      const res = await api.post(`/api/pods/${id}/join`);
      toast.success('Joined pod successfully!');
      // Socket event 'pod_updated' catches state sync globally
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join pod');
    }
  };

  const leavePod = async (id) => {
    try {
      const res = await api.post(`/api/pods/${id}/leave`);
      toast.success('Left pod');
      // Socket event 'pod_updated' handles state sync natively
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to leave pod');
    }
  };
  
  const updatePodDetails = async (id, updates) => {
    try {
      const payload = {
        title: updates.title,
        description: updates.description,
        location: updates.location,
      };
      if (updates.dateTime) payload.dateTime = new Date(updates.dateTime).toISOString();
      await api.put(`/api/pods/${id}`, payload);
      toast.success('Pod updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update pod');
      throw error;
    }
  };
  
  const deletePod = async (id) => {
    try {
      await api.delete(`/api/pods/${id}`);
      toast.success('Pod deleted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <PodsContext.Provider value={{ 
      pods: formattedPods, 
      loading,
      addPod, 
      joinPod, 
      leavePod, 
      updatePodDetails, 
      deletePod, 
      currentUser: user, // pass user as currentUser for compatibility
      activeFilter, 
      setActiveFilter 
    }}>
      {children}
    </PodsContext.Provider>
  );
}

export function usePods() {
  const context = useContext(PodsContext);
  if (!context) {
    throw new Error('usePods must be used within a PodsProvider');
  }
  return context;
}
