import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Compass, Mail, Lock, User, ArrowRight, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('alex.morgan@globetrotter.io');
  const [password, setPassword] = useState('traveler2026');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (isSignUp && !name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (!email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      if (isSignUp) {
        signup(email, name.trim());
      } else {
        login(email, name || 'Alex Morgan');
      }
      setIsLoading(false);
      navigate('/');
    }, 450);
  };

  const handleDemoLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      login('alex.morgan@globetrotter.io', 'Alex Morgan');
      setIsLoading(false);
      navigate('/');
    }, 350);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-md space-y-6">
        
        {/* Main Auth Card */}
        <div className="editorial-card p-8 sm:p-10 shadow-lg space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#964223] text-white flex items-center justify-center mx-auto shadow-sm shadow-[#964223]/25">
              <Compass className="w-6 h-6" />
            </div>
            
            <div>
              <h1 className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#2C221E] tracking-tight">
                {isSignUp ? 'Create your passport' : 'Welcome back, Traveler'}
              </h1>
              <p className="text-xs text-[#6B5E55] mt-1">
                {isSignUp
                  ? 'Join GlobeTrotter to plan and synchronize multi-city journeys'
                  : 'Sign in to access your curated journeys and itineraries'}
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" id="auth-form">
            {isSignUp && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B5E55] mb-1" htmlFor="full-name-input">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8F8175]">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="full-name-input"
                    type="text"
                    required={isSignUp}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#E0D7C8] rounded-xl text-xs text-[#2C221E] focus:outline-hidden focus:ring-2 focus:ring-[#964223]/30"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B5E55] mb-1" htmlFor="email-input">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8F8175]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="traveler@globetrotter.io"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#E0D7C8] rounded-xl text-xs text-[#2C221E] focus:outline-hidden focus:ring-2 focus:ring-[#964223]/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B5E55] mb-1" htmlFor="password-input">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8F8175]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password-input"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#E0D7C8] rounded-xl text-xs text-[#2C221E] focus:outline-hidden focus:ring-2 focus:ring-[#964223]/30"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              id="auth-submit-btn"
              className="w-full py-3 rounded-xl bg-[#964223] hover:bg-[#7D351B] text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Option */}
          <div className="pt-2 border-t border-[#EAE2D5] text-center space-y-3">
            <button
              type="button"
              onClick={handleDemoLogin}
              id="demo-login-btn"
              className="w-full py-2.5 rounded-xl bg-[#F0EAE1] hover:bg-[#EAE2D5] text-[#2C221E] text-xs font-bold transition-colors flex items-center justify-center gap-2 border border-[#E3D9CB] cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#964223]" />
              <span>Explore as Demo Traveler (Alex Morgan)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMsg('');
              }}
              className="text-xs text-[#6B5E55] hover:text-[#964223] font-semibold transition-colors"
            >
              {isSignUp
                ? 'Already have an account? Sign In'
                : 'Need an account? Create one now'}
            </button>
          </div>

        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-[#8F8175]">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Local storage synced · Offline-ready</span>
        </div>

      </div>
    </div>
  );
};
