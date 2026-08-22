import { Trip } from '../types';
import { 
  CommunityTrip, 
  CommunityFilters, 
  CommunityResponse,
  CommunityTraveler 
} from '../types/community';
import { INITIAL_TRIPS } from '../data/mockData';

const envBaseUrl = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_API_BASE_URL : undefined;
const envProd = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.PROD : false;
const API_BASE_URL = (envBaseUrl || (envProd ? '/api' : 'http://localhost:5000/api')).replace(/\/$/, '');

// Curated demo travelers for shared community trips
const SAMPLE_TRAVELERS: CommunityTraveler[] = [
  {
    id: 'usr-101',
    name: 'Alex Morgan',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    homeCity: 'San Francisco, CA',
    bio: 'Passionate wanderer seeking authentic culinary stalls and hidden trails.'
  },
  {
    id: 'usr-102',
    name: 'Elena Rostova',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    homeCity: 'Zurich, Switzerland',
    bio: 'Alpine hiker, architecture enthusiast, and slow-travel advocate.'
  },
  {
    id: 'usr-103',
    name: 'Kenji Sato',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    homeCity: 'Kyoto, Japan',
    bio: 'Landscape photographer capturing dawn mist over temple gardens.'
  },
  {
    id: 'usr-104',
    name: 'Priya Sharma',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    homeCity: 'Mumbai, India',
    bio: 'Heritage lover discovering historic royal forts and street artisan havelis.'
  }
];

function getStoredJson(key: string): Record<string, any> {
  if (typeof window === 'undefined' || !window.localStorage) return {};
  try {
    return JSON.parse(localStorage.getItem(key) || '{}');
  } catch {
    return {};
  }
}

function setStoredJson(key: string, value: Record<string, any>) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore quota or serialization errors
  }
}

/**
 * Build initial community shared trips derived from platform data
 */
