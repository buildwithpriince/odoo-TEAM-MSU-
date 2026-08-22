import { Trip, User } from '../types';
import {
  AdminOverviewMetrics,
  TrendDataPoint,
  TripStatusBreakdown,
  CityAnalyticsItem,
  ActivityAnalyticsItem,
  UserAnalyticsItem,
  UserBehaviorMetrics,
  TimePeriod
} from '../types/adminAnalytics';
import { POPULAR_DESTINATIONS } from '../data/mockData';

const envBaseUrl = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_API_BASE_URL : undefined;
const envProd = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.PROD : false;
const API_BASE_URL = (envBaseUrl || (envProd ? '/api' : 'http://localhost:5000/api')).replace(/\/$/, '');

function getAuthHeader() {
  const token = localStorage.getItem('globetrotter_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Filter trips based on time period
 */
export function filterTripsByPeriod(trips: Trip[], period: TimePeriod): Trip[] {
  if (period === 'all') return trips;

  const now = new Date().getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  let thresholdMs = 0;

  switch (period) {
    case '7d':
      thresholdMs = 7 * dayMs;
      break;
    case '30d':
      thresholdMs = 30 * dayMs;
      break;
    case '3m':
      thresholdMs = 90 * dayMs;
      break;
    case '6m':
      thresholdMs = 180 * dayMs;
      break;
    case '1y':
      thresholdMs = 365 * dayMs;
      break;
  }

  return trips.filter(t => {
    const tripDate = t.createdAt ? new Date(t.createdAt).getTime() : (t.startDate ? new Date(t.startDate).getTime() : now);
    return (now - tripDate) <= thresholdMs || (t.startDate && new Date(t.startDate).getTime() >= (now - thresholdMs));
  });
}

/**
 * Derive Overview metrics from active trips dataset
 */
export function calculateOverviewMetrics(trips: Trip[], registeredUsersCount = 1): AdminOverviewMetrics {
  const now = new Date();
  let activeTrips = 0;
  let upcomingTrips = 0;
  let completedTrips = 0;
  let planningTrips = 0;

  let totalDurationDays = 0;
  let validDurationTrips = 0;
  let totalStopsCount = 0;
  let totalActivitiesCount = 0;
  let totalBudget = 0;

  const citySet = new Set<string>();

  for (const trip of trips) {
    if (trip.status === 'planning') planningTrips++;

    if (trip.startDate && trip.endDate) {
      const start = new Date(trip.startDate);
      const end = new Date(trip.endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const diffDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
        totalDurationDays += diffDays;
        validDurationTrips++;

        if (start <= now && now <= end) {
          activeTrips++;
        } else if (start > now) {
          upcomingTrips++;
        } else if (end < now) {
          completedTrips++;
        }
      }
    }

    const stops = trip.stops || [];
    totalStopsCount += stops.length;
    for (const stop of stops) {
      if (stop.cityName) citySet.add(stop.cityName.toLowerCase().trim());
      for (const day of stop.days || []) {
        totalActivitiesCount += (day.activities || []).length;
      }
    }

    totalBudget += Number(trip.totalBudget) || 0;
  }

  const totalTrips = trips.length;

  return {
    totalUsers: registeredUsersCount,
    totalTrips,
    totalCities: citySet.size,
    totalActivities: totalActivitiesCount,
    activeTrips,
    upcomingTrips,
    completedTrips,
    planningTrips,
    avgTripDurationDays: validDurationTrips > 0 ? Number((totalDurationDays / validDurationTrips).toFixed(1)) : 0,
    avgCitiesPerTrip: totalTrips > 0 ? Number((totalStopsCount / totalTrips).toFixed(1)) : 0,
    avgActivitiesPerTrip: totalTrips > 0 ? Number((totalActivitiesCount / totalTrips).toFixed(1)) : 0,
    avgTargetBudget: totalTrips > 0 ? Math.round(totalBudget / totalTrips) : 0,
    totalBudgetPlanned: totalBudget
  };
}

/**
 * Derive Trip Status breakdown
 */
export function calculateTripStatusBreakdown(trips: Trip[]): TripStatusBreakdown[] {
  const total = Math.max(1, trips.length);
  let planning = 0;
  let upcoming = 0;
  let completed = 0;

  for (const t of trips) {
    if (t.status === 'upcoming') upcoming++;
    else if (t.status === 'completed') completed++;
    else planning++;
  }

  return [
    {
      status: 'planning',
      label: 'In Planning',
      count: planning,
      percentage: Math.round((planning / total) * 100),
      color: '#964223' // Terracotta
    },
    {
      status: 'upcoming',
      label: 'Upcoming',
      count: upcoming,
      percentage: Math.round((upcoming / total) * 100),
      color: '#D97706' // Amber Gold
    },
    {
      status: 'completed',
      label: 'Completed',
      count: completed,
      percentage: Math.round((completed / total) * 100),
      color: '#3F6E54' // Cedar Sage
    }
  ];
}

/**
 * Derive Popular Cities from actual trip stops
 */
export function calculatePopularCities(trips: Trip[]): CityAnalyticsItem[] {
  const cityMap = new Map<string, {
    cityName: string;
    country: string;
    region?: string;
    tripAppearances: number;
    travelers: Set<string>;
    totalDays: number;
    totalActivities: number;
  }>();

  for (const trip of trips) {
    for (const stop of trip.stops || []) {
      const name = (stop.cityName || '').trim();
      if (!name) continue;
      const key = name.toLowerCase();

      let daysInStop = 1;
      if (stop.arrivalDate && stop.departureDate) {
        const arr = new Date(stop.arrivalDate);
        const dep = new Date(stop.departureDate);
        if (!isNaN(arr.getTime()) && !isNaN(dep.getTime())) {
          daysInStop = Math.max(1, Math.round((dep.getTime() - arr.getTime()) / (1000 * 60 * 60 * 24)));
        }
      }

      let acts = 0;
      for (const d of stop.days || []) {
        acts += (d.activities || []).length;
      }

      // Check destination catalog for region metadata if available
      const matchedCatalog = POPULAR_DESTINATIONS.find(d => d.name.toLowerCase() === key);

      const existing = cityMap.get(key) || {
        cityName: name,
        country: stop.country || matchedCatalog?.country || 'International',
        region: matchedCatalog?.region,
        tripAppearances: 0,
        travelers: new Set<string>(),
        totalDays: 0,
        totalActivities: 0
      };

      existing.tripAppearances++;
      if (trip.id) existing.travelers.add(trip.id);
      existing.totalDays += daysInStop;
      existing.totalActivities += acts;
      cityMap.set(key, existing);
    }
  }

  const totalTrips = Math.max(1, trips.length);

  return Array.from(cityMap.entries())
    .map(([key, data]) => ({
      id: `city-${key}`,
      cityName: data.cityName,
      country: data.country,
      region: data.region,
      tripAppearances: data.tripAppearances,
      uniqueTravelers: data.travelers.size,
      percentageOfTrips: Math.round((data.tripAppearances / totalTrips) * 100),
      averageDaysStayed: Number((data.totalDays / data.tripAppearances).toFixed(1)),
      totalActivitiesInCity: data.totalActivities
    }))
    .sort((a, b) => b.tripAppearances - a.tripAppearances);
}

/**
 * Derive Popular Activities from actual scheduled activities
 */
export function calculatePopularActivities(trips: Trip[]): ActivityAnalyticsItem[] {
  const actMap = new Map<string, {
    title: string;
    cityName: string;
    category: any;
    timesScheduled: number;
    totalCost: number;
    duration?: string;
  }>();

  for (const trip of trips) {
    for (const stop of trip.stops || []) {
      for (const day of stop.days || []) {
        for (const act of day.activities || []) {
          const title = (act.title || '').trim();
          if (!title) continue;
          const key = title.toLowerCase();

          const existing = actMap.get(key) || {
            title,
            cityName: stop.cityName || 'Destination',
            category: act.category || 'sightseeing',
            timesScheduled: 0,
            totalCost: 0,
            duration: act.duration
          };

          existing.timesScheduled++;
          existing.totalCost += Number(act.cost) || 0;
          if (act.duration && !existing.duration) existing.duration = act.duration;
          actMap.set(key, existing);
        }
      }
    }
  }

  return Array.from(actMap.entries())
    .map(([key, data]) => ({
      id: `act-${key}`,
      title: data.title,
      cityName: data.cityName,
      category: data.category,
      timesScheduled: data.timesScheduled,
      averageCost: Math.round(data.totalCost / data.timesScheduled),
      duration: data.duration || '2 hrs',
      totalSpendEstimate: data.totalCost
    }))
    .sort((a, b) => b.timesScheduled - a.timesScheduled);
}

/**
 * Derive Trend series data from trips and users
 */
export function calculateTrendPoints(trips: Trip[], users: UserAnalyticsItem[]): TrendDataPoint[] {
  const dateMap = new Map<string, { label: string; tripsCreated: number; usersRegistered: number }>();

  // Aggregate trip creation dates
  for (const trip of trips) {
    const raw = trip.createdAt || trip.startDate || '2026-08-01';
    const d = new Date(raw);
    const key = isNaN(d.getTime()) ? '2026-08' : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = isNaN(d.getTime()) ? 'Aug 2026' : d.toLocaleString('default', { month: 'short', year: 'numeric' });

    const existing = dateMap.get(key) || { label, tripsCreated: 0, usersRegistered: 0 };
    existing.tripsCreated++;
    dateMap.set(key, existing);
  }

  // Aggregate user join dates
  for (const u of users) {
    const raw = u.createdAt || '2026-08-01';
    const d = new Date(raw);
    const key = isNaN(d.getTime()) ? '2026-08' : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = isNaN(d.getTime()) ? 'Aug 2026' : d.toLocaleString('default', { month: 'short', year: 'numeric' });

    const existing = dateMap.get(key) || { label, tripsCreated: 0, usersRegistered: 0 };
    existing.usersRegistered++;
    dateMap.set(key, existing);
  }

  // Ensure at least some continuous months for visualization
  if (dateMap.size === 0) {
    dateMap.set('2026-08', { label: 'Aug 2026', tripsCreated: trips.length, usersRegistered: users.length || 1 });
  }

  return Array.from(dateMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, data]) => ({
      date,
      label: data.label,
      tripsCreated: data.tripsCreated,
      usersRegistered: data.usersRegistered
    }));
}

