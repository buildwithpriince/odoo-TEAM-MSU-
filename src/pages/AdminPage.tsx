import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTrip } from '../context/TripContext';
import { 
  AdminOverviewMetrics,
  CityAnalyticsItem,
  ActivityAnalyticsItem,
  UserAnalyticsItem,
  UserBehaviorMetrics,
  TrendDataPoint,
  AdminFilters,
  AdminTab,
  TimePeriod
} from '../types/adminAnalytics';
import {
  filterTripsByPeriod,
  calculateOverviewMetrics,
  calculateTripStatusBreakdown,
  calculatePopularCities,
  calculatePopularActivities,
  calculateTrendPoints,
  calculateUserBehaviorMetrics,
  fetchAdminOverview,
  fetchAdminCities,
  fetchAdminActivities,
  fetchAdminUsers
} from '../services/adminAnalyticsService';
import { AdminHeader } from '../components/admin/AdminHeader';
import { AdminToolbar } from '../components/admin/AdminToolbar';
import { AdminTabs } from '../components/admin/AdminTabs';
import { AnalyticsKpiCard } from '../components/admin/AnalyticsKpiCard';
import { TripTrendChart } from '../components/admin/TripTrendChart';
import { TripStatusChart } from '../components/admin/TripStatusChart';
import { PopularCitiesChart } from '../components/admin/PopularCitiesChart';
import { PopularActivitiesChart } from '../components/admin/PopularActivitiesChart';
import { PopularCitiesTab } from '../components/admin/PopularCitiesTab';
import { PopularActivitiesTab } from '../components/admin/PopularActivitiesTab';
import { UserTrendsTab } from '../components/admin/UserTrendsTab';

