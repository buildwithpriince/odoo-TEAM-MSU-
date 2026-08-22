import { ActivityCategory } from '../types';

export type TimePeriod = '7d' | '30d' | '3m' | '6m' | '1y' | 'all';

export interface AdminOverviewMetrics {
  totalUsers: number;
  totalTrips: number;
  totalCities: number;
  totalActivities: number;
  activeTrips: number;
  upcomingTrips: number;
  completedTrips: number;
  planningTrips: number;
  avgTripDurationDays: number;
  avgCitiesPerTrip: number;
  avgActivitiesPerTrip: number;
  avgTargetBudget: number;
  totalBudgetPlanned: number;
}

export interface TrendDataPoint {
  date: string;
  label: string;
  tripsCreated: number;
  usersRegistered: number;
}

export interface TripStatusBreakdown {
  status: 'planning' | 'upcoming' | 'completed';
  label: string;
  count: number;
  percentage: number;
  color: string;
}

export interface CityAnalyticsItem {
  id: string;
  cityName: string;
  country: string;
  region?: string;
  tripAppearances: number;
  uniqueTravelers: number;
  percentageOfTrips: number;
  averageDaysStayed: number;
  totalActivitiesInCity: number;
}

export interface ActivityAnalyticsItem {
  id: string;
  title: string;
  cityName: string;
  category: ActivityCategory;
  timesScheduled: number;
  averageCost: number;
  duration?: string;
  totalSpendEstimate: number;
}

export interface UserAnalyticsItem {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'traveler';
  homeCity?: string;
  tripsCount: number;
  activitiesCount: number;
  createdAt: string;
  lastActive?: string;
  status: 'active' | 'new' | 'inactive';
}

export interface UserBehaviorMetrics {
  totalUsers: number;
  activePlanners: number;
  avgTripsPerUser: number;
  avgStopsPerTrip: number;
  avgActivitiesPerTrip: number;
  avgTripDurationDays: number;
  tripsWithMultipleCitiesRatio: number;
}

export interface AdminFilters {
  search: string;
  timePeriod: TimePeriod;
  groupBy: string;
  countryFilter: string;
  categoryFilter: string;
  statusFilter: string;
  sortBy: string;
}

export type AdminTab = 'overview' | 'cities' | 'activities' | 'users';
