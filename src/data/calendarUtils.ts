import { Trip, CityStop, ActivityItem } from '../types';

export type GroupByOption = 'trip' | 'city' | 'activity';
export type StatusFilterOption = 'all' | 'upcoming' | 'planning' | 'completed';
export type SortByOption = 'startDate' | 'endDate' | 'title';

export interface CalendarDayCell {
  date: Date;
  dateString: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  weekdayIndex: number; // 0 (Sun) to 6 (Sat)
}

export interface CalendarEvent {
  id: string;
  tripId: string;
  title: string;
  subtitle?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  coverImage?: string;
  type: GroupByOption;
  status: 'planning' | 'upcoming' | 'completed';
  accentColor?: string;
  cities?: string[];
  activities?: string[];
  totalBudget?: number;
  currency?: string;
  activityCategory?: string;
  cost?: number;
  notes?: string;
}

export interface WeekEventSpan {
  event: CalendarEvent;
  startIndex: number; // 0 to 6 in the week row
  span: number;       // 1 to (7 - startIndex)
  isStartEdge: boolean; // True if this week contains the event's actual start date
  isEndEdge: boolean;   // True if this week contains the event's actual end date
}

// Utility: format Date to YYYY-MM-DD in local time
export const formatDateString = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// Utility: parse YYYY-MM-DD to Date object at midnight local time
export const parseDateString = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// Generate 42 grid cells (6 rows x 7 days) for a given year & 0-indexed month
export const getCalendarDays = (year: number, month: number): CalendarDayCell[] => {
  const todayStr = formatDateString(new Date());
  const firstDayOfMonth = new Date(year, month, 1);
  const startingWeekday = firstDayOfMonth.getDay(); // 0 (Sun) .. 6 (Sat)
  
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  const currentMonthDaysCount = new Date(year, month + 1, 0).getDate();
  
  const cells: CalendarDayCell[] = [];
  
  // Previous month overflow days
  for (let i = startingWeekday - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDay - i;
    const date = new Date(year, month - 1, dayNum);
    const dateString = formatDateString(date);
    cells.push({
      date,
      dateString,
      dayNumber: dayNum,
      isCurrentMonth: false,
      isToday: dateString === todayStr,
      weekdayIndex: cells.length % 7,
    });
  }
  
  // Current month days
  for (let d = 1; d <= currentMonthDaysCount; d++) {
    const date = new Date(year, month, d);
    const dateString = formatDateString(date);
    cells.push({
      date,
      dateString,
      dayNumber: d,
      isCurrentMonth: true,
      isToday: dateString === todayStr,
      weekdayIndex: cells.length % 7,
    });
  }
  
  // Next month overflow days (fill up to 42 cells = 6 full weeks)
  const remaining = 42 - cells.length;
  for (let n = 1; n <= remaining; n++) {
    const date = new Date(year, month + 1, n);
    const dateString = formatDateString(date);
    cells.push({
      date,
      dateString,
      dayNumber: n,
      isCurrentMonth: false,
      isToday: dateString === todayStr,
      weekdayIndex: cells.length % 7,
    });
  }
  
  return cells;
};

