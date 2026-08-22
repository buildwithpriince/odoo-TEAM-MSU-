import React, { useState } from 'react';
import { CommunityTrip } from '../../types/community';
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  ArrowRight, 
  Copy, 
  Share2, 
  Bookmark, 
  Heart, 
  Navigation, 
  Compass, 
  Sparkles,
  Check,
  CheckCircle2
} from 'lucide-react';

interface CommunityTripCardProps {
  trip: CommunityTrip;
  onViewJourney: (trip: CommunityTrip) => void;
  onCopyTrip: (trip: CommunityTrip) => void;
  onShareTrip: (trip: CommunityTrip) => void;
  onToggleLike: (tripId: string) => void;
  onToggleSave: (tripId: string) => void;
}

export const CommunityTripCard: React.FC<CommunityTripCardProps> = ({
  trip,
  onViewJourney,
  onCopyTrip,
  onShareTrip,
  onToggleLike,
  onToggleSave
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Format relative time
  const formatTimeAgo = (isoDate: string) => {
    try {
      const diffMs = Date.now() - new Date(isoDate).getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays <= 0) return 'Shared today';
      if (diffDays === 1) return 'Shared yesterday';
      if (diffDays < 7) return `Shared ${diffDays} days ago`;
      if (diffDays < 30) return `Shared ${Math.floor(diffDays / 7)} weeks ago`;
      return `Shared on ${new Date(isoDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    } catch {
      return 'Recently shared';
    }
  };

  const fallbackImage = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80';

  return (
    <article 
      className="editorial-card-hover p-5 sm:p-7 space-y-5 transition-all duration-300 group"
      aria-label={`Community journey: ${trip.title}`}
    >
      
      {/* Traveler Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <img
              src={trip.traveler.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
              alt={trip.traveler.name}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover ring-2 ring-[#EAE2D5] shadow-xs"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#964223] text-white flex items-center justify-center text-[9px] shadow-xs">
              <Compass className="w-2.5 h-2.5" />
            </div>
          </div>

          <div>
            <h3 className="font-bold text-sm text-[#2C221E] leading-tight">
              {trip.traveler.name}
            </h3>
            <div className="flex items-center gap-2 text-[11px] text-[#8F8175] mt-0.5">
              <span>{trip.traveler.homeCity || 'GlobeTrotter Explorer'}</span>
              <span>•</span>
              <span>{formatTimeAgo(trip.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Save / Like Quick Interactions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onToggleLike(trip.id)}
            aria-label={trip.isLiked ? 'Unlike trip' : 'Like trip'}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              trip.isLiked
                ? 'bg-rose-50 text-rose-600'
                : 'text-[#8F8175] hover:bg-[#F0EAE1] hover:text-rose-600'
            }`}
          >
            <Heart className={`w-4 h-4 ${trip.isLiked ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={() => onToggleSave(trip.id)}
            aria-label={trip.isSaved ? 'Remove from saved' : 'Save trip to wishlist'}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              trip.isSaved
                ? 'bg-amber-50 text-amber-700'
                : 'text-[#8F8175] hover:bg-[#F0EAE1] hover:text-[#964223]'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${trip.isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Trip Title & Vibe Badge */}
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          {trip.travelVibe && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#F0EAE1] text-[#964223] border border-[#E3D9CB]">
              <Sparkles className="w-3 h-3" />
              {trip.travelVibe}
            </span>
          )}
          <span className="text-[10px] font-bold text-[#8F8175] uppercase tracking-wider">
            {trip.stopsCount} {trip.stopsCount === 1 ? 'City Stop' : 'City Stops'}
          </span>
        </div>

        <h2 
          onClick={() => onViewJourney(trip)}
          className="font-serif-heading text-xl sm:text-2xl font-bold text-[#2C221E] group-hover:text-[#964223] transition-colors cursor-pointer leading-snug"
        >
          {trip.title}
        </h2>
      </div>

      {/* Large Cover Image */}
      <div 
        onClick={() => onViewJourney(trip)}
        className="relative w-full h-56 sm:h-72 rounded-2xl overflow-hidden cursor-pointer shadow-xs border border-[#EAE2D5]"
      >
        <img
          src={imageError ? fallbackImage : (trip.coverImage || fallbackImage)}
          alt={trip.title}
          onError={() => setImageError(true)}
          onLoad={() => setImageLoaded(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

        {/* Overlay Bottom Tag */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-semibold drop-shadow-md">
          <span className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
            <Calendar className="w-3.5 h-3.5 text-amber-300" />
            <span>{trip.durationDays} Days Journey</span>
          </span>
          <span className="bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
            ${trip.totalBudget.toLocaleString()} Total Budget
          </span>
        </div>
      </div>

      {/* Connected Route Stop Pills */}
      {trip.stops && trip.stops.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8F8175] block">
            Curated Route Circuit
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {trip.stops.map((stop, sIdx) => (
              <React.Fragment key={stop.id || `${stop.cityName}-${sIdx}`}>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FAF7F2] border border-[#EAE2D5] text-xs font-bold text-[#2C221E] shadow-2xs">
                  <MapPin className="w-3 h-3 text-[#964223]" />
                  <span>{stop.cityName}</span>
                  {stop.country && (
                    <span className="text-[10px] text-[#8F8175] font-normal">({stop.country})</span>
                  )}
                </div>
                {sIdx < trip.stops.length - 1 && (
                  <span className="text-[#964223] font-bold text-xs px-0.5">
                    &rarr;
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Description Snippet */}
      {trip.description && (
        <p className="text-xs sm:text-sm text-[#6B5E55] leading-relaxed line-clamp-2 italic">
          "{trip.description}"
        </p>
      )}

      {/* Action Toolbar */}
      <div className="pt-2 border-t border-[#F0EAE1] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Engagement Counters */}
        <div className="flex items-center gap-4 text-xs text-[#8F8175]">
          <span className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-rose-600/70" />
            <span>{trip.likesCount} {trip.likesCount === 1 ? 'like' : 'likes'}</span>
          </span>
          <span className="flex items-center gap-1">
            <Bookmark className="w-3.5 h-3.5 text-amber-700/70" />
            <span>{trip.savesCount} {trip.savesCount === 1 ? 'save' : 'saves'}</span>
          </span>
        </div>

        {/* Primary and Secondary Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto">
          <button
            onClick={() => onShareTrip(trip)}
            id={`share-trip-btn-${trip.id}`}
            aria-label={`Share ${trip.title}`}
            className="p-2.5 rounded-xl border border-[#E3D9CB] bg-[#FAF7F2] hover:bg-[#EAE2D5] text-[#2C221E] text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
            title="Share journey link"
          >
            <Share2 className="w-3.5 h-3.5 text-[#6B5E55]" />
            <span className="hidden md:inline">Share</span>
          </button>

          <button
            onClick={() => onCopyTrip(trip)}
            id={`copy-trip-btn-${trip.id}`}
            className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl border border-[#D9CBBA] bg-white hover:bg-[#F5F1E8] text-[#2C221E] text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs hover:-translate-y-0.5 active:translate-y-0"
          >
            <Copy className="w-3.5 h-3.5 text-[#964223]" />
            <span>Copy Trip</span>
          </button>

          <button
            onClick={() => onViewJourney(trip)}
            id={`view-journey-btn-${trip.id}`}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl btn-glass-primary text-xs font-bold shadow-xs cursor-pointer flex items-center justify-center gap-1.5 hover:-translate-y-0.5 active:translate-y-0 transition-all"
          >
            <span>View Journey</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </article>
  );
};
