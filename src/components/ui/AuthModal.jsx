import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Button } from './Button'
import { LogIn } from 'lucide-react'
import toast from 'react-hot-toast'

export function AuthModal() {
  const { showAuthModal, login, signup, cancelLogin } = useAuth()
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [age, setAge] = useState('')
  const [loading, setLoading] = useState(false)

  if (!showAuthModal) return null

  const handleSubmit = async (e) => {
    e.preventDefault()

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (!isLoginMode && name.length < 3) {
      toast.error('Name must be at least 3 characters');
      return;
    }

    if (!isLoginMode && (!age || isNaN(age) || parseInt(age) < 18)) {
      toast.error('You must be at least 18 years old to join SyncUp');
      return;
    }

    setLoading(true)
    
    let success = false;
    if (isLoginMode) {
      success = await login(email, password)
    } else {
      success = await signup(name, email, password, parseInt(age))
    }
    
    setLoading(false)
    if (success) {
      setName('')
      setEmail('')
      setPassword('')
      setAge('')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={cancelLogin} />
      
      <div className="relative bg-white rounded-xl shadow-xl border border-zinc-200/80 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-7 text-center space-y-6">
          <div className="mx-auto w-10 h-10 border border-zinc-200 shadow-sm bg-zinc-50 text-zinc-800 rounded-lg flex items-center justify-center mb-1">
            <LogIn className="w-5 h-5" />
          </div>
          
          <div className="space-y-1.5">
            <h2 className="text-xl font-semibold text-zinc-900 tracking-tight">
              {isLoginMode ? 'Welcome Back' : 'Create an Account'}
            </h2>
            <p className="text-[13px] text-zinc-500 font-medium leading-relaxed px-2">
              {isLoginMode ? 'Login to join this pod and interact with other members.' : 'Sign up to dive into the community.'}
            </p>
          </div>
          
          <form className="space-y-3 pt-2 text-left" onSubmit={handleSubmit} noValidate>
            {!isLoginMode && (
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-[11px] font-semibold text-zinc-500 mb-1 uppercase tracking-wide">Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-[13px] focus:outline-none focus:border-zinc-400 focus:bg-white transition-colors"
                    autoComplete="name"
                    required={!isLoginMode}
                  />
                </div>
                <div className="w-20">
                  <label className="block text-[11px] font-semibold text-zinc-500 mb-1 uppercase tracking-wide">Age</label>
                  <input 
                    type="number" 
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    min="18"
                    max="100"
                    placeholder="18+"
                    className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-[13px] focus:outline-none focus:border-zinc-400 focus:bg-white transition-colors"
                    required={!isLoginMode}
                  />
                </div>
              </div>
            )}
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 mb-1 uppercase tracking-wide">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-[13px] focus:outline-none focus:border-zinc-400 focus:bg-white transition-colors"
                autoComplete="email"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 mb-1 uppercase tracking-wide">Password</label>
              <input 
                type="text" 
                style={{ WebkitTextSecurity: 'disc' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-md text-[13px] focus:outline-none focus:border-zinc-400 focus:bg-white transition-colors tracking-widest"
                autoComplete="off"
                data-lpignore="true"
                spellCheck="false"
                required
              />
            </div>

            <div className="pt-2">
              <Button 
                type="submit"
                variant="primary" 
                className="w-full py-2 bg-zinc-900 hover:bg-black text-[13px]"
                disabled={loading}
              >
                {loading ? 'Please wait...' : (isLoginMode ? 'Login' : 'Sign up')}
              </Button>
            </div>
          </form>
          
          <div className="text-[12px] text-zinc-500 font-medium pb-2">
            {isLoginMode ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button"
              onClick={() => setIsLoginMode(!isLoginMode)} 
              className="text-zinc-900 font-semibold hover:underline"
            >
              {isLoginMode ? 'Sign up' : 'Login'}
            </button>
          </div>

          <button 
            onClick={cancelLogin}
            className="text-[11px] font-semibold tracking-wide uppercase text-zinc-400 hover:text-zinc-600 transition-colors block w-full text-center"
          >
            Cancel and explore
          </button>
        </div>
      </div>
    </div>
  )
}
