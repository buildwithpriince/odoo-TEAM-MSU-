import React from 'react';
import { CityAnalyticsItem } from '../../types/adminAnalytics';
import { MapPin, Navigation, ArrowRight } from 'lucide-react';

interface PopularCitiesChartProps {
  cities: CityAnalyticsItem[];
  limit?: number;
  onViewAll?: () => void;
  showViewAllButton?: boolean;
}

export const PopularCitiesChart: React.FC<PopularCitiesChartProps> = ({
  cities,
  limit = 5,
  onViewAll,
  showViewAllButton = true
}) => {
  const displayCities = cities.slice(0, limit);
  const maxAppearances = Math.max(...cities.map(c => c.tripAppearances), 1);

  if (!cities || cities.length === 0) {
    return (
      <div className="editorial-card p-6 flex flex-col items-center justify-center min-h-[300px] text-center">
        <MapPin className="w-8 h-8 text-[#8F8175]/50 mb-2" />
        <h3 className="font-serif-heading font-bold text-[#2C221E] text-base">No city activity yet</h3>
        <p className="text-xs text-[#8F8175] max-w-xs mt-1">
          Popular destinations will rank here as travelers add stops to their itineraries.
        </p>
      </div>
    );
  }

  return (
    <div className="editorial-card p-5 sm:p-6 space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#F0EAE1]">
        <div>
          <h2 className="font-serif-heading text-lg font-bold text-[#2C221E]">Popular Destinations</h2>
          <p className="text-xs text-[#8F8175] mt-0.5">Top cities featured across user trip stops</p>
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

      {/* Ranked Horizontal Bars */}
      <div className="space-y-3.5">
        {displayCities.map((city, idx) => {
          const barWidth = Math.max(8, (city.tripAppearances / maxAppearances) * 100);

          return (
            <div key={city.id} className="space-y-1.5 group">
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="w-5 text-[11px] font-bold text-[#8F8175]">
                    #{idx + 1}
                  </span>
                  <span className="font-bold text-[#2C221E] group-hover:text-[#964223] transition-colors">
                    {city.cityName}
                  </span>
                  <span className="text-[10px] text-[#8F8175] bg-[#F0EAE1] px-2 py-0.5 rounded-md font-medium">
                    {city.country}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-[#8F8175]">
                    {city.percentageOfTrips}% of trips
                  </span>
                  <span className="font-bold text-[#2C221E] min-w-[3.5rem] text-right">
                    {city.tripAppearances} {city.tripAppearances === 1 ? 'trip' : 'trips'}
                  </span>
                </div>
              </div>

              {/* Progress Bar Container */}
              <div className="w-full h-2.5 bg-[#F0EAE1] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#964223] to-[#C85A32] transition-all duration-500 group-hover:brightness-110"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="pt-2 border-t border-[#F0EAE1] flex items-center justify-between text-[11px] text-[#8F8175]">
        <span>Aggregated across {cities.length} unique destinations</span>
        <span>Ranked by frequency</span>
      </div>

    </div>
  );
};