/**
 * Derive User Behavior metrics
 */
export function calculateUserBehaviorMetrics(trips: Trip[], users: UserAnalyticsItem[]): UserBehaviorMetrics {
  const totalUsers = Math.max(1, users.length);
  const totalTrips = trips.length;

  let totalStops = 0;
  let totalActivities = 0;
  let multiCityTrips = 0;
  let totalDays = 0;
  let validTripDaysCount = 0;

  for (const t of trips) {
    const stops = t.stops || [];
    totalStops += stops.length;
    if (stops.length > 1) multiCityTrips++;

    if (t.startDate && t.endDate) {
      const diff = new Date(t.endDate).getTime() - new Date(t.startDate).getTime();
      const days = Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
      totalDays += days;
      validTripDaysCount++;
    }

    for (const s of stops) {
      for (const d of s.days || []) {
        totalActivities += (d.activities || []).length;
      }
    }
  }

  return {
    totalUsers,
    activePlanners: users.filter(u => u.tripsCount > 0).length || (totalTrips > 0 ? 1 : 0),
    avgTripsPerUser: Number((totalTrips / totalUsers).toFixed(1)),
    avgStopsPerTrip: totalTrips > 0 ? Number((totalStops / totalTrips).toFixed(1)) : 0,
    avgActivitiesPerTrip: totalTrips > 0 ? Number((totalActivities / totalTrips).toFixed(1)) : 0,
    avgTripDurationDays: validTripDaysCount > 0 ? Number((totalDays / validTripDaysCount).toFixed(1)) : 0,
    tripsWithMultipleCitiesRatio: totalTrips > 0 ? Math.round((multiCityTrips / totalTrips) * 100) : 0
  };
}

