export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  homeCity?: string;
  currency?: string;
  bio?: string;
  savedDestinations?: string[];
}

export type ActivityCategory = 'sightseeing' | 'dining' | 'transport' | 'lodging' | 'leisure';

export interface ActivityItem {
  id: string;
  title: string;
  time?: string;
  duration?: string;
  category: ActivityCategory;
  cost: number;
  location?: string;
  notes?: string;
  isCustom?: boolean;
}

export interface DayItinerary {
  dayNumber: number;
  date: string;
  title: string;
  activities: ActivityItem[];
}

export interface CityStop {
  id: string;
  cityName: string;
  country: string;
  arrivalDate: string;
  departureDate: string;
  coverImage?: string;
  notes?: string;
  days?: DayItinerary[];
}

export type BudgetCategory = 'Flights' | 'Lodging' | 'Food & Drinks' | 'Activities' | 'Transit' | 'Misc';

export interface BudgetItem {
  id: string;
  category: BudgetCategory;
  estimatedCost: number;
  actualCost: number;
  paid: boolean;
  notes?: string;
}

export interface Trip {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'upcoming' | 'completed';
  stops: CityStop[];
  totalBudget: number;
  currency: string;
  travelVibe?: string;
  budgetItems?: BudgetItem[];
  destinationTheme?: {
    accentColor: string;
    gradient: string;
    bgTint: string;
  };
}

export interface CuratedActivity {
  id: string;
  title: string;
  category: ActivityCategory;
  duration: string;
  cost: number;
  time: string;
  description: string;
  icon?: string;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  region: string;
  tagline: string;
  image: string;
  dominantAccent: string;
  heroGradient: string;
  bgTint: string;
  averageDailyCost: number;
  costIndex: 1 | 2 | 3 | 4; // 1 = $, 2 = $$, 3 = $$$, 4 = $$$$
  popularSeason: string;
  highlights: string[];
  vibe: string;
  description: string;
  curatedActivities: CuratedActivity[];
  curatedStops?: string[]; // nearby stops for a multi-city circuit
}
