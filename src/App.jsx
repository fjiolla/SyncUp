import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import MyPods from './pages/MyPods'
import Calendar from './pages/Calendar'
import Profile from './pages/Profile'
import PublicProfile from './pages/PublicProfile'
import PodDetails from './pages/PodDetails'
import Messages from './pages/Messages'
import Admin from './pages/Admin'
import VerifyEmail from './pages/VerifyEmail'
import { PodsProvider } from './context/PodsContext'
import { AuthProvider } from './context/AuthContext'
import { AuthModal } from './components/ui/AuthModal'
import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <AuthProvider>
      <PodsProvider>
        <AuthModal />
        <Toaster position="top-center" toastOptions={{ className: 'text-[13px] font-medium text-zinc-800 rounded-lg shadow-sm border border-zinc-200' }} />
        <Routes>
          <Route path="/verify/:token" element={<VerifyEmail />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/pods" element={<MyPods />} />
            <Route path="/pods/:id" element={<PodDetails />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:id" element={<PublicProfile />} />
            <Route path="/admin" element={<Admin />} />
          </Route>
        </Routes>
      </PodsProvider>
    </AuthProvider>
  )
}

export default App
