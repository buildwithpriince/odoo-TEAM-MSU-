import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Layers, 
  ArrowUpDown, 
  X, 
  ChevronDown,
  Compass,
  MapPin,
  Clock,
  DollarSign
} from 'lucide-react';
import { 
  CommunityFilters, 
  CommunityGroupBy, 
  CommunitySortBy 
} from '../../types/community';

interface CommunityToolbarProps {
  filters: CommunityFilters;
  onFilterChange: (updated: Partial<CommunityFilters>) => void;
  availableCountries?: string[];
  availableVibes?: string[];
}

export const CommunityToolbar: React.FC<CommunityToolbarProps> = ({
  filters,
  onFilterChange,
  availableCountries = [],
  availableVibes = []
}) => {
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(filters.search);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({ search: localSearch });
    }, 280);
    return () => clearTimeout(timer);
  }, [localSearch]);

  const hasActiveFilters = 
    filters.country !== 'all' || 
    filters.travelVibe !== 'all' || 
    filters.durationRange !== 'all' ||
    filters.budgetRange !== 'all' ||
    filters.search.trim().length > 0;

  const resetFilters = () => {
    setLocalSearch('');
    onFilterChange({
      search: '',
      country: 'all',
      travelVibe: 'all',
      durationRange: 'all',
      budgetRange: 'all'
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        
        {/* Search Bar */}
        <div className="relative flex-1 max-w-lg">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8F8175]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            id="community-search-input"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search journeys, destinations, activities, travelers..."
            className="w-full pl-10 pr-10 py-2.5 bg-white/70 hover:bg-white focus:bg-white rounded-xl border border-[#EAE2D5] focus:border-[#964223] text-xs font-medium text-[#2C221E] placeholder:text-[#8F8175] transition-all focus:outline-hidden shadow-xs"
          />
          {localSearch && (
            <button
              onClick={() => {
                setLocalSearch('');
                onFilterChange({ search: '' });
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8F8175] hover:text-[#2C221E]"
              aria-label="Clear search query"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Group By Selector */}
          <div className="relative flex items-center">
            <select
              id="community-group-by-select"
              value={filters.groupBy}
              onChange={(e) => onFilterChange({ groupBy: e.target.value as CommunityGroupBy })}
              aria-label="Group journeys by attribute"
              className="appearance-none bg-white/70 hover:bg-white border border-[#EAE2D5] text-[#2C221E] text-xs font-bold pl-8 pr-8 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs focus:outline-hidden focus:border-[#964223]"
            >
              <option value="none">No Grouping</option>
              <option value="destination">Group by Destination</option>
              <option value="country">Group by Country</option>
              <option value="vibe">Group by Travel Style</option>
            </select>
            <Layers className="w-3.5 h-3.5 text-[#4A6B70] absolute left-3 pointer-events-none" />
            <ChevronDown className="w-3.5 h-3.5 text-[#8F8175] absolute right-3 pointer-events-none" />
          </div>

          {/* Sort By Selector */}
          <div className="relative flex items-center">
            <select
              id="community-sort-by-select"
              value={filters.sortBy}
              onChange={(e) => onFilterChange({ sortBy: e.target.value as CommunitySortBy })}
              aria-label="Sort shared journeys"
              className="appearance-none bg-white/70 hover:bg-white border border-[#EAE2D5] text-[#2C221E] text-xs font-bold pl-8 pr-8 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs focus:outline-hidden focus:border-[#964223]"
            >
              <option value="recent">Most Recent</option>
              <option value="longest">Longest Journey</option>
              <option value="shortest">Shortest Journey</option>
              <option value="lowest_budget">Lowest Budget</option>
              <option value="highest_budget">Highest Budget</option>
              <option value="name_asc">Journey Title (A-Z)</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-[#8F8175] absolute left-3 pointer-events-none" />
            <ChevronDown className="w-3.5 h-3.5 text-[#8F8175] absolute right-3 pointer-events-none" />
          </div>

          {/* Filter Popover Button */}
          <div className="relative">
            <button
              onClick={() => setFilterPopoverOpen(!filterPopoverOpen)}
              id="community-filter-toggle-btn"
              aria-label="Open journey filters"
              className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-xs ${
                hasActiveFilters
                  ? 'bg-[#964223] text-white border-[#964223]'
                  : 'bg-white/70 hover:bg-white text-[#2C221E] border-[#EAE2D5]'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filter</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-amber-300" />
              )}
            </button>

            {/* Filter Popover Menu */}
            {filterPopoverOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#EAE2D5] p-4 z-50 space-y-4 animate-in fade-in-50 zoom-in-95">
                <div className="flex items-center justify-between pb-2 border-b border-[#F0EAE1]">
                  <span className="text-xs font-bold text-[#2C221E]">Filter Shared Journeys</span>
                  {hasActiveFilters && (
                    <button
                      onClick={resetFilters}
                      className="text-[11px] font-semibold text-[#964223] hover:underline cursor-pointer"
                    >
                      Reset All
                    </button>
                  )}
                </div>

                {/* Country Filter */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#8F8175]">
                    Country / Region
                  </label>
                  <select
                    value={filters.country}
                    onChange={(e) => onFilterChange({ country: e.target.value })}
                    className="w-full p-2 bg-[#F9F6F0] rounded-xl text-xs border border-[#EAE2D5] font-medium text-[#2C221E]"
                  >
                    <option value="all">All Countries</option>
                    {availableCountries.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Travel Style Filter */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#8F8175]">
                    Travel Style
                  </label>
                  <select
                    value={filters.travelVibe}
                    onChange={(e) => onFilterChange({ travelVibe: e.target.value })}
                    className="w-full p-2 bg-[#F9F6F0] rounded-xl text-xs border border-[#EAE2D5] font-medium text-[#2C221E]"
                  >
                    <option value="all">All Travel Styles</option>
                    <option value="Royal Heritage">Royal Heritage & Art</option>
                    <option value="Culture & Tranquility">Culture & Tranquility</option>
                    <option value="Pine Whispers">Pine Whispers & Peaks</option>
                    <option value="Coastal Bliss">Coastal Bliss & Heritage</option>
                  </select>
                </div>

                {/* Duration Filter */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#8F8175]">
                    Trip Duration
                  </label>
                  <select
                    value={filters.durationRange}
                    onChange={(e) => onFilterChange({ durationRange: e.target.value as any })}
                    className="w-full p-2 bg-[#F9F6F0] rounded-xl text-xs border border-[#EAE2D5] font-medium text-[#2C221E]"
                  >
                    <option value="all">Any Duration</option>
                    <option value="1-5">Short Getaway (1–5 Days)</option>
                    <option value="6-10">Signature Journey (6–10 Days)</option>
                    <option value="11+">Grand Expedition (11+ Days)</option>
                  </select>
                </div>

                {/* Budget Filter */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#8F8175]">
                    Budget Range
                  </label>
                  <select
                    value={filters.budgetRange}
                    onChange={(e) => onFilterChange({ budgetRange: e.target.value as any })}
                    className="w-full p-2 bg-[#F9F6F0] rounded-xl text-xs border border-[#EAE2D5] font-medium text-[#2C221E]"
                  >
                    <option value="all">Any Budget</option>
                    <option value="under-1500">Under $1,500</option>
                    <option value="1500-3000">$1,500 – $3,000</option>
                    <option value="3000+">$3,000+</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setFilterPopoverOpen(false)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#964223] text-white text-xs font-bold shadow-xs hover:bg-[#7D351B] cursor-pointer"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-[#8F8175] font-medium mr-1">Active filters:</span>
          {filters.search && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EAE2D5] text-[#2C221E] text-[11px] font-semibold">
              Search: "{filters.search}"
              <button onClick={() => { setLocalSearch(''); onFilterChange({ search: '' }); }} className="hover:text-rose-600">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.country !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EAE2D5] text-[#2C221E] text-[11px] font-semibold">
              Country: {filters.country}
              <button onClick={() => onFilterChange({ country: 'all' })} className="hover:text-rose-600">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.travelVibe !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EAE2D5] text-[#2C221E] text-[11px] font-semibold">
              Style: {filters.travelVibe}
              <button onClick={() => onFilterChange({ travelVibe: 'all' })} className="hover:text-rose-600">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.durationRange !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EAE2D5] text-[#2C221E] text-[11px] font-semibold">
              Duration: {filters.durationRange} days
              <button onClick={() => onFilterChange({ durationRange: 'all' })} className="hover:text-rose-600">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.budgetRange !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EAE2D5] text-[#2C221E] text-[11px] font-semibold">
              Budget: {filters.budgetRange}
              <button onClick={() => onFilterChange({ budgetRange: 'all' })} className="hover:text-rose-600">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            onClick={resetFilters}
            className="text-[11px] text-[#964223] font-bold hover:underline ml-1 cursor-pointer"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};