export function getInitialCommunityTrips(userTrips: Trip[] = []): CommunityTrip[] {
  const savedLikes = getStoredJson('globetrotter_community_likes');
  const savedSaves = getStoredJson('globetrotter_community_saves');

  // Base curated public trips
  const baseCommunityList: CommunityTrip[] = [
    {
      id: 'comm-trip-1',
      shareCode: 'gt-raj-99',
      title: 'Royal Rajasthan: Jaipur, Jodhpur & Udaipur',
      description: 'A 10-day expedition through majestic forts, vibrant spice bazaars, and serene desert lake palaces in western India.',
      coverImage: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=85',
      startDate: '2026-10-15',
      endDate: '2026-10-25',
      durationDays: 10,
      stopsCount: 3,
      totalBudget: 2200,
      currency: 'USD',
      travelVibe: 'Royal Heritage & Art',
      stops: INITIAL_TRIPS[0]?.stops || [],
      budgetItems: INITIAL_TRIPS[0]?.budgetItems || [],
      traveler: SAMPLE_TRAVELERS[0],
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      likesCount: 34,
      savesCount: 19
    },
    {
      id: 'comm-trip-2',
      shareCode: 'gt-jpn-88',
      title: 'Autumn in Japan: Tokyo & Kyoto',
      description: 'A bullet-train journey connecting neon skyscraper districts with quiet bamboo groves, historic machiya, and autumn maple shrines.',
      coverImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=85',
      startDate: '2026-11-20',
      endDate: '2026-11-30',
      durationDays: 10,
      stopsCount: 2,
      totalBudget: 3400,
      currency: 'USD',
      travelVibe: 'Culture & Tranquility',
      stops: INITIAL_TRIPS[2]?.stops || [],
      budgetItems: INITIAL_TRIPS[2]?.budgetItems || [],
      traveler: SAMPLE_TRAVELERS[2],
      createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      likesCount: 42,
      savesCount: 28
    },
    {
      id: 'comm-trip-3',
      shareCode: 'gt-him-77',
      title: 'Himalayan Ridge: Shimla to Manali',
      description: 'Pine-scented mountain air, UNESCO heritage toy trains, and alpine serenity nestled high in the western Himalayas.',
      coverImage: 'https://images.unsplash.com/photo-1562979314-bee7453e911c?auto=format&fit=crop&w=1200&q=85',
      startDate: '2026-11-05',
      endDate: '2026-11-14',
      durationDays: 9,
      stopsCount: 2,
      totalBudget: 1600,
      currency: 'USD',
      travelVibe: 'Pine Whispers & Mountain Peaks',
      stops: INITIAL_TRIPS[1]?.stops || [],
      budgetItems: INITIAL_TRIPS[1]?.budgetItems || [],
      traveler: SAMPLE_TRAVELERS[1],
      createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
      likesCount: 21,
      savesCount: 12
    },
    {
      id: 'comm-trip-4',
      shareCode: 'gt-goa-66',
      title: 'Konkan Coastline & Portuguese Quarters',
      description: 'Swaying palm groves, pastel Fontainhas mansions, golden sunset backwaters, and fragrant spice farms in South India.',
      coverImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=85',
      startDate: '2026-12-01',
      endDate: '2026-12-08',
      durationDays: 7,
      stopsCount: 2,
      totalBudget: 1450,
      currency: 'USD',
      travelVibe: 'Coastal Bliss & Heritage',
      stops: [
        {
          id: 'stop-c-goa',
          cityName: 'Goa',
          country: 'India',
          arrivalDate: '2026-12-01',
          departureDate: '2026-12-05',
          coverImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80',
          days: [
            {
              dayNumber: 1,
              date: '2026-12-01',
              title: 'Fontainhas Heritage Architecture Walk',
              activities: [
                { id: 'act-cg-1', title: 'Fontainhas Latin Quarter Stroll', category: 'sightseeing', cost: 15, duration: '2 hrs', time: '09:00' },
                { id: 'act-cg-2', title: 'Sunset Backwater Kayaking', category: 'leisure', cost: 30, duration: '2.5 hrs', time: '16:30' }
              ]
            }
          ]
        },
        {
          id: 'stop-c-gok',
          cityName: 'Gokarna',
          country: 'India',
          arrivalDate: '2026-12-05',
          departureDate: '2026-12-08',
          coverImage: 'https://images.unsplash.com/photo-1582650625119-3a31f8418b7d?auto=format&fit=crop&w=600&q=80',
          days: [
            {
              dayNumber: 5,
              date: '2026-12-05',
              title: 'Kudle & Om Beach Trail',
              activities: [
                { id: 'act-cg-3', title: 'Cliffside Coastal Trail Hike', category: 'leisure', cost: 0, duration: '3 hrs', time: '07:30' }
              ]
            }
          ]
        }
      ],
      traveler: SAMPLE_TRAVELERS[3],
      createdAt: new Date(Date.now() - 9 * 86400000).toISOString(),
      likesCount: 29,
      savesCount: 15
    }
  ];

  // Include user trips marked explicitly as isPublic
  const userPublicTrips: CommunityTrip[] = userTrips
    .filter(t => t.isPublic === true)
    .map(t => {
      let days = 1;
      if (t.startDate && t.endDate) {
        const diff = new Date(t.endDate).getTime() - new Date(t.startDate).getTime();
        days = Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
      }
      return {
        id: `comm-user-${t.id}`,
        shareCode: `gt-usr-${t.id.slice(-4)}`,
        title: t.title,
        description: t.description || 'Custom multi-city travel itinerary shared with the community.',
        coverImage: t.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
        startDate: t.startDate,
        endDate: t.endDate,
        durationDays: days,
        stopsCount: t.stops?.length || 0,
        totalBudget: t.totalBudget || 2000,
        currency: t.currency || 'USD',
        travelVibe: t.travelVibe || 'Discovery & Adventure',
        stops: t.stops || [],
        budgetItems: t.budgetItems || [],
        traveler: {
          id: t.author?.id || 'usr-101',
          name: t.author?.name || 'Alex Morgan',
          avatarUrl: t.author?.avatarUrl || SAMPLE_TRAVELERS[0].avatarUrl,
          homeCity: t.author?.homeCity || 'San Francisco, CA'
        },
        createdAt: t.createdAt || new Date().toISOString(),
        likesCount: 1,
        savesCount: 0
      };
    });

  const combined = [...userPublicTrips, ...baseCommunityList];

  return combined.map(trip => ({
    ...trip,
    isLiked: !!savedLikes[trip.id],
    isSaved: !!savedSaves[trip.id],
    likesCount: trip.likesCount + (savedLikes[trip.id] ? 1 : 0),
    savesCount: trip.savesCount + (savedSaves[trip.id] ? 1 : 0),
  }));
}

