import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import MyPods from './pages/MyPods'
import Calendar from './pages/Calendar'
import Profile from './pages/Profile'
import PodDetails from './pages/PodDetails'
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
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/pods" element={<MyPods />} />
            <Route path="/pods/:id" element={<PodDetails />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </PodsProvider>
    </AuthProvider>
  )
}

export default App
