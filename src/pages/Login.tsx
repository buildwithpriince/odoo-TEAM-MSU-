import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Mail, Lock, User, ArrowRight, ShieldCheck, Sparkles, Loader2, MapPin, Luggage, Wallet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        login(email, name || undefined);
      }
      setIsLoading(false);
      // Successful auth -> land on the main Dashboard
      navigate('/', { replace: true });
    }, 450);
  };

  const handleDemoLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      login('alex.morgan@globetrotter.io', 'Alex Morgan');
      setIsLoading(false);
      navigate('/', { replace: true });
    }, 350);
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-[#F5F1E8]">
      {/* Left: Branding / hero panel (hidden on small screens) */}
      <div className="hidden lg:flex relative flex-col justify-between bg-[#2C221E] text-white p-12 overflow-hidden">
        {/* Dotted route motif */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.08]"
          viewBox="0 0 600 800"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M40 700 C 150 600, 120 450, 250 400 S 420 250, 380 150 S 500 60, 560 40"
            stroke="#FCFAF6"
            strokeWidth="3"
            strokeDasharray="2 14"
            strokeLinecap="round"
          />
        </svg>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#964223] flex items-center justify-center shadow-sm shadow-[#964223]/30">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <span className="font-serif-heading font-bold text-xl tracking-tight">
            Globe<span className="text-[#D9A279] italic font-normal">Trotter</span>
          </span>
        </div>

        <div className="relative z-10 space-y-8 max-w-md">
          <h1 className="font-serif-heading text-4xl leading-tight tracking-tight">
            Plan multi-city journeys worth remembering.
          </h1>
          <p className="text-sm text-[#D9CBBA] leading-relaxed">
            Build day-by-day itineraries, track your budget in real time, and keep every
            stop of your trip organized in one calm, considered place.
          </p>

          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-3 text-sm text-[#F0EAE1]">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <span>Add stops, dates, and cities in minutes</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-[#F0EAE1]">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Luggage className="w-4 h-4" />
              </div>
              <span>Group activities into a clear day-by-day plan</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-[#F0EAE1]">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Wallet className="w-4 h-4" />
              </div>
              <span>Watch your budget update live as you plan</span>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-xs text-[#8F8175]">
          &copy; {new Date().getFullYear()} GlobeTrotter. Crafted for thoughtful travelers.
        </p>
      </div>

      {/* Right: Auth form panel */}
      <div className="flex items-center justify-center px-4 py-10 sm:py-16">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile-only logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-[#964223] text-white flex items-center justify-center shadow-sm shadow-[#964223]/25">
              <Compass className="w-5 h-5" />
            </div>
            <span className="font-serif-heading font-bold text-xl text-[#2C221E]">
              Globe<span className="text-[#964223] italic font-normal">Trotter</span>
            </span>
          </div>

          <div className="editorial-card p-8 sm:p-10 shadow-lg space-y-6">
            <div className="text-center space-y-2">
              <h2 className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#2C221E] tracking-tight">
                {isSignUp ? 'Create your passport' : 'Welcome back, Traveler'}
              </h2>
              <p className="text-xs text-[#6B5E55]">
                {isSignUp
                  ? 'Join GlobeTrotter to plan and synchronize multi-city journeys'
                  : 'Sign in to reach your dashboard and continue planning'}
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold" role="alert">
                {errorMsg}
              </div>
            )}

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
                    <span>{isSignUp ? 'Create Account & Continue' : 'Sign In to Dashboard'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 border-t border-[#EAE2D5] text-center space-y-3">
              <button
                type="button"
                onClick={handleDemoLogin}
                id="demo-login-btn"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-[#F0EAE1] hover:bg-[#EAE2D5] text-[#2C221E] text-xs font-bold transition-colors flex items-center justify-center gap-2 border border-[#E3D9CB] cursor-pointer disabled:opacity-70"
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

          <div className="flex items-center justify-center gap-2 text-xs text-[#8F8175]">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Local storage synced · Offline-ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};