/**
 * Filter, sort, and paginate community trips
 */
export async function fetchCommunityTrips(
  filters: CommunityFilters,
  page = 1,
  limit = 10,
  userTrips: Trip[] = []
): Promise<CommunityResponse> {
  const allTrips = getInitialCommunityTrips(userTrips);

  // Apply search
  let result = allTrips.filter(trip => {
    if (!filters.search) return true;
    const query = filters.search.toLowerCase().trim();

    const titleMatch = trip.title.toLowerCase().includes(query);
    const descMatch = trip.description.toLowerCase().includes(query);
    const vibeMatch = trip.travelVibe?.toLowerCase().includes(query) || false;
    const travelerMatch = trip.traveler.name.toLowerCase().includes(query);
    const stopMatch = trip.stops.some(s => 
      s.cityName.toLowerCase().includes(query) || 
      s.country.toLowerCase().includes(query)
    );
    const activityMatch = trip.stops.some(s => 
      (s.days || []).some(d => 
        (d.activities || []).some(a => a.title.toLowerCase().includes(query))
      )
    );

    return titleMatch || descMatch || vibeMatch || travelerMatch || stopMatch || activityMatch;
  });

  // Country filter
  if (filters.country !== 'all') {
    result = result.filter(trip => 
      trip.stops.some(s => s.country.toLowerCase() === filters.country.toLowerCase())
    );
  }

  // Travel Vibe filter
  if (filters.travelVibe !== 'all') {
    result = result.filter(trip => 
      trip.travelVibe?.toLowerCase().includes(filters.travelVibe.toLowerCase())
    );
  }

  // Duration Range filter
  if (filters.durationRange !== 'all') {
    result = result.filter(trip => {
      if (filters.durationRange === '1-5') return trip.durationDays <= 5;
      if (filters.durationRange === '6-10') return trip.durationDays >= 6 && trip.durationDays <= 10;
      if (filters.durationRange === '11+') return trip.durationDays >= 11;
      return true;
    });
  }

  // Budget Range filter
  if (filters.budgetRange !== 'all') {
    result = result.filter(trip => {
      if (filters.budgetRange === 'under-1500') return trip.totalBudget < 1500;
      if (filters.budgetRange === '1500-3000') return trip.totalBudget >= 1500 && trip.totalBudget <= 3000;
      if (filters.budgetRange === '3000+') return trip.totalBudget > 3000;
      return true;
    });
  }

  // Sort By
  result = [...result].sort((a, b) => {
    switch (filters.sortBy) {
      case 'longest':
        return b.durationDays - a.durationDays;
      case 'shortest':
        return a.durationDays - b.durationDays;
      case 'lowest_budget':
        return a.totalBudget - b.totalBudget;
      case 'highest_budget':
        return b.totalBudget - a.totalBudget;
      case 'name_asc':
        return a.title.localeCompare(b.title);
      case 'recent':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const total = result.length;
  const paginated = result.slice(0, page * limit);

  return {
    items: paginated,
    total,
    page,
    limit,
    hasMore: paginated.length < total
  };
}

/**
 * Toggle like for a community trip
 */
export function toggleLikeTrip(tripId: string): boolean {
  const savedLikes = getStoredJson('globetrotter_community_likes');
  const currentState = !!savedLikes[tripId];
  if (currentState) {
    delete savedLikes[tripId];
  } else {
    savedLikes[tripId] = true;
  }
  setStoredJson('globetrotter_community_likes', savedLikes);
  return !currentState;
}

/**
 * Toggle bookmark/save for a community trip
 */
export function toggleSaveTrip(tripId: string): boolean {
  const savedSaves = getStoredJson('globetrotter_community_saves');
  const currentState = !!savedSaves[tripId];
  if (currentState) {
    delete savedSaves[tripId];
  } else {
    savedSaves[tripId] = true;
  }
  setStoredJson('globetrotter_community_saves', savedSaves);
  return !currentState;
}