/**
 * Service API caller with full resilient fallback
 */
export async function fetchAdminOverview(trips: Trip[], currentUser: User | null): Promise<AdminOverviewMetrics> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/overview`, {
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' }
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback to local real data
  }
  return calculateOverviewMetrics(trips, 2);
}

export async function fetchAdminCities(trips: Trip[]): Promise<CityAnalyticsItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/cities`, {
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.cities) && data.cities.length > 0) {
        return data.cities;
      }
    }
  } catch {
    // Fallback
  }
  return calculatePopularCities(trips);
}

export async function fetchAdminActivities(trips: Trip[]): Promise<ActivityAnalyticsItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/activities`, {
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.activities) && data.activities.length > 0) {
        return data.activities;
      }
    }
  } catch {
    // Fallback
  }
  return calculatePopularActivities(trips);
}

export async function fetchAdminUsers(trips: Trip[], currentUser: User | null): Promise<UserAnalyticsItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.users) && data.users.length > 0) {
        return data.users;
      }
    }
  } catch {
    // Fallback
  }

  // Derive known users list
  const totalActs = trips.reduce((sum, t) => sum + (t.stops || []).reduce((s2, stop) => s2 + (stop.days || []).reduce((s3, d) => s3 + (d.activities || []).length, 0), 0), 0);

  return [
    {
      id: currentUser?.id || 'usr-101',
      name: currentUser?.name || 'Alex Morgan',
      email: currentUser?.email || 'alex.morgan@globetrotter.io',
      role: currentUser?.role || 'traveler',
      homeCity: currentUser?.homeCity || 'San Francisco, CA',
      tripsCount: trips.length,
      activitiesCount: totalActs,
      createdAt: '2026-08-01T10:00:00Z',
      status: 'active'
    },
    {
      id: 'usr-admin-01',
      name: 'Platform Administrator',
      email: 'admin@globetrotter.io',
      role: 'admin',
      homeCity: 'Global Operations',
      tripsCount: 0,
      activitiesCount: 0,
      createdAt: '2026-07-15T08:30:00Z',
      status: 'active'
    }
  ];
}
