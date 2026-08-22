import React, { useState } from 'react';
import { UserAnalyticsItem, UserBehaviorMetrics, TrendDataPoint, AdminFilters } from '../../types/adminAnalytics';
import { AnalyticsKpiCard } from './AnalyticsKpiCard';
import { UserGrowthChart } from './UserGrowthChart';
import { 
  Users, 
  UserCheck, 
  Luggage, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  User, 
  Compass, 
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface UserTrendsTabProps {
  users: UserAnalyticsItem[];
  metrics: UserBehaviorMetrics;
  trendPoints: TrendDataPoint[];
  filters: AdminFilters;
}

export const UserTrendsTab: React.FC<UserTrendsTabProps> = ({
  users,
  metrics,
  trendPoints,
  filters
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Filter users
  let filtered = users.filter(user => {
    const matchesSearch = 
      !filters.search ||
      user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.email.toLowerCase().includes(filters.search.toLowerCase()) ||
      (user.homeCity && user.homeCity.toLowerCase().includes(filters.search.toLowerCase()));

    const matchesStatus = 
      filters.statusFilter === 'all' || 
      user.status === filters.statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Sort users
  filtered = [...filtered].sort((a, b) => {
    switch (filters.sortBy) {
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'most_trips':
        return b.tripsCount - a.tripsCount;
      case 'most_activities':
        return b.activitiesCount - a.activitiesCount;
      case 'newest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedUsers = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="space-y-1">
        <h2 className="font-serif-heading text-2xl font-bold text-[#2C221E]">User Trends & Analytics</h2>
        <p className="text-xs sm:text-sm text-[#6B5E55]">
          Understand traveler onboarding velocity, active planner engagement, and multi-city itinerary behavior.
        </p>
      </div>

      {/* User Behavior KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <AnalyticsKpiCard
          label="Registered Travelers"
          value={metrics.totalUsers}
          description="Platform travel accounts"
          icon={Users}
          iconBgColor="bg-[#F0EAE1]"
          iconColor="text-[#964223]"
        />
        <AnalyticsKpiCard
          label="Active Planners"
          value={metrics.activePlanners}
          description="Users with created itineraries"
          icon={UserCheck}
          iconBgColor="bg-[#EBE7DF]"
          iconColor="text-[#4A6B70]"
        />
        <AnalyticsKpiCard
          label="Avg Trips / Traveler"
          value={metrics.avgTripsPerUser}
          description="Journeys initiated per account"
          icon={Luggage}
          iconBgColor="bg-[#E8EFE9]"
          iconColor="text-[#3F6E54]"
        />
        <AnalyticsKpiCard
          label="Avg Stops / Trip"
          value={metrics.avgStopsPerTrip}
          description={`${metrics.tripsWithMultipleCitiesRatio}% multi-destination journeys`}
          icon={Compass}
          iconBgColor="bg-[#F9F0EA]"
          iconColor="text-[#D97706]"
        />
      </div>

      {/* Growth Chart & Behavior Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UserGrowthChart data={trendPoints} />

        {/* Planning Engagement Card */}
        <div className="editorial-card p-5 space-y-4 flex flex-col justify-between">
          <div className="pb-2 border-b border-[#F0EAE1]">
            <h3 className="font-serif-heading text-base font-bold text-[#2C221E]">Itinerary Planning Depth</h3>
            <p className="text-xs text-[#8F8175]">Behavioral metrics calculated across scheduled stops</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-[#F9F6F0] rounded-xl border border-[#EAE2D5]">
              <div>
                <p className="text-xs font-bold text-[#2C221E]">Average Activities per Trip</p>
                <p className="text-[10px] text-[#8F8175]">Scheduled experiences per journey</p>
              </div>
              <span className="font-serif-heading text-xl font-bold text-[#964223]">
                {metrics.avgActivitiesPerTrip}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-[#F9F6F0] rounded-xl border border-[#EAE2D5]">
              <div>
                <p className="text-xs font-bold text-[#2C221E]">Average Journey Duration</p>
                <p className="text-[10px] text-[#8F8175]">Calculated between arrival & departure</p>
              </div>
              <span className="font-serif-heading text-xl font-bold text-[#4A6B70]">
                {metrics.avgTripDurationDays} days
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-[#F9F6F0] rounded-xl border border-[#EAE2D5]">
              <div>
                <p className="text-xs font-bold text-[#2C221E]">Multi-City Circuit Rate</p>
                <p className="text-[10px] text-[#8F8175]">Trips featuring 2 or more cities</p>
              </div>
              <span className="font-serif-heading text-xl font-bold text-[#3F6E54]">
                {metrics.tripsWithMultipleCitiesRatio}%
              </span>
            </div>
          </div>

          <p className="text-[11px] text-[#8F8175] pt-1">
            Real data aggregated from active traveler sessions.
          </p>
        </div>
      </div>

      {/* Registered Travelers Table */}
      <div className="editorial-card overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#EAE2D5] flex items-center justify-between">
          <div>
            <h3 className="font-serif-heading text-base font-bold text-[#2C221E]">
              Registered Travelers Directory ({filtered.length})
            </h3>
            <p className="text-[11px] text-[#8F8175]">
              Read-only administrative directory of platform accounts
            </p>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#8F8175]">
            No travelers matching "{filters.search}".
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#2C221E]">
              <thead className="bg-[#F0EAE1]/70 text-[10px] font-bold uppercase tracking-wider text-[#6B5E55] border-b border-[#EAE2D5]">
                <tr>
                  <th className="py-3 px-4">Traveler</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Home City</th>
                  <th className="py-3 px-4 text-right">Trips Created</th>
                  <th className="py-3 px-4 text-right">Activities</th>
                  <th className="py-3 px-4 text-right">Member Since</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EAE1]">
                {paginatedUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-white/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#E0D4C3] border border-[#C8B8A2] flex items-center justify-center font-bold text-xs text-[#2C221E]">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-[#2C221E]">{u.name}</p>
                          <p className="text-[11px] text-[#8F8175]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {u.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#964223]/10 text-[#964223] font-bold text-[10px] uppercase border border-[#964223]/20">
                          <ShieldCheck className="w-3 h-3" />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-md bg-[#F0EAE1] text-[#6B5E55] font-semibold text-[10px] uppercase border border-[#E3D9CB]">
                          Traveler
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#6B5E55]">
                      {u.homeCity || 'San Francisco, CA'}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-[#2C221E]">
                      {u.tripsCount}
                    </td>
                    <td className="py-3 px-4 text-right text-[#6B5E55]">
                      {u.activitiesCount}
                    </td>
                    <td className="py-3 px-4 text-right text-[#6B5E55]">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.status === 'active' 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {u.status === 'active' ? 'Active Planner' : 'New Member'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-3 bg-[#F9F6F0] border-t border-[#EAE2D5] flex items-center justify-between text-xs">
            <span className="text-[#8F8175]">
              Showing page {currentPage} of {totalPages} ({filtered.length} travelers)
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-[#EAE2D5] bg-white hover:bg-[#F0EAE1] disabled:opacity-40 cursor-pointer"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4 text-[#6B5E55]" />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-[#EAE2D5] bg-white hover:bg-[#F0EAE1] disabled:opacity-40 cursor-pointer"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4 text-[#6B5E55]" />
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