// Transform Trips into CalendarEvents based on GroupBy, Search, Filter, and Sort
export const transformTripsToEvents = (
  trips: Trip[],
  groupBy: GroupByOption,
  searchQuery: string,
  statusFilter: StatusFilterOption,
  sortBy: SortByOption
): CalendarEvent[] => {
  const todayStr = formatDateString(new Date());
  let events: CalendarEvent[] = [];

  trips.forEach((trip) => {
    // Derive trip status if needed
    let derivedStatus: 'planning' | 'upcoming' | 'completed' = trip.status;
    if (!derivedStatus) {
      if (trip.endDate < todayStr) derivedStatus = 'completed';
      else if (trip.startDate > todayStr) derivedStatus = 'upcoming';
      else derivedStatus = 'planning';
    }

    const citiesList = trip.stops?.map(s => s.cityName) || [];
    const allActivitiesList: string[] = [];
    trip.stops?.forEach(stop => {
      stop.days?.forEach(day => {
        day.activities?.forEach(act => {
          if (act.title) allActivitiesList.push(act.title);
        });
      });
    });

    if (groupBy === 'trip') {
      events.push({
        id: `evt-trip-${trip.id}`,
        tripId: trip.id,
        title: trip.title,
        subtitle: citiesList.length > 0 ? citiesList.join(' → ') : trip.description,
        startDate: trip.startDate,
        endDate: trip.endDate,
        coverImage: trip.coverImage,
        type: 'trip',
        status: derivedStatus,
        accentColor: trip.destinationTheme?.accentColor || '#964223',
        cities: citiesList,
        activities: allActivitiesList,
        totalBudget: trip.totalBudget,
        currency: trip.currency,
      });
    } else if (groupBy === 'city') {
      if (trip.stops && trip.stops.length > 0) {
        trip.stops.forEach((stop, idx) => {
          const stopActivities: string[] = [];
          stop.days?.forEach(day => {
            day.activities?.forEach(act => {
              if (act.title) stopActivities.push(act.title);
            });
          });

          events.push({
            id: `evt-city-${trip.id}-${stop.id || idx}`,
            tripId: trip.id,
            title: `${stop.cityName}, ${stop.country}`,
            subtitle: trip.title,
            startDate: stop.arrivalDate || trip.startDate,
            endDate: stop.departureDate || trip.endDate,
            coverImage: stop.coverImage || trip.coverImage,
            type: 'city',
            status: derivedStatus,
            accentColor: trip.destinationTheme?.accentColor || '#4A6B70',
            cities: [stop.cityName],
            activities: stopActivities,
            totalBudget: trip.totalBudget,
            currency: trip.currency,
            notes: stop.notes,
          });
        });
      } else {
        events.push({
          id: `evt-trip-fallback-${trip.id}`,
          tripId: trip.id,
          title: trip.title,
          subtitle: 'No specific stops defined',
          startDate: trip.startDate,
          endDate: trip.endDate,
          coverImage: trip.coverImage,
          type: 'city',
          status: derivedStatus,
          accentColor: trip.destinationTheme?.accentColor || '#4A6B70',
          cities: [],
          activities: allActivitiesList,
          totalBudget: trip.totalBudget,
          currency: trip.currency,
        });
      }
    } else if (groupBy === 'activity') {
      let activityFound = false;
      trip.stops?.forEach((stop) => {
        stop.days?.forEach((day) => {
          day.activities?.forEach((act) => {
            activityFound = true;
            events.push({
              id: `evt-act-${trip.id}-${act.id}`,
              tripId: trip.id,
              title: act.title,
              subtitle: `${stop.cityName} • ${act.time || 'All day'}`,
              startDate: day.date || stop.arrivalDate || trip.startDate,
              endDate: day.date || stop.arrivalDate || trip.startDate,
              coverImage: trip.coverImage,
              type: 'activity',
              status: derivedStatus,
              accentColor: trip.destinationTheme?.accentColor || '#3F6E54',
              cities: [stop.cityName],
              activities: [act.title],
              activityCategory: act.category,
              cost: act.cost,
              notes: act.notes,
            });
          });
        });
      });
      if (!activityFound) {
        events.push({
          id: `evt-no-act-${trip.id}`,
          tripId: trip.id,
          title: `Trip: ${trip.title}`,
          subtitle: 'No activities scheduled yet',
          startDate: trip.startDate,
          endDate: trip.endDate,
          coverImage: trip.coverImage,
          type: 'activity',
          status: derivedStatus,
          accentColor: trip.destinationTheme?.accentColor || '#3F6E54',
          cities: citiesList,
          activities: [],
        });
      }
    }
  });

  // Apply Status Filter
  if (statusFilter !== 'all') {
    events = events.filter((e) => {
      if (statusFilter === 'upcoming') {
        return e.status === 'upcoming' || e.startDate > todayStr;
      }
      if (statusFilter === 'completed') {
        return e.status === 'completed' || e.endDate < todayStr;
      }
      if (statusFilter === 'planning') {
        return e.status === 'planning' || (e.startDate <= todayStr && e.endDate >= todayStr);
      }
      return true;
    });
  }

  // Apply Search Filter (matches title, subtitle, cities, and activities)
  if (searchQuery.trim() !== '') {
    const q = searchQuery.toLowerCase().trim();
    events = events.filter((e) => {
      const matchTitle = e.title.toLowerCase().includes(q);
      const matchSub = e.subtitle ? e.subtitle.toLowerCase().includes(q) : false;
      const matchCities = e.cities ? e.cities.some(c => c.toLowerCase().includes(q)) : false;
      const matchActivities = e.activities ? e.activities.some(a => a.toLowerCase().includes(q)) : false;
      return matchTitle || matchSub || matchCities || matchActivities;
    });
  }

  // Apply Sort
  events.sort((a, b) => {
    if (sortBy === 'startDate') {
      return a.startDate.localeCompare(b.startDate);
    }
    if (sortBy === 'endDate') {
      return a.endDate.localeCompare(b.endDate);
    }
    if (sortBy === 'title') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  return events;
};

// Calculate week row spans for rendering multi-day event bars across 7 days
export const calculateWeekSpans = (
  weekCells: CalendarDayCell[],
  events: CalendarEvent[]
): WeekEventSpan[] => {
  if (weekCells.length !== 7 || events.length === 0) return [];

  const weekStartStr = weekCells[0].dateString;
  const weekEndStr = weekCells[6].dateString;

  const spans: WeekEventSpan[] = [];

  events.forEach((event) => {
    // Check if event overlaps with this week
    if (event.startDate <= weekEndStr && event.endDate >= weekStartStr) {
      // Find start column index in week (0 to 6)
      let startIndex = 0;
      for (let i = 0; i < 7; i++) {
        if (weekCells[i].dateString >= event.startDate) {
          startIndex = i;
          break;
        }
      }

      // Find end column index in week (0 to 6)
      let endIndex = 6;
      for (let i = 6; i >= 0; i--) {
        if (weekCells[i].dateString <= event.endDate) {
          endIndex = i;
          break;
        }
      }

      if (endIndex >= startIndex) {
        spans.push({
          event,
          startIndex,
          span: endIndex - startIndex + 1,
          isStartEdge: event.startDate >= weekStartStr && event.startDate <= weekEndStr,
          isEndEdge: event.endDate >= weekStartStr && event.endDate <= weekEndStr,
        });
      }
    }
  });

  return spans;
};
