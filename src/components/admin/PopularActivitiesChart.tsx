import React from 'react';
import { ActivityAnalyticsItem } from '../../types/adminAnalytics';
import { Sparkles, ArrowRight, Utensils, Compass, Plane, Coffee, Building } from 'lucide-react';
import { ActivityCategory } from '../../types';

interface PopularActivitiesChartProps {
  activities: ActivityAnalyticsItem[];
  limit?: number;
  onViewAll?: () => void;
  showViewAllButton?: boolean;
}

export const PopularActivitiesChart: React.FC<PopularActivitiesChartProps> = ({
  activities,
  limit = 5,
  onViewAll,
  showViewAllButton = true
}) => {
  const displayActivities = activities.slice(0, limit);
  const maxScheduled = Math.max(...activities.map(a => a.timesScheduled), 1);

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

  if (!activities || activities.length === 0) {
    return (
      <div className="editorial-card p-6 flex flex-col items-center justify-center min-h-[300px] text-center">
        <Sparkles className="w-8 h-8 text-[#8F8175]/50 mb-2" />
        <h3 className="font-serif-heading font-bold text-[#2C221E] text-base">No activity records</h3>
        <p className="text-xs text-[#8F8175] max-w-xs mt-1">
          Experiences will populate as travelers build day-by-day itineraries.
        </p>
      </div>
    );
  }

  return (
    <div className="editorial-card p-5 sm:p-6 space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#F0EAE1]">
        <div>
          <h2 className="font-serif-heading text-lg font-bold text-[#2C221E]">Popular Experiences</h2>
          <p className="text-xs text-[#8F8175] mt-0.5">Most scheduled activities across travel plans</p>
        </div>

        {showViewAllButton && onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs font-bold text-[#964223] hover:text-[#7D351B] flex items-center gap-1 cursor-pointer"
          >
            <span>Full List</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Activity List */}
      <div className="space-y-3.5">
        {displayActivities.map((act, idx) => {
          const badge = getCategoryBadge(act.category);
          const barWidth = Math.max(8, (act.timesScheduled / maxScheduled) * 100);

          return (
            <div key={act.id} className="space-y-1.5 group">
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2 max-w-[65%] sm:max-w-[70%]">
                  <span className="w-5 text-[11px] font-bold text-[#8F8175] shrink-0">
                    #{idx + 1}
                  </span>
                  <span className="font-bold text-[#2C221E] group-hover:text-[#964223] transition-colors truncate" title={act.title}>
                    {act.title}
                  </span>
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md border shrink-0 ${badge.bg}`}>
                    {badge.label}
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] text-[#8F8175]">
                    ${act.averageCost} avg
                  </span>
                  <span className="font-bold text-[#2C221E] min-w-[3.5rem] text-right">
                    {act.timesScheduled} {act.timesScheduled === 1 ? 'use' : 'uses'}
                  </span>
                </div>
              </div>

              {/* Progress Bar Container */}
              <div className="w-full h-2.5 bg-[#F0EAE1] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#4A6B70] to-[#68949B] transition-all duration-500 group-hover:brightness-110"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-[#F0EAE1] flex items-center justify-between text-[11px] text-[#8F8175]">
        <span>Aggregated across {activities.length} itinerary activities</span>
        <span>Ranked by frequency</span>
      </div>

    </div>
  );
};