import { 
  Users, 
  Luggage, 
  MapPin, 
  Sparkles, 
  Calendar, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  Compass, 
  ShieldAlert, 
  ShieldCheck, 
  ArrowRight,
  RefreshCw,
  AlertCircle,
  LogIn
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { user, isAuthenticated, isAdmin, loginAsAdmin } = useAuth();
  const { trips } = useTrip();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Global filters
  const [filters, setFilters] = useState<AdminFilters>({
    search: '',
    timePeriod: 'all',
    groupBy: 'none',
    countryFilter: 'all',
    categoryFilter: 'all',
    statusFilter: 'all',
    sortBy: 'most_used'
  });

  // State for raw admin records
  const [rawUsers, setRawUsers] = useState<UserAnalyticsItem[]>([]);

  // Load initial data
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (!isAdmin) return;
      try {
        setErrorMsg(null);
        const usersRes = await fetchAdminUsers(trips, user);
        if (isMounted) {
          setRawUsers(usersRes);
          setLastUpdated(new Date());
        }
      } catch (err) {
        if (isMounted) {
          setErrorMsg('Failed to fetch platform analytics.');
        }
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [isAdmin, trips]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setErrorMsg(null);
    try {
      const usersRes = await fetchAdminUsers(trips, user);
      setRawUsers(usersRes);
      setLastUpdated(new Date());
    } catch {
      setErrorMsg('Could not refresh analytics.');
    } finally {
      setTimeout(() => setIsRefreshing(false), 350);
    }
  };

  const handleFilterChange = (updated: Partial<AdminFilters>) => {
    setFilters(prev => ({ ...prev, ...updated }));
  };

  // Derive time-filtered trips
  const timeFilteredTrips = useMemo(() => {
    return filterTripsByPeriod(trips, filters.timePeriod);
  }, [trips, filters.timePeriod]);

  // Derive all analytics from the filtered dataset
  const overviewMetrics: AdminOverviewMetrics = useMemo(() => {
    return calculateOverviewMetrics(timeFilteredTrips, Math.max(rawUsers.length, 1));
  }, [timeFilteredTrips, rawUsers.length]);

  const tripStatusBreakdown = useMemo(() => {
    return calculateTripStatusBreakdown(timeFilteredTrips);
  }, [timeFilteredTrips]);

  const popularCities: CityAnalyticsItem[] = useMemo(() => {
    return calculatePopularCities(timeFilteredTrips);
  }, [timeFilteredTrips]);

  const popularActivities: ActivityAnalyticsItem[] = useMemo(() => {
    return calculatePopularActivities(timeFilteredTrips);
  }, [timeFilteredTrips]);

  const trendDataPoints: TrendDataPoint[] = useMemo(() => {
    return calculateTrendPoints(timeFilteredTrips, rawUsers);
  }, [timeFilteredTrips, rawUsers]);

  const userBehaviorMetrics: UserBehaviorMetrics = useMemo(() => {
    return calculateUserBehaviorMetrics(timeFilteredTrips, rawUsers);
  }, [timeFilteredTrips, rawUsers]);

  const availableCountries = useMemo(() => {
    const set = new Set<string>();
    popularCities.forEach(c => set.add(c.country));
    return Array.from(set).sort();
  }, [popularCities]);

  // If user is not authorized as an administrator
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center py-12 px-4 animate-in fade-in duration-200">
        <div className="editorial-card max-w-md w-full p-8 text-center space-y-6 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto shadow-sm">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
              Access Restricted
            </span>
            <h1 className="font-serif-heading text-2xl font-bold text-[#2C221E]">
              Administrator Privileges Required
            </h1>
            <p className="text-xs text-[#6B5E55] leading-relaxed">
              The GlobeTrotter Admin Console contains protected platform analytics and travel intelligence metrics. Normal traveler accounts cannot view this workspace.
            </p>
          </div>

          <div className="p-3.5 bg-[#F9F6F0] rounded-xl border border-[#EAE2D5] text-left text-xs space-y-1 text-[#6B5E55]">
            <p className="font-bold text-[#2C221E]">Current Session:</p>
            <p>{user?.name || 'Unauthenticated Guest'} ({user?.email || 'No email'})</p>
            <p className="text-[11px] text-[#8F8175]">Role: {user?.role || 'traveler'}</p>
          </div>

          <div className="space-y-2.5 pt-2">
            <button
              onClick={() => {
                loginAsAdmin();
              }}
              id="admin-auth-demo-btn"
              className="w-full py-3 rounded-xl bg-[#964223] text-white text-xs font-bold shadow-sm hover:bg-[#7D351B] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Switch to Administrator Session</span>
            </button>

            <Link
              to="/"
              className="w-full py-2.5 rounded-xl border border-[#D9CBBA] text-xs font-bold text-[#2C221E] hover:bg-[#F0EAE1] transition-all block text-center"
            >
              Return to Traveler Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-200 pb-12">
      
      {/* Page Header */}
      <AdminHeader
        lastUpdated={lastUpdated}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
      />

      {/* Top Toolbar */}
      <AdminToolbar
        activeTab={activeTab}
        filters={filters}
        onFilterChange={handleFilterChange}
        availableCountries={availableCountries}
      />

      {/* Analytics Tabs */}
      <AdminTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        citiesCount={popularCities.length}
        activitiesCount={popularActivities.length}
        usersCount={rawUsers.length}
      />

      {/* Error state if any */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={handleRefresh}
            className="font-bold underline hover:text-rose-950"
          >
            Try Again
          </button>
        </div>
      )}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          
          {/* Primary Platform KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <AnalyticsKpiCard
              label="Total Travelers"
              value={overviewMetrics.totalUsers}
              description="Registered platform travelers"
              icon={Users}
              iconBgColor="bg-[#F0EAE1]"
              iconColor="text-[#964223]"
              onClick={() => setActiveTab('users')}
            />
            <AnalyticsKpiCard
              label="Total Trips"
              value={overviewMetrics.totalTrips}
              description={`${overviewMetrics.activeTrips} active • ${overviewMetrics.upcomingTrips} upcoming`}
              icon={Luggage}
              iconBgColor="bg-[#EBE7DF]"
              iconColor="text-[#4A6B70]"
            />
            <AnalyticsKpiCard
              label="Cities Planned"
              value={overviewMetrics.totalCities}
              description="Unique multi-leg destinations"
              icon={MapPin}
              iconBgColor="bg-[#E8EFE9]"
              iconColor="text-[#3F6E54]"
              onClick={() => setActiveTab('cities')}
            />
            <AnalyticsKpiCard
              label="Activities Scheduled"
              value={overviewMetrics.totalActivities}
              description="Curated itinerary experiences"
              icon={Sparkles}
              iconBgColor="bg-[#F9F0EA]"
              iconColor="text-[#D97706]"
              onClick={() => setActiveTab('activities')}
            />
          </div>

          {/* Secondary KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-2xl bg-[#FCFAF6] border border-[#EAE2D5] text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8F8175] block mb-1">
                Avg Trip Duration
              </span>
              <p className="font-serif-heading text-xl font-bold text-[#2C221E]">
                {overviewMetrics.avgTripDurationDays} Days
              </p>
              <p className="text-[11px] text-[#8F8175] mt-0.5">Calculated across itineraries</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FCFAF6] border border-[#EAE2D5] text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8F8175] block mb-1">
                Avg Stops / Trip
              </span>
              <p className="font-serif-heading text-xl font-bold text-[#2C221E]">
                {overviewMetrics.avgCitiesPerTrip} Cities
              </p>
              <p className="text-[11px] text-[#8F8175] mt-0.5">Multi-city stop average</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FCFAF6] border border-[#EAE2D5] text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8F8175] block mb-1">
                Avg Activities / Trip
              </span>
              <p className="font-serif-heading text-xl font-bold text-[#2C221E]">
                {overviewMetrics.avgActivitiesPerTrip} Experiences
              </p>
              <p className="text-[11px] text-[#8F8175] mt-0.5">Per journey plan</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FCFAF6] border border-[#EAE2D5] text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8F8175] block mb-1">
                Avg Target Budget
              </span>
              <p className="font-serif-heading text-xl font-bold text-[#2C221E]">
                ${overviewMetrics.avgTargetBudget.toLocaleString()}
              </p>
              <p className="text-[11px] text-[#8F8175] mt-0.5">
                ${overviewMetrics.totalBudgetPlanned.toLocaleString()} total planned
              </p>
            </div>
          </div>

          {/* Large Primary Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TripTrendChart data={trendDataPoints} />
            </div>
            <div>
              <TripStatusChart
                data={tripStatusBreakdown}
                totalTrips={overviewMetrics.totalTrips}
              />
            </div>
          </div>

          {/* Popular Cities & Activities Previews */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PopularCitiesChart
              cities={popularCities}
              limit={5}
              onViewAll={() => setActiveTab('cities')}
            />
            <PopularActivitiesChart
              activities={popularActivities}
              limit={5}
              onViewAll={() => setActiveTab('activities')}
            />
          </div>

        </div>
      )}

      {/* TAB 2: POPULAR CITIES */}
      {activeTab === 'cities' && (
        <PopularCitiesTab
          cities={popularCities}
          filters={filters}
        />
      )}

      {/* TAB 3: POPULAR ACTIVITIES */}
      {activeTab === 'activities' && (
        <PopularActivitiesTab
          activities={popularActivities}
          filters={filters}
        />
      )}

      {/* TAB 4: USER TRENDS & ANALYTICS */}
      {activeTab === 'users' && (
        <UserTrendsTab
          users={rawUsers}
          metrics={userBehaviorMetrics}
          trendPoints={trendDataPoints}
          filters={filters}
        />
      )}

    </div>
  );
};
