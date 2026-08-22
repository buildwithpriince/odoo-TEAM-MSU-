import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Layers, 
  ArrowUpDown, 
  Calendar, 
  X, 
  Check,
  ChevronDown
} from 'lucide-react';
import { AdminFilters, AdminTab, TimePeriod } from '../../types/adminAnalytics';

interface AdminToolbarProps {
  activeTab: AdminTab;
  filters: AdminFilters;
  onFilterChange: (updated: Partial<AdminFilters>) => void;
  availableCountries?: string[];
  availableCategories?: string[];
}

export const AdminToolbar: React.FC<AdminToolbarProps> = ({
  activeTab,
  filters,
  onFilterChange,
  availableCountries = [],
  availableCategories = []
}) => {
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);

  const timePeriodOptions: { value: TimePeriod; label: string }[] = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '3m', label: 'Last 3 months' },
    { value: '6m', label: 'Last 6 months' },
    { value: '1y', label: 'Last 12 months' },
    { value: 'all', label: 'All time' },
  ];

  const getSearchPlaceholder = () => {
    switch (activeTab) {
      case 'cities':
        return 'Search destinations or countries...';
      case 'activities':
        return 'Search activities or categories...';
      case 'users':
        return 'Search travelers or emails...';
      default:
        return 'Search platform analytics...';
    }
  };

  const getGroupByOptions = () => {
    switch (activeTab) {
      case 'cities':
        return [
          { value: 'country', label: 'Group by Country' },
          { value: 'none', label: 'No Grouping' }
        ];
      case 'activities':
        return [
          { value: 'category', label: 'Group by Category' },
          { value: 'city', label: 'Group by City' },
          { value: 'none', label: 'No Grouping' }
        ];
      case 'users':
        return [
          { value: 'role', label: 'Group by Role' },
          { value: 'activity', label: 'Group by Activity' },
          { value: 'none', label: 'No Grouping' }
        ];
      default:
        return [
          { value: 'status', label: 'Group by Status' },
          { value: 'time', label: 'Group by Timeline' },
          { value: 'none', label: 'Default Overview' }
        ];
    }
  };

  const getSortOptions = () => {
    switch (activeTab) {
      case 'cities':
        return [
          { value: 'most_used', label: 'Most Used in Trips' },
          { value: 'least_used', label: 'Least Used' },
          { value: 'name_asc', label: 'City Name (A-Z)' },
          { value: 'days_desc', label: 'Longest Avg Stay' }
        ];
      case 'activities':
        return [
          { value: 'most_scheduled', label: 'Most Scheduled' },
          { value: 'highest_cost', label: 'Highest Cost' },
          { value: 'lowest_cost', label: 'Lowest Cost' },
          { value: 'name_asc', label: 'Activity Name (A-Z)' }
        ];
      case 'users':
        return [
          { value: 'newest', label: 'Joined Newest First' },
          { value: 'oldest', label: 'Joined Oldest First' },
          { value: 'most_trips', label: 'Most Trips Created' },
          { value: 'most_activities', label: 'Most Activities' }
        ];
      default:
        return [
          { value: 'default', label: 'Default Priority' },
          { value: 'highest_budget', label: 'Highest Budget' },
          { value: 'newest', label: 'Recent First' }
        ];
    }
  };

  const hasActiveFilters = 
    filters.countryFilter !== 'all' || 
    filters.categoryFilter !== 'all' || 
    filters.statusFilter !== 'all' ||
    filters.search.trim().length > 0;

  const resetFilters = () => {
    onFilterChange({
      search: '',
      countryFilter: 'all',
      categoryFilter: 'all',
      statusFilter: 'all'
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8F8175]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            id="admin-search-input"
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder={getSearchPlaceholder()}
            className="w-full pl-10 pr-10 py-2.5 bg-white/70 hover:bg-white focus:bg-white rounded-xl border border-[#EAE2D5] focus:border-[#964223] text-xs font-medium text-[#2C221E] placeholder:text-[#8F8175] transition-all focus:outline-hidden shadow-xs"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ search: '' })}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8F8175] hover:text-[#2C221E]"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Action Controls Cluster */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Time Period Filter */}
          <div className="relative flex items-center">
            <select
              id="admin-time-period-select"
              value={filters.timePeriod}
              onChange={(e) => onFilterChange({ timePeriod: e.target.value as TimePeriod })}
              aria-label="Select analytics time range"
              className="appearance-none bg-white/70 hover:bg-white border border-[#EAE2D5] text-[#2C221E] text-xs font-bold pl-8 pr-8 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs focus:outline-hidden focus:border-[#964223]"
            >
              {timePeriodOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <Calendar className="w-3.5 h-3.5 text-[#964223] absolute left-3 pointer-events-none" />
            <ChevronDown className="w-3.5 h-3.5 text-[#8F8175] absolute right-3 pointer-events-none" />
          </div>

          {/* Group By Selector */}
          <div className="relative flex items-center">
            <select
              id="admin-group-by-select"
              value={filters.groupBy}
              onChange={(e) => onFilterChange({ groupBy: e.target.value })}
              aria-label="Group analytics by attribute"
              className="appearance-none bg-white/70 hover:bg-white border border-[#EAE2D5] text-[#2C221E] text-xs font-bold pl-8 pr-8 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs focus:outline-hidden focus:border-[#964223]"
            >
              {getGroupByOptions().map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <Layers className="w-3.5 h-3.5 text-[#4A6B70] absolute left-3 pointer-events-none" />
            <ChevronDown className="w-3.5 h-3.5 text-[#8F8175] absolute right-3 pointer-events-none" />
          </div>

          {/* Sort By Selector */}
          <div className="relative flex items-center">
            <select
              id="admin-sort-by-select"
              value={filters.sortBy}
              onChange={(e) => onFilterChange({ sortBy: e.target.value })}
              aria-label="Sort analytics list"
              className="appearance-none bg-white/70 hover:bg-white border border-[#EAE2D5] text-[#2C221E] text-xs font-bold pl-8 pr-8 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs focus:outline-hidden focus:border-[#964223]"
            >
              {getSortOptions().map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-[#8F8175] absolute left-3 pointer-events-none" />
            <ChevronDown className="w-3.5 h-3.5 text-[#8F8175] absolute right-3 pointer-events-none" />
          </div>

          {/* Contextual Filter Popover Button */}
          <div className="relative">
            <button
              onClick={() => setFilterPopoverOpen(!filterPopoverOpen)}
              id="admin-filter-toggle-btn"
              aria-label="Open detailed filters"
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

            {/* Filter Popover Dropdown */}
            {filterPopoverOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#EAE2D5] p-4 z-50 space-y-4 animate-in fade-in-50 zoom-in-95">
                <div className="flex items-center justify-between pb-2 border-b border-[#F0EAE1]">
                  <span className="text-xs font-bold text-[#2C221E]">Refine Analytics</span>
                  {hasActiveFilters && (
                    <button
                      onClick={resetFilters}
                      className="text-[11px] font-semibold text-[#964223] hover:underline"
                    >
                      Reset All
                    </button>
                  )}
                </div>

                {/* Country Filter for Cities */}
                {(activeTab === 'cities' || activeTab === 'overview') && availableCountries.length > 0 && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#8F8175]">
                      Country / Territory
                    </label>
                    <select
                      value={filters.countryFilter}
                      onChange={(e) => onFilterChange({ countryFilter: e.target.value })}
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
                )}

                {/* Category Filter for Activities */}
                {(activeTab === 'activities' || activeTab === 'overview') && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#8F8175]">
                      Activity Category
                    </label>
                    <select
                      value={filters.categoryFilter}
                      onChange={(e) => onFilterChange({ categoryFilter: e.target.value })}
                      className="w-full p-2 bg-[#F9F6F0] rounded-xl text-xs border border-[#EAE2D5] font-medium text-[#2C221E]"
                    >
                      <option value="all">All Categories</option>
                      <option value="sightseeing">Sightseeing</option>
                      <option value="dining">Dining & Culinary</option>
                      <option value="transport">Transport</option>
                      <option value="leisure">Leisure & Wellness</option>
                      <option value="lodging">Lodging</option>
                    </select>
                  </div>
                )}

                {/* Status Filter for Trips / Users */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#8F8175]">
                    Trip Status
                  </label>
                  <select
                    value={filters.statusFilter}
                    onChange={(e) => onFilterChange({ statusFilter: e.target.value })}
                    className="w-full p-2 bg-[#F9F6F0] rounded-xl text-xs border border-[#EAE2D5] font-medium text-[#2C221E]"
                  >
                    <option value="all">All Statuses</option>
                    <option value="planning">In Planning</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setFilterPopoverOpen(false)}
                    className="px-3 py-1.5 rounded-xl bg-[#964223] text-white text-xs font-bold shadow-xs hover:bg-[#7D351B]"
                  >
                    Done
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
              <button onClick={() => onFilterChange({ search: '' })} className="hover:text-rose-600">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.countryFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EAE2D5] text-[#2C221E] text-[11px] font-semibold">
              Country: {filters.countryFilter}
              <button onClick={() => onFilterChange({ countryFilter: 'all' })} className="hover:text-rose-600">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.categoryFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EAE2D5] text-[#2C221E] text-[11px] font-semibold capitalize">
              Category: {filters.categoryFilter}
              <button onClick={() => onFilterChange({ categoryFilter: 'all' })} className="hover:text-rose-600">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.statusFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EAE2D5] text-[#2C221E] text-[11px] font-semibold capitalize">
              Status: {filters.statusFilter}
              <button onClick={() => onFilterChange({ statusFilter: 'all' })} className="hover:text-rose-600">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            onClick={resetFilters}
            className="text-[11px] text-[#964223] font-bold hover:underline ml-1"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};
