import React, { useState } from 'react';
import { User } from '../../types';
import { 
  User as UserIcon, 
  MapPin, 
  DollarSign, 
  Luggage, 
  LogOut, 
  Edit3, 
  Sparkles, 
  Camera,
  Check,
  X,
  ShieldCheck
} from 'lucide-react';

interface ProfileHeaderProps {
  user: User | null;
  activeTripsCount: number;
  currency: string;
  isEditing: boolean;
  onToggleEdit: () => void;
  onSignOut: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  activeTripsCount,
  currency,
  isEditing,
  onToggleEdit,
  onSignOut
}) => {
  const [imageError, setImageError] = useState(false);

  const getInitials = (name?: string) => {
    if (!name) return 'GT';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="editorial-card p-6 sm:p-8 space-y-6 shadow-xs animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 text-center md:text-left">
        
        {/* Avatar & Badges */}
        <div className="relative group shrink-0">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden ring-4 ring-[#EAE2D5] shadow-md bg-[#F0EAE1] flex items-center justify-center">
            {user?.avatarUrl && !imageError ? (
              <img
                src={user.avatarUrl}
                alt={user.name || 'Traveler'}
                onError={() => setImageError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#964223]">
                {getInitials(user?.name)}
              </span>
            )}
          </div>

          <button
            onClick={onToggleEdit}
            aria-label="Edit profile photo"
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-[#964223] text-white flex items-center justify-center shadow-sm hover:bg-[#7D351B] transition-colors cursor-pointer"
            title="Edit Profile"
          >
            {isEditing ? (
              <X className="w-4 h-4" />
            ) : (
              <Edit3 className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Identity Details */}
        <div className="flex-1 space-y-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h1 className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#2C221E] tracking-tight">
                {user?.name || 'Explorer'}
              </h1>
              {user?.role === 'admin' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#4A6B70]/15 text-[#4A6B70] border border-[#4A6B70]/30">
                  <ShieldCheck className="w-3 h-3" />
                  Administrator
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#964223]/10 text-[#964223] border border-[#964223]/20">
                  <Sparkles className="w-3 h-3" />
                  GlobeTrotter Explorer
                </span>
              )}
            </div>
            <p className="text-xs text-[#8F8175] font-medium">{user?.email || 'traveler@globetrotter.io'}</p>
          </div>

          {/* Bio */}
          {user?.bio && (
            <p className="text-xs sm:text-sm text-[#6B5E55] max-w-xl leading-relaxed italic bg-white/50 p-3 rounded-xl border border-[#EAE2D5]/70">
              "{user.bio}"
            </p>
          )}

          {/* Metadata Chips */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-1 text-xs text-[#6B5E55]">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FAF7F2] border border-[#EAE2D5] font-medium">
              <MapPin className="w-3.5 h-3.5 text-[#964223]" />
              <span>Home: {user?.homeCity || 'Not specified'}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FAF7F2] border border-[#EAE2D5] font-medium">
              <Luggage className="w-3.5 h-3.5 text-[#964223]" />
              <span>{activeTripsCount} {activeTripsCount === 1 ? 'Active Journey' : 'Active Journeys'}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FAF7F2] border border-[#EAE2D5] font-medium">
              <DollarSign className="w-3.5 h-3.5 text-[#964223]" />
              <span>Currency: {currency}</span>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-row md:flex-col items-center gap-2.5 self-center md:self-start shrink-0">
          <button
            onClick={onToggleEdit}
            id="profile-edit-btn"
            className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
              isEditing 
                ? 'bg-[#EAE2D5] text-[#2C221E] hover:bg-[#DFD5C6]' 
                : 'btn-glass-primary'
            }`}
          >
            {isEditing ? (
              <>
                <X className="w-3.5 h-3.5" />
                <span>Cancel Editing</span>
              </>
            ) : (
              <>
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </>
            )}
          </button>

          <button
            onClick={onSignOut}
            id="profile-logout-btn"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50/80 hover:bg-rose-100/80 border border-rose-200/80 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

      </div>
    </div>
  );
};
