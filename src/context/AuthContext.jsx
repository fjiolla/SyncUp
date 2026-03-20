import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // Initialize Auth
  useEffect(() => {
    const initAuth = async () => {
      // Handle OAuth callback status without exposing tokens in URL.
      const urlParams = new URLSearchParams(window.location.search);
      const oauthStatus = urlParams.get('oauth');
      const authFailed = urlParams.get('authFailed');

      if (oauthStatus === 'success') {
        try {
          const res = await api.post('/api/auth/oauth/exchange', {}, { withCredentials: true });
          const userData = res.data;
          if (userData.profilePicture === 'https://api.dicebear.com/7.x/initials/svg') userData.profilePicture = '';
          localStorage.setItem('syncup_token', res.data.token);
          setUser(userData);
          toast.success('Successfully logged in with social provider!');
        } catch (error) {
          toast.error('Social authentication failed. Please try again or use email.');
          localStorage.removeItem('syncup_token');
          setUser(null);
        } finally {
          window.history.replaceState({}, document.title, window.location.pathname);
          setIsLoading(false);
        }
        return;
      } else if (oauthStatus === 'failed' || authFailed) {
        window.history.replaceState({}, document.title, window.location.pathname);
        toast.error('Social authentication failed. Please try again or use email.');
      }

      const token = localStorage.getItem('syncup_token');
      if (token) {
        try {
          const res = await api.get('/api/users/profile');
          const userData = res.data;
          if (userData.profilePicture === 'https://api.dicebear.com/7.x/initials/svg') userData.profilePicture = '';
          setUser(userData);
        } catch (error) {
          console.error('Failed to restore session', error);
          localStorage.removeItem('syncup_token');
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();

    // Listen to our custom interceptor event
    const handleUnauthorized = () => {
      setUser(null);
      toast.error('Session expired. Please log in again.');
    };

    window.addEventListener('auth_unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth_unauthorized', handleUnauthorized);
  }, []);

  const isLoggedIn = !!user;

  const requireAuth = (action) => {
    if (isLoggedIn) {
      action();
    } else {
      setPendingAction(() => action);
      setShowAuthModal(true);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await api.post('/api/auth/login', { email, password });
      const userData = res.data;
      if (userData.profilePicture === 'https://api.dicebear.com/7.x/initials/svg') userData.profilePicture = '';
      
      setUser(userData);
      localStorage.setItem('syncup_token', res.data.token);
      toast.success('Logged in successfully!');
      
      setShowAuthModal(false);
      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
      }
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    }
  };

  const signup = async (name, email, password, age) => {
    try {
      const res = await api.post('/api/auth/signup', { name, email, password, age });
      if (res.data?.verificationRequired) {
        toast.success(res.data.message || 'Registration successful. Please verify your email.');
        return { success: true, verificationRequired: true };
      }

      return { success: true, verificationRequired: false };
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed');
      return { success: false, verificationRequired: false };
    }
  };

  const cancelLogin = () => {
    setShowAuthModal(false);
    setPendingAction(null);
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await api.put('/api/users/profile', profileData);
      const userData = res.data;
      if (userData.profilePicture === 'https://api.dicebear.com/7.x/initials/svg') userData.profilePicture = '';
      
      setUser(userData);
      toast.success('Profile updated successfully!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (e) {} // best effort
    setUser(null);
    localStorage.removeItem('syncup_token');
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ 
      user,
      isLoggedIn, 
      isLoading,
      requireAuth, 
      showAuthModal, 
      login, 
      signup,
      updateProfile,
      cancelLogin,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
