import { CityStop, BudgetItem } from '../types';

export interface CommunityTraveler {
  id: string;
  name: string;
  avatarUrl?: string;
  homeCity?: string;
  bio?: string;
}

export interface CommunityTrip {
  id: string;
  shareCode?: string;
  title: string;
  description: string;
  coverImage: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  stopsCount: number;
  totalBudget: number;
  currency: string;
  travelVibe?: string;
  stops: CityStop[];
  budgetItems?: BudgetItem[];
  traveler: CommunityTraveler;
  createdAt: string;
  likesCount: number;
  savesCount: number;
  isLiked?: boolean;
  isSaved?: boolean;
}

export type CommunityGroupBy = 'none' | 'destination' | 'country' | 'vibe';
export type CommunitySortBy = 'recent' | 'longest' | 'shortest' | 'lowest_budget' | 'highest_budget' | 'name_asc';

export interface CommunityFilters {
  search: string;
  country: string;
  travelVibe: string;
  durationRange: 'all' | '1-5' | '6-10' | '11+';
  budgetRange: 'all' | 'under-1500' | '1500-3000' | '3000+';
  groupBy: CommunityGroupBy;
  sortBy: CommunitySortBy;
}

export interface CommunityResponse {
  items: CommunityTrip[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
