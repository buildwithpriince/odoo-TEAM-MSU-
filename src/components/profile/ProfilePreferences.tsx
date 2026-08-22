import React from 'react';
import { Currency } from '../../context/CurrencyContext';
import { 
  Check, 
  RotateCw, 
  X, 
  Sparkles, 
  MapPin, 
  DollarSign, 
  User as UserIcon, 
  Image as ImageIcon,
  FileText
} from 'lucide-react';

interface ProfilePreferencesProps {
  name: string;
  setName: (name: string) => void;
  homeCity: string;
  setHomeCity: (homeCity: string) => void;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  avatarUrl: string;
  setAvatarUrl: (avatarUrl: string) => void;
  bio: string;
  setBio: (bio: string) => void;
  isSaving: boolean;
  savedSuccess: boolean;
  onSave: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const ProfilePreferences: React.FC<ProfilePreferencesProps> = ({
  name,
  setName,
  homeCity,
  setHomeCity,
  currency,
  setCurrency,
  avatarUrl,
  setAvatarUrl,
  bio,
  setBio,
  isSaving,
  savedSuccess,
  onSave,
  onCancel
}) => {
  return (
    <div className="editorial-card p-6 sm:p-8 space-y-6 shadow-xs animate-in slide-in-from-top-3 duration-200">
      
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#EAE2D5]">
        <div>
          <h2 className="font-serif-heading text-xl font-bold text-[#2C221E]">
            Traveler Preferences & Settings
          </h2>
          <p className="text-xs text-[#6B5E55] mt-0.5">
            Customize your traveler profile, default currency, and expedition preferences.
          </p>
        </div>

        {savedSuccess && (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-3 py-1 rounded-xl animate-in fade-in duration-200">
            <Check className="w-3.5 h-3.5" />
            <span>Profile Updated Successfully</span>
          </span>
        )}
      </div>

      {/* Form Body */}
      <form onSubmit={onSave} className="space-y-5" id="profile-settings-form">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Display Name */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B5E55]" htmlFor="profile-name-input">
              Display Name <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8F8175]">
                <UserIcon className="w-4 h-4" />
              </div>
              <input
                id="profile-name-input"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#E0D7C8] rounded-xl text-xs font-medium text-[#2C221E] focus:outline-hidden focus:ring-2 focus:ring-[#964223]/30"
              />
            </div>
          </div>

          {/* Home City */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B5E55]" htmlFor="profile-city-input">
              Home City
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8F8175]">
                <MapPin className="w-4 h-4" />
              </div>
              <input
                id="profile-city-input"
                type="text"
                value={homeCity}
                onChange={(e) => setHomeCity(e.target.value)}
                placeholder="e.g. San Francisco, CA"
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#E0D7C8] rounded-xl text-xs font-medium text-[#2C221E] focus:outline-hidden focus:ring-2 focus:ring-[#964223]/30"
              />
            </div>
          </div>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Default Currency */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B5E55]" htmlFor="profile-currency-select">
              Default Currency
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8F8175]">
                <DollarSign className="w-4 h-4" />
              </div>
              <select
                id="profile-currency-select"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#E0D7C8] rounded-xl text-xs font-medium text-[#2C221E] focus:outline-hidden focus:ring-2 focus:ring-[#964223]/30 cursor-pointer"
              >
                <option value="USD">USD ($ - US Dollar)</option>
                <option value="INR">INR (₹ - Indian Rupee)</option>
              </select>
            </div>
          </div>

          {/* Avatar Photo URL */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B5E55]" htmlFor="profile-avatar-input">
              Avatar Image URL
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8F8175]">
                <ImageIcon className="w-4 h-4" />
              </div>
              <input
                id="profile-avatar-input"
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#E0D7C8] rounded-xl text-xs font-medium text-[#2C221E] focus:outline-hidden focus:ring-2 focus:ring-[#964223]/30"
              />
            </div>
          </div>

        </div>

        {/* Travel Bio */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B5E55]" htmlFor="profile-bio-textarea">
            Travel Bio & Style Notes
          </label>
          <div className="relative">
            <textarea
              id="profile-bio-textarea"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell other travelers about your passions, favorite destinations, and travel vibes..."
              className="w-full p-3.5 bg-[#FAF7F2] border border-[#E0D7C8] rounded-xl text-xs font-medium text-[#2C221E] focus:outline-hidden focus:ring-2 focus:ring-[#964223]/30 leading-relaxed"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="pt-2 border-t border-[#F0EAE1] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="px-4 py-2.5 rounded-xl border border-[#D9CBBA] text-xs font-bold text-[#6B5E55] hover:bg-[#FAF7F2] transition-colors cursor-pointer disabled:opacity-60"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={isSaving}
            id="save-preferences-btn"
            className="px-6 py-2.5 rounded-xl btn-glass-primary text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-70 hover:scale-[1.02] active:scale-[0.98]"
          >
            {isSaving ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>Saving Preferences...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Save Preferences</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};
