import React from 'react';
import { ActivityAnalyticsItem, AdminFilters } from '../../types/adminAnalytics';
import { PopularActivitiesChart } from './PopularActivitiesChart';
import { Sparkles, DollarSign, Clock, MapPin, Tag } from 'lucide-react';
import { ActivityCategory } from '../../types';

interface PopularActivitiesTabProps {
  activities: ActivityAnalyticsItem[];
  filters: AdminFilters;
}

export const PopularActivitiesTab: React.FC<PopularActivitiesTabProps> = ({
  activities,
  filters
}) => {
  const getCategoryBadge = (category: ActivityCategory) => {
    switch (category) {
      case 'dining':
        return { label: 'Dining', bg: 'bg-amber-100/80 text-amber-900 border-amber-200' };
      case 'transport':
        return { label: 'Transit', bg: 'bg-sky-100/80 text-sky-900 border-sky-200' };
      case 'leisure':
        return { label: 'Leisure', bg: 'bg-emerald-100/80 text-emerald-900 border-emerald-200' };
      case 'lodging':
        return { label: 'Lodging', bg: 'bg-purple-100/80 text-purple-900 border-purple-200' };
      case 'sightseeing':
      default:
        return { label: 'Sightseeing', bg: 'bg-[#F0EAE1] text-[#964223] border-[#E3D9CB]' };
    }
  };

  // Filter activities
  let filtered = activities.filter(act => {
    const matchesSearch = 
      !filters.search ||
      act.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      act.cityName.toLowerCase().includes(filters.search.toLowerCase()) ||
      act.category.toLowerCase().includes(filters.search.toLowerCase());

    const matchesCategory = 
      filters.categoryFilter === 'all' || 
      act.category.toLowerCase() === filters.categoryFilter.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  // Sort activities
  filtered = [...filtered].sort((a, b) => {
    switch (filters.sortBy) {
      case 'highest_cost':
        return b.averageCost - a.averageCost;
      case 'lowest_cost':
        return a.averageCost - b.averageCost;
      case 'name_asc':
        return a.title.localeCompare(b.title);
      case 'most_scheduled':
      default:
        return b.timesScheduled - a.timesScheduled;
    }
  });

  // Group by category if selected
  const isGroupedByCategory = filters.groupBy === 'category';
  const categoryGroups = new Map<string, ActivityAnalyticsItem[]>();
  if (isGroupedByCategory) {
    for (const a of filtered) {
      const group = categoryGroups.get(a.category) || [];
      group.push(a);
      categoryGroups.set(a.category, group);
    }
  }

  if (activities.length === 0) {
    return (
      <div className="editorial-card p-10 text-center space-y-3">
        <Sparkles className="w-10 h-10 text-[#8F8175]/50 mx-auto" />
        <h3 className="font-serif-heading text-xl font-bold text-[#2C221E]">No activity analytics yet</h3>
        <p className="text-xs text-[#6B5E55] max-w-md mx-auto">
          Experiences will automatically rank here as travelers schedule activities across their itinerary days.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="space-y-1">
        <h2 className="font-serif-heading text-2xl font-bold text-[#2C221E]">Popular Activities</h2>
        <p className="text-xs sm:text-sm text-[#6B5E55]">
          Discover which experiences and curated tours travelers are adding to their itineraries.
        </p>
      </div>

      {/* Top 10 Chart */}
      <PopularActivitiesChart 
        activities={filtered} 
        limit={10} 
        showViewAllButton={false} 
      />

      {/* Activity Table */}
      <div className="editorial-card overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#EAE2D5] flex items-center justify-between">
          <div>
            <h3 className="font-serif-heading text-base font-bold text-[#2C221E]">
              Activity Index ({filtered.length})
            </h3>
            <p className="text-[11px] text-[#8F8175]">
              Full breakdown of experience usage, costs, and scheduled frequency
            </p>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#8F8175]">
            No experiences matching "{filters.search}" or selected filters.
          </div>
        ) : isGroupedByCategory ? (
          /* Grouped by Category View */
          <div className="p-4 space-y-6">
            {Array.from(categoryGroups.entries()).map(([cat, actList]) => {
              const badge = getCategoryBadge(cat as ActivityCategory);
              return (
                <div key={cat} className="space-y-2">
                  <div className="flex items-center gap-2 pb-1 border-b border-[#F0EAE1]">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${badge.bg}`}>
                      {badge.label}
                    </span>
                    <span className="text-[10px] text-[#8F8175]">({actList.length} experiences)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {actList.map(a => (
                      <div key={a.id} className="p-3 bg-[#F9F6F0] rounded-xl border border-[#EAE2D5] flex flex-col justify-between">
                        <div>
                          <p className="font-bold text-xs text-[#2C221E]">{a.title}</p>
                          <p className="text-[10px] text-[#8F8175] mt-0.5">{a.cityName} • {a.duration || '2 hrs'}</p>
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#EAE2D5]/50">
                          <span className="font-bold text-xs text-[#964223]">${a.averageCost}</span>
                          <span className="text-[11px] font-semibold text-[#6B5E55]">{a.timesScheduled} scheduled</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Standard Activity Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#2C221E]">
              <thead className="bg-[#F0EAE1]/70 text-[10px] font-bold uppercase tracking-wider text-[#6B5E55] border-b border-[#EAE2D5]">
                <tr>
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Experience Title</th>
                  <th className="py-3 px-4">Destination</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Times Scheduled</th>
                  <th className="py-3 px-4 text-right">Average Cost</th>
                  <th className="py-3 px-4 text-right">Est. Duration</th>
                  <th className="py-3 px-4 text-right">Total Planned Spend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EAE1]">
                {filtered.map((act, index) => {
                  const badge = getCategoryBadge(act.category);

                  return (
                    <tr key={act.id} className="hover:bg-white/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-[#8F8175]">
                        #{index + 1}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-[#2C221E]">{act.title}</span>
                      </td>
                      <td className="py-3 px-4 text-[#6B5E55]">
                        {act.cityName}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-[#2C221E]">
                        {act.timesScheduled}
                      </td>
                      <td className="py-3 px-4 text-right text-[#6B5E55]">
                        ${act.averageCost}
                      </td>
                      <td className="py-3 px-4 text-right text-[#6B5E55]">
                        {act.duration || '2 hrs'}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-[#2C221E]">
                        ${act.totalSpendEstimate}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};
