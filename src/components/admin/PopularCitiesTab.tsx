import React from 'react';
import { CityAnalyticsItem, AdminFilters } from '../../types/adminAnalytics';
import { PopularCitiesChart } from './PopularCitiesChart';
import { MapPin, Navigation, Compass, ArrowUpDown, Calendar, Sparkles } from 'lucide-react';

interface PopularCitiesTabProps {
  cities: CityAnalyticsItem[];
  filters: AdminFilters;
}

export const PopularCitiesTab: React.FC<PopularCitiesTabProps> = ({
  cities,
  filters
}) => {
  // Apply search & country filters
  let filtered = cities.filter(city => {
    const matchesSearch = 
      !filters.search ||
      city.cityName.toLowerCase().includes(filters.search.toLowerCase()) ||
      city.country.toLowerCase().includes(filters.search.toLowerCase()) ||
      (city.region && city.region.toLowerCase().includes(filters.search.toLowerCase()));

    const matchesCountry = 
      filters.countryFilter === 'all' || 
      city.country.toLowerCase() === filters.countryFilter.toLowerCase();

    return matchesSearch && matchesCountry;
  });

  // Apply sorting
  filtered = [...filtered].sort((a, b) => {
    switch (filters.sortBy) {
      case 'least_used':
        return a.tripAppearances - b.tripAppearances;
      case 'name_asc':
        return a.cityName.localeCompare(b.cityName);
      case 'days_desc':
        return b.averageDaysStayed - a.averageDaysStayed;
      case 'most_used':
      default:
        return b.tripAppearances - a.tripAppearances;
    }
  });

  // Optional Group By Country
  const isGroupedByCountry = filters.groupBy === 'country';
  const countryGroups = new Map<string, CityAnalyticsItem[]>();
  if (isGroupedByCountry) {
    for (const c of filtered) {
      const group = countryGroups.get(c.country) || [];
      group.push(c);
      countryGroups.set(c.country, group);
    }
  }

  if (cities.length === 0) {
    return (
      <div className="editorial-card p-10 text-center space-y-3">
        <MapPin className="w-10 h-10 text-[#8F8175]/50 mx-auto" />
        <h3 className="font-serif-heading text-xl font-bold text-[#2C221E]">No city analytics yet</h3>
        <p className="text-xs text-[#6B5E55] max-w-md mx-auto">
          Destinations will be indexed and ranked automatically as travelers add city stops to their journeys.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Section Header */}
      <div className="space-y-1">
        <h2 className="font-serif-heading text-2xl font-bold text-[#2C221E]">Popular Cities</h2>
        <p className="text-xs sm:text-sm text-[#6B5E55]">
          See which destinations are attracting the most travel plans and multi-city stops.
        </p>
      </div>

      {/* Top 10 Destinations Chart */}
      <PopularCitiesChart 
        cities={filtered} 
        limit={10} 
        showViewAllButton={false} 
      />

      {/* Ranked City Table */}
      <div className="editorial-card overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#EAE2D5] flex items-center justify-between">
          <div>
            <h3 className="font-serif-heading text-base font-bold text-[#2C221E]">
              Destination Directory ({filtered.length})
            </h3>
            <p className="text-[11px] text-[#8F8175]">
              Real-time platform stop counts and duration metrics
            </p>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#8F8175]">
            No destinations matching "{filters.search}" or selected filters.
          </div>
        ) : isGroupedByCountry ? (
          /* Grouped View */
          <div className="p-4 space-y-6">
            {Array.from(countryGroups.entries()).map(([country, cityList]) => (
              <div key={country} className="space-y-2">
                <div className="flex items-center gap-2 pb-1 border-b border-[#F0EAE1]">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#964223]">{country}</span>
                  <span className="text-[10px] text-[#8F8175]">({cityList.length} cities)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {cityList.map(c => (
                    <div key={c.id} className="p-3 bg-[#F9F6F0] rounded-xl border border-[#EAE2D5] flex items-center justify-between">
                      <div>
                        <p className="font-bold text-xs text-[#2C221E]">{c.cityName}</p>
                        <p className="text-[10px] text-[#8F8175]">{c.averageDaysStayed} days avg stay</p>
                      </div>
                      <span className="font-bold text-xs text-[#964223]">{c.tripAppearances} trips</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Standard Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#2C221E]">
              <thead className="bg-[#F0EAE1]/70 text-[10px] font-bold uppercase tracking-wider text-[#6B5E55] border-b border-[#EAE2D5]">
                <tr>
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Destination</th>
                  <th className="py-3 px-4">Country & Region</th>
                  <th className="py-3 px-4 text-right">Trip Count</th>
                  <th className="py-3 px-4 text-right">Unique Planners</th>
                  <th className="py-3 px-4 text-right">Platform Share</th>
                  <th className="py-3 px-4 text-right">Avg Stay</th>
                  <th className="py-3 px-4 text-right">Activities</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EAE1]">
                {filtered.map((city, index) => (
                  <tr key={city.id} className="hover:bg-white/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-[#8F8175]">
                      #{index + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-[#F0EAE1] text-[#964223] flex items-center justify-center font-bold text-[10px]">
                          {city.cityName.charAt(0)}
                        </div>
                        <span className="font-bold text-[#2C221E]">{city.cityName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[#6B5E55]">{city.country}</span>
                      {city.region && (
                        <span className="text-[#8F8175] text-[11px] block">{city.region}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-[#2C221E]">
                      {city.tripAppearances}
                    </td>
                    <td className="py-3 px-4 text-right text-[#6B5E55]">
                      {city.uniqueTravelers}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-block px-2 py-0.5 rounded-full bg-[#EAE2D5] font-bold text-[10px] text-[#2C221E]">
                        {city.percentageOfTrips}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-[#6B5E55]">
                      {city.averageDaysStayed} days
                    </td>
                    <td className="py-3 px-4 text-right text-[#6B5E55]">
                      {city.totalActivitiesInCity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  );
};
