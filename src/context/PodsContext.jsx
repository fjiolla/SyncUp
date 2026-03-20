import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const PodsContext = createContext(undefined);

// Initialize single global socket connection
const socket = io('http://localhost:5000', { autoConnect: true });

export function PodsProvider({ children }) {
  const { user } = useAuth();
  const [pods, setPods] = useState([]);
  const [activeFilter, setActiveFilter] = useState('');
  const [loading, setLoading] = useState(true);

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
      setPods((prev) => prev.filter((p) => p._id !== podId));
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
  const getFormattedPods = () => {
    return pods.map(pod => {
      const isOrganizer = user && pod.organizer._id === user._id;
      const isJoined = user && pod.members.some(m => m._id === user._id);
      
      // Calculate derived fields that the UI expects
      const urgency = pod.spotsLeft <= 2 && pod.spotsLeft > 0 ? `${pod.spotsLeft} spots left` : 
                      pod.spotsLeft === 0 ? 'Full' : null;
      
      const podDate = new Date(pod.dateTime || pod.date);
      const status = podDate > new Date() ? 'active' : 'past';

      return {
        ...pod,
        id: pod._id, // Map MongoDB _id to id for old UI compatibility
        role: isOrganizer ? 'organizer' : isJoined ? 'member' : 'none',
        isJoined: isJoined,
        date: pod.dateTime, // Important: explicitly map dateTime back onto date string for Home.jsx Filters
        status: status,
        host: pod.organizer.name,
        hostId: pod.organizer._id,
        membersCount: pod.members.length,
        avatars: pod.members.map(m => m.profilePicture),
        membersList: pod.members.map(m => ({ id: m._id, name: m.name, profilePicture: m.profilePicture })),
        time: new Date(pod.dateTime).toLocaleString([], { weekday: 'long', hour: '2-digit', minute:'2-digit' }),
        urgency
      };
    });
  };

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
    toast.error('Edit feature requires API update route...');
  };
  
  const deletePod = async (id) => {
    try {
      await api.delete(`/api/pods/${id}`);
      toast.success('Pod deleted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete');
    }
  };

  const formattedPods = getFormattedPods();

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
