import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Sparkles, Plus, Search, RotateCcw } from 'lucide-react';

interface CommunityEmptyStateProps {
  isFiltered?: boolean;
  onResetFilters?: () => void;
}

export const CommunityEmptyState: React.FC<CommunityEmptyStateProps> = ({
  isFiltered = false,
  onResetFilters
}) => {
  return (
    <div className="editorial-card p-10 sm:p-14 text-center space-y-5 max-w-xl mx-auto my-6 shadow-xs animate-in fade-in duration-200">
      <div className="w-16 h-16 rounded-3xl bg-[#F0EAE1] text-[#964223] flex items-center justify-center mx-auto shadow-xs">
        {isFiltered ? (
          <Search className="w-7 h-7" />
        ) : (
          <Compass className="w-7 h-7" />
        )}
      </div>

      <div className="space-y-2">
        <h3 className="font-serif-heading text-xl sm:text-2xl font-bold text-[#2C221E]">
          {isFiltered ? 'No matching journeys found' : 'No journeys shared yet'}
        </h3>
        <p className="text-xs sm:text-sm text-[#6B5E55] max-w-md mx-auto leading-relaxed">
          {isFiltered
            ? 'Try adjusting your destination keywords, travel style, or duration filters to explore other shared trips.'
            : 'Be the first traveler to share your multi-city itinerary with the GlobeTrotter community and inspire others.'}
        </p>
      </div>

      <div className="pt-2 flex flex-wrap justify-center gap-3">
        {isFiltered && onResetFilters ? (
          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#964223] text-white text-xs font-bold shadow-xs hover:bg-[#7D351B] transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Search & Filters</span>
          </button>
        ) : (
          <Link
            to="/trips/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl btn-glass-primary text-xs font-bold shadow-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Plan & Share a Journey</span>
          </Link>
        )}
      </div>
    </div>
  );
};
