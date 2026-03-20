import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Button } from './Button'
import { LogIn, MailCheck, Github } from 'lucide-react'
import Lottie from 'lottie-react'
import toast from 'react-hot-toast'
import api from '../../lib/api'

export function AuthModal() {
  const { showAuthModal, login, signup, cancelLogin } = useAuth()
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [age, setAge] = useState('')
  const [loading, setLoading] = useState(false)
  const [isVerificationSent, setIsVerificationSent] = useState(false)
  
  // Generic safe Lottie geometry animation JSON placeholder mapping
  const animationData = {
    v: "5.5.2", fr: 60, ip: 0, op: 180, w: 500, h: 500, nm: "Success",
    layers: [{"ddd":0,"ind":1,"ty":4,"nm":"Shape Layer 1","sr":1,"ks":{"o":{"a":0,"k":100,"ix":11},"r":{"a":0,"k":0,"ix":10},"p":{"a":0,"k":[250,250,0],"ix":2},"a":{"a":0,"k":[0,0,0],"ix":1},"s":{"a":1,"k":[{"i":{"x":[0.667,0.667,0.667],"y":[1,1,1]},"o":{"x":[0.333,0.333,0.333],"y":[0,0,0]},"t":0,"s":[0,0,100]},{"i":{"x":[0.667,0.667,0.667],"y":[1,1,1]},"o":{"x":[0.333,0.333,0.333],"y":[0,0,0]},"t":30,"s":[120,120,100]},{"t":60,"s":[100,100,100]}],"ix":6}},"ao":0,"shapes":[{"ty":"gr","it":[{"d":1,"ty":"el","s":{"a":0,"k":[200,200],"ix":2},"p":{"a":0,"k":[0,0],"ix":3},"nm":"Ellipse Path 1","mn":"ADBE Vector Shape - Ellipse","hd":false},{"ty":"st","c":{"a":0,"k":[0.141,0.764,0.368,1],"ix":3},"o":{"a":0,"k":100,"ix":4},"w":{"a":0,"k":15,"ix":5},"lc":1,"lj":1,"ml":4,"bm":0,"nm":"Stroke 1","mn":"ADBE Vector Graphic - Stroke","hd":false},{"ty":"tr","p":{"a":0,"k":[0,0],"ix":2},"a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"Ellipse 1","np":3,"cix":2,"bm":0,"ix":1,"mn":"ADBE Vector Group","hd":false},{"ty":"gr","it":[{"ind":0,"ty":"sh","ix":1,"ks":{"a":1,"k":[{"i":{"x":0.667,"y":1},"o":{"x":0.333,"y":0},"t":30,"s":[{"i":[[0,0],[0,0],[0,0]],"o":[[0,0],[0,0],[0,0]],"v":[[-45,10],[-15,40],[55,-30]],"c":false}]},{"t":60,"s":[{"i":[[0,0],[0,0],[0,0]],"o":[[0,0],[0,0],[0,0]],"v":[[-45,10],[-15,40],[55,-30]],"c":false}]}],"ix":2},"nm":"Path 1","mn":"ADBE Vector Shape - Group","hd":false},{"ty":"st","c":{"a":0,"k":[0.141,0.764,0.368,1],"ix":3},"o":{"a":0,"k":100,"ix":4},"w":{"a":0,"k":15,"ix":5},"lc":2,"lj":2,"ml":4,"bm":0,"nm":"Stroke 1","mn":"ADBE Vector Graphic - Stroke","hd":false},{"ty":"tm","s":{"a":0,"k":0,"ix":1},"e":{"a":1,"k":[{"i":{"x":[0.667],"y":[1]},"o":{"x":[0.333],"y":[0]},"t":30,"s":[0]},{"t":60,"s":[100]}],"ix":2},"o":{"a":0,"k":0,"ix":3},"m":1,"ix":3,"nm":"Trim Paths 1","mn":"ADBE Vector Filter - Trim","hd":false},{"ty":"tr","p":{"a":0,"k":[0,0],"ix":2},"a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"Check","np":3,"cix":2,"bm":0,"ix":2,"mn":"ADBE Vector Group","hd":false}],"ip":0,"op":180,"st":0,"bm":0}]}

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
    let resMsg = '';
    
    try {
      if (isLoginMode) {
        success = await login(email, password)
      } else {
        const response = await api.post('/auth/signup', { name, email, password, age: parseInt(age) });
        if (response.data.verificationRequired) {
          setIsVerificationSent(true);
        }
      }
    } catch (error) {
       toast.error(error.response?.data?.message || 'Authentication failed');
    }
    
    setLoading(false)
    if (success && isLoginMode) {
      setName('')
      setEmail('')
      setPassword('')
      setAge('')
      cancelLogin()
    }
  }

  const handleResend = async () => {
    try {
      await api.post('/auth/resend', { email });
      toast.success('Verification link resent to your email.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend email');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={cancelLogin} />
      
      <div className="relative bg-white rounded-xl shadow-xl border border-zinc-200/80 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {isVerificationSent ? (
          <div className="p-8 text-center space-y-5">
            <div className="mx-auto w-24 h-24 mb-2">
               <Lottie animationData={animationData} loop={false} autoplay={true} />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-zinc-900 tracking-tight">
                Check your email
              </h2>
              <p className="text-[13px] text-zinc-500 font-medium leading-relaxed px-2">
                We've sent a secure verification link to <span className="text-zinc-900 font-bold">{email}</span>. Please click it to activate your account.
              </p>
            </div>
            
            <div className="pt-2 space-y-3">
               <Button variant="primary" className="w-full py-2 bg-zinc-900 hover:bg-black text-[13px]" onClick={cancelLogin}>
                 Back to Login
               </Button>
               <button onClick={handleResend} className="text-[12px] font-semibold text-zinc-500 hover:text-zinc-800 transition-colors uppercase tracking-wide">
                 Resend Verification Email
               </button>
            </div>
          </div>
        ) : (
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
              {/* Form Inputs ... */}
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
            
            {/* OAuth Separator */}
            <div className="relative py-2">
               <div className="absolute inset-0 flex items-center">
                 <div className="w-full border-t border-zinc-200"></div>
               </div>
               <div className="relative flex justify-center text-[11px] font-semibold tracking-widest uppercase">
                 <span className="bg-white px-3 text-zinc-400">Or continue with</span>
               </div>
            </div>

            {/* OAuth Buttons */}
            <div className="space-y-2">
               <a href="http://localhost:5000/api/auth/google" className="w-full py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 text-[13px] font-medium rounded-md shadow-sm transition-colors flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                     <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                     <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                     <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                     <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
               </a>
               <a href="http://localhost:5000/api/auth/github" className="w-full py-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 text-[13px] font-medium rounded-md shadow-sm transition-colors flex items-center justify-center gap-2">
                  <Github className="w-4 h-4 text-zinc-900" /> GitHub
               </a>
            </div>
            
            <div className="text-[12px] text-zinc-500 font-medium pt-2">
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
        )}
      </div>
    </div>
  )
}
