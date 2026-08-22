import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Globe, Plus, Sparkles, Compass } from 'lucide-react';

interface CommunityHeaderProps {
  totalTrips: number;
  totalDestinations: number;
}

export const CommunityHeader: React.FC<CommunityHeaderProps> = ({
  totalTrips,
  totalDestinations
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[#EAE2D5]">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#964223]/10 text-[#964223] border border-[#964223]/20">
            <Users className="w-3 h-3" />
            COMMUNITY
          </span>
          <span className="text-xs text-[#8F8175] flex items-center gap-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            {totalTrips} Shared {totalTrips === 1 ? 'Journey' : 'Journeys'} Across {totalDestinations} Destinations
          </span>
        </div>

        <h1 className="font-serif-heading text-3xl sm:text-4xl font-bold text-[#2C221E] tracking-tight">
          Travel Together
        </h1>

        <p className="text-xs sm:text-sm text-[#6B5E55] max-w-2xl">
          Discover real journeys, hidden gems, and travel ideas shared by fellow travelers around the world.
        </p>
      </div>

      <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
        <Link
          to="/trips"
          id="community-share-journey-btn"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl btn-glass-primary text-xs font-bold shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Share Your Journey</span>
        </Link>
      </div>
    </div>
  );
};
