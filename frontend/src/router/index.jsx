import { createBrowserRouter } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import AppLayout from '../layouts/AppLayout';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import OAuthCallbackPage from '../pages/auth/OAuthCallbackPage';
import OnboardingPage from '../pages/auth/OnboardingPage';
import DashboardPage from '../pages/DashboardPage';
import PodsPage from '../pages/pods/PodsPage';
import CreatePodPage from '../pages/pods/CreatePodPage';
import PodDetailPage from '../pages/pods/PodDetailPage';
import CalendarPage from '../pages/CalendarPage';
import DiscoverPage from '../pages/DiscoverPage';
import ProfilePage from '../pages/ProfilePage';
import UserProfilePage from '../pages/UserProfilePage';
import SearchPage from '../pages/SearchPage';
import NotificationsPage from '../pages/NotificationsPage';
import FollowRequestsPage from '../pages/FollowRequestsPage';
import ChatPage from '../pages/ChatPage';
import AdminPage from '../pages/AdminPage';
import NotFoundPage from '../pages/NotFoundPage';

export const router = createBrowserRouter([
  { path: '/oauth/callback', element: <OAuthCallbackPage /> },
  { path: '/onboarding', element: <OnboardingPage /> },
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
    ],
  },
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <DashboardPage /> },
      { path: '/pods', element: <PodsPage /> },
      { path: '/pods/create', element: <CreatePodPage /> },
      { path: '/pods/:slug', element: <PodDetailPage /> },
      { path: '/discover', element: <DiscoverPage /> },
      { path: '/events', element: <CalendarPage /> },
      { path: '/profile', element: <ProfilePage /> },
      { path: '/u/:username', element: <UserProfilePage /> },
      { path: '/search', element: <SearchPage /> },
      { path: '/notifications', element: <NotificationsPage /> },
      { path: '/follow-requests', element: <FollowRequestsPage /> },
      { path: '/chat', element: <ChatPage /> },
      { path: '/admin', element: <AdminPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
