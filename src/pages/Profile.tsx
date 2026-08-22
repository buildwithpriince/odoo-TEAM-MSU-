import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  MapPin, 
  DollarSign, 
  Globe, 
  Check, 
  LogOut, 
  Bookmark, 
  Compass, 
  Sparkles,
  Luggage,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTrip } from '../context/TripContext';
import { useCurrency, Currency } from '../context/CurrencyContext';
import { POPULAR_DESTINATIONS } from '../data/mockData';

export const Profile: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const { trips } = useTrip();
  const { currency, setCurrency } = useCurrency();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || 'Alex Morgan');
  const [homeCity, setHomeCity] = useState(user?.homeCity || 'San Francisco, CA');
  const [bio, setBio] = useState(user?.bio || 'Passionate wanderer seeking authentic local food, mountain trails, and heritage architecture.');

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, homeCity, currency, bio });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Header Profile Card */}
      <div className="editorial-card p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          
          <div className="relative group shrink-0">
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
              alt={user?.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover ring-4 ring-[#EAE2D5] shadow-md"
            />
            <div className="absolute -bottom-1.5 -right-1.5 bg-[#964223] text-white p-1.5 rounded-xl shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          <div className="flex-1 space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#2C221E]">{user?.name}</h1>
                <p className="text-xs text-[#8F8175]">{user?.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                id="profile-logout-btn"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-50 rounded-xl transition-colors border border-rose-200 self-center sm:self-start cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>

            <p className="text-xs sm:text-sm text-[#6B5E55] max-w-xl leading-relaxed">{user?.bio}</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-xs text-[#6B5E55]">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#964223]" />
                <span>Home: {user?.homeCity}</span>
              </span>
              <span className="flex items-center gap-1">
                <Luggage className="w-3.5 h-3.5 text-[#964223]" />
                <span>{trips.length} Active Journeys</span>
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-[#964223]" />
                <span>Currency: {user?.currency}</span>
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Profile Settings Form & Saved Destinations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Edit Details */}
        <div className="md:col-span-2 editorial-card p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D5]">
            <h2 className="font-serif-heading text-lg font-bold text-[#2C221E]">
              Traveler Preferences & Settings
            </h2>
            {savedSuccess && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-md">
                <Check className="w-3.5 h-3.5" />
                <span>Preferences Updated</span>
              </span>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B5E55] mb-1" htmlFor="prof-name">
                  Display Name
                </label>
                <input
                  id="prof-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E0D7C8] rounded-xl text-xs text-[#2C221E] focus:outline-hidden focus:ring-2 focus:ring-[#964223]/30"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B5E55] mb-1" htmlFor="prof-city">
                  Home City
                </label>
                <input
                  id="prof-city"
                  type="text"
                  value={homeCity}
                  onChange={(e) => setHomeCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E0D7C8] rounded-xl text-xs text-[#2C221E] focus:outline-hidden focus:ring-2 focus:ring-[#964223]/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B5E55] mb-1" htmlFor="prof-cur">
                Default Currency
              </label>
              <select
                id="prof-cur"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E0D7C8] rounded-xl text-xs text-[#2C221E]"
              >
                <option value="USD">USD ($ - US Dollar)</option>
                <option value="INR">INR (₹ - Indian Rupee)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B5E55] mb-1" htmlFor="prof-bio">
                Travel Bio & Style Notes
              </label>
              <textarea
                id="prof-bio"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E0D7C8] rounded-xl text-xs text-[#2C221E]"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                id="save-profile-btn"
                className="px-5 py-2.5 rounded-xl bg-[#964223] hover:bg-[#7D351B] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Save Preferences
              </button>
            </div>
          </form>
        </div>

        {/* Right Col: Saved Bucket List */}
        <div className="editorial-card p-6 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#EAE2D5]">
            <Bookmark className="w-4 h-4 text-[#964223]" />
            <h3 className="font-serif-heading text-base font-bold text-[#2C221E]">
              Featured Wishlist
            </h3>
          </div>

          <div className="space-y-3">
            {POPULAR_DESTINATIONS.slice(0, 3).map((dest) => (
              <div key={dest.id} className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E0D7C8] flex items-center justify-between">
                <div>
                  <p className="font-serif-heading font-bold text-xs text-[#2C221E]">{dest.name}</p>
                  <p className="text-[10px] text-[#8F8175]">{dest.country}</p>
                </div>
                <Link
                  to={`/trips/new?destId=${dest.id}`}
                  className="px-2.5 py-1 rounded-lg bg-[#964223] text-white text-[10px] font-bold hover:bg-[#7D351B]"
                >
                  Plan &rarr;
                </Link>
              </div>
            ))}
          </div>

          <Link
            to="/explore"
            className="block text-center text-xs font-bold text-[#964223] hover:underline pt-2"
          >
            Explore All Destinations &rarr;
          </Link>
        </div>

      </div>

    </div>
  );
};
