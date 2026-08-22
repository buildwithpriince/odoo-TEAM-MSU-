import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Search,
  Sparkles,
  Plus,
  ArrowRight,
  MapPin,
  Compass,
  Filter,
  Layers,
  ArrowUpDown,
  X,
  Clock,
  DollarSign,
  Info,
  ExternalLink,
  Luggage,
  Tag
} from 'lucide-react';
import { useTrip } from '../context/TripContext';
import { useCurrency } from '../context/CurrencyContext';
import {
  getCalendarDays,
  transformTripsToEvents,
  calculateWeekSpans,
  GroupByOption,
  StatusFilterOption,
  SortByOption,
  CalendarEvent,
  formatDateString,
  parseDateString
} from '../data/calendarUtils';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export const CalendarView: React.FC = () => {
  const { trips } = useTrip();
  const { formatCurrentCurrency, convertCostToCurrentCurrency } = useCurrency();
  const navigate = useNavigate();

  // Loading & error states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  // Determine initial calendar month based on latest or upcoming trip if available
  const initialDate = useMemo(() => {
    if (trips && trips.length > 0) {
      // Find first upcoming or latest trip
      const sorted = [...trips].sort((a, b) => a.startDate.localeCompare(b.startDate));
      const firstTripDate = parseDateString(sorted[0].startDate);
      return firstTripDate;
    }
    return new Date();
  }, [trips]);

  const [currentYear, setCurrentYear] = useState<number>(() => initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(() => initialDate.getMonth()); // 0-indexed

  // Toolbar state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [groupBy, setGroupBy] = useState<GroupByOption>('trip');
  const [statusFilter, setStatusFilter] = useState<StatusFilterOption>('all');
  const [sortBy, setSortBy] = useState<SortByOption>('startDate');

  // Preview Modal state
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleGoToToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
  };

  const handleRetry = () => {
    setIsLoading(true);
    setIsError(false);
    setTimeout(() => {
      setIsLoading(false);
    }, 400);
  };

  // Generate grid days (42 cells: 6 weeks x 7 days)
  const calendarCells = useMemo(() => {
    return getCalendarDays(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  // Split 42 cells into 6 week rows
  const weekRows = useMemo(() => {
    const rows = [];
    for (let i = 0; i < 42; i += 7) {
      rows.push(calendarCells.slice(i, i + 7));
    }
    return rows;
  }, [calendarCells]);

  // Transformed events
  const events = useMemo(() => {
    return transformTripsToEvents(trips, groupBy, searchQuery, statusFilter, sortBy);
  }, [trips, groupBy, searchQuery, statusFilter, sortBy]);

  // Selected trip lookup for quick preview modal
  const activeTripDetails = useMemo(() => {
    if (!selectedEvent) return null;
    return trips.find(t => t.id === selectedEvent.tripId) || null;
  }, [selectedEvent, trips]);

  // 1. Error State
  if (isError) {
    return (
      <div className="editorial-card p-12 text-center space-y-4 max-w-lg mx-auto my-12 animate-in fade-in duration-200">
        <div className="w-14 h-14 rounded-2xl bg-[#F0EAE1] text-[#964223] flex items-center justify-center mx-auto">
          <Info className="w-7 h-7" />
        </div>
        <h2 className="font-serif-heading text-2xl font-bold text-[#2C221E]">
          Couldn't load your calendar.
        </h2>
        <p className="text-xs text-[#6B5E55]">
          Please try again to view your scheduled journeys and multi-city itineraries.
        </p>
        <div className="pt-2">
          <button
            onClick={handleRetry}
            id="calendar-retry-btn"
            className="px-6 py-2.5 rounded-xl bg-[#964223] hover:bg-[#7D351B] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // 2. Loading Skeleton State
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="editorial-card p-6 sm:p-10 space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-[#EAE2D5]">
            <div className="space-y-2">
              <div className="h-4 w-32 bg-[#EAE2D5] rounded-md"></div>
              <div className="h-8 w-56 bg-[#EAE2D5] rounded-lg"></div>
              <div className="h-3 w-80 bg-[#EAE2D5] rounded-md"></div>
            </div>
            <div className="h-10 w-36 bg-[#EAE2D5] rounded-xl"></div>
          </div>
          <div className="h-10 bg-[#EAE2D5] rounded-xl"></div>
        </div>

        {/* Calendar Skeleton */}
        <div className="editorial-card p-6 space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-[#EAE2D5]">
            <div className="h-7 w-48 bg-[#EAE2D5] rounded-md"></div>
            <div className="h-9 w-32 bg-[#EAE2D5] rounded-xl"></div>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-24 bg-[#FAF7F2] border border-[#EAE2D5] rounded-xl p-2">
                <div className="h-4 w-4 bg-[#EAE2D5] rounded-full mb-2"></div>
                {i % 4 === 0 && <div className="h-4 bg-[#EAE2D5] rounded-md w-full"></div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. PAGE HEADER */}
      <div className="editorial-card p-6 sm:p-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAE2D5]">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#964223] mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multi-City Timeline</span>
            </div>
            <h1 className="font-serif-heading text-3xl sm:text-4xl font-bold text-[#2C221E] tracking-tight">
              Calendar View
            </h1>
            <p className="text-xs sm:text-sm text-[#6B5E55] mt-1">
              Visualize your journeys, trips, and planned activities across time.
            </p>
          </div>

          <Link
            to="/trips/new"
            id="calendar-plan-trip-btn"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#964223] hover:bg-[#7D351B] text-white text-xs font-bold shadow-xs transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Plan New Trip</span>
          </Link>
        </div>

        {/* 2. CALENDAR TOOLBAR */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 pt-1">
          {/* Search Bar */}
          <div className="sm:col-span-2 lg:col-span-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8F8175]">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              id="calendar-search-input"
              placeholder="Search trips, cities or activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 bg-[#FAF7F2] border border-[#E0D7C8] rounded-xl text-xs text-[#2C221E] placeholder-[#8F8175] focus:outline-hidden focus:ring-2 focus:ring-[#964223]/30 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8F8175] hover:text-[#2C221E]"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Group By Control */}
          <div className="sm:col-span-1 lg:col-span-3 flex items-center gap-2 bg-[#FAF7F2] border border-[#E0D7C8] rounded-xl p-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8F8175] pl-2 shrink-0 flex items-center gap-1">
              <Layers className="w-3 h-3" />
              <span>Group:</span>
            </span>
            <div className="flex items-center gap-1 w-full">
              {(['trip', 'city', 'activity'] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  id={`calendar-group-${opt}`}
                  onClick={() => setGroupBy(opt)}
                  className={`flex-1 py-1 px-2 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                    groupBy === opt
                      ? 'bg-white text-[#964223] shadow-xs border border-[#E3D9CB]'
                      : 'text-[#6B5E55] hover:text-[#2C221E]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Control */}
          <div className="sm:col-span-1 lg:col-span-3 flex items-center gap-2 bg-[#FAF7F2] border border-[#E0D7C8] rounded-xl p-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8F8175] pl-2 shrink-0 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              <span>Filter:</span>
            </span>
            <select
              id="calendar-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilterOption)}
              className="w-full bg-transparent text-xs font-bold text-[#2C221E] focus:outline-hidden py-1 pr-2 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="upcoming">Upcoming</option>
              <option value="planning">Planning</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Sort Control */}
          <div className="sm:col-span-2 lg:col-span-2 flex items-center gap-2 bg-[#FAF7F2] border border-[#E0D7C8] rounded-xl p-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8F8175] pl-2 shrink-0 flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3" />
              <span>Sort:</span>
            </span>
            <select
              id="calendar-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortByOption)}
              className="w-full bg-transparent text-xs font-bold text-[#2C221E] focus:outline-hidden py-1 pr-2 cursor-pointer"
            >
              <option value="startDate">Start Date</option>
              <option value="endDate">End Date</option>
              <option value="title">Trip Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. MAIN CALENDAR CARD OR GLOBAL EMPTY STATE */}
      {trips.length === 0 ? (
        <div className="editorial-card p-16 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#F0EAE1] text-[#964223] flex items-center justify-center mx-auto">
            <Luggage className="w-8 h-8" />
          </div>
          <h2 className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#2C221E]">
            No journeys scheduled yet.
          </h2>
          <p className="text-xs sm:text-sm text-[#6B5E55] max-w-md mx-auto">
            Create your first trip and it will appear here on your multi-city calendar timeline.
          </p>
          <div className="pt-4">
            <Link
              to="/trips/new"
              id="calendar-empty-plan-trip-cta"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#964223] text-white text-xs font-bold rounded-xl hover:bg-[#7D351B] transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Plan New Trip</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="editorial-card overflow-hidden">
          
          {/* Calendar Header / Navigation */}
          <div className="p-4 sm:p-6 bg-[#FCFAF6] border-b border-[#EAE2D5] flex flex-col sm:flex-row items-center justify-between gap-4">
            
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#F0EAE1] text-[#964223] flex items-center justify-center border border-[#E3D9CB]">
                <CalendarIcon className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-serif-heading text-2xl font-bold text-[#2C221E]">
                  {MONTH_NAMES[currentMonth]} {currentYear}
                </h2>
                <p className="text-[11px] text-[#8F8175]">
                  {events.length} {events.length === 1 ? 'journey segment' : 'journey segments'} visible
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                id="calendar-prev-month-btn"
                aria-label="Previous month"
                className="p-2 rounded-xl bg-[#F0EAE1] hover:bg-[#EAE2D5] text-[#2C221E] transition-colors border border-[#E3D9CB] cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={handleGoToToday}
                id="calendar-today-btn"
                aria-label="Go to today"
                className="px-3.5 py-2 rounded-xl bg-[#F0EAE1] hover:bg-[#EAE2D5] text-[#2C221E] text-xs font-bold transition-colors border border-[#E3D9CB] cursor-pointer"
              >
                Today
              </button>

              <button
                onClick={handleNextMonth}
                id="calendar-next-month-btn"
                aria-label="Next month"
                className="p-2 rounded-xl bg-[#F0EAE1] hover:bg-[#EAE2D5] text-[#2C221E] transition-colors border border-[#E3D9CB] cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar Desktop Grid */}
          <div className="w-full overflow-x-auto">
            <div className="min-w-[768px]">
              
              {/* Weekday Header */}
              <div className="grid grid-cols-7 border-b border-[#EAE2D5] bg-[#F5F1E8]/70 text-center py-2.5">
                {WEEKDAY_NAMES.map((day) => (
                  <div key={day} className="text-[11px] font-bold tracking-wider text-[#8F8175]">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Weeks & Grid */}
              <div className="divide-y divide-[#EAE2D5] bg-[#FCFAF6]">
                {weekRows.map((week, weekIdx) => {
                  const weekSpans = calculateWeekSpans(week, events);

                  return (
                    <div key={weekIdx} className="relative min-h-[120px] flex flex-col justify-between">
                      
                      {/* Background Day Cells Grid */}
                      <div className="grid grid-cols-7 absolute inset-0 divide-x divide-[#EAE2D5] pointer-events-none">
                        {week.map((cell, cellIdx) => (
                          <div
                            key={cellIdx}
                            className={`p-2 transition-colors ${
                              !cell.isCurrentMonth
                                ? 'bg-[#F7F3EB]/60'
                                : cell.isToday
                                ? 'bg-[#964223]/5'
                                : 'bg-transparent'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-xs font-bold leading-none ${
                                  cell.isToday
                                    ? 'w-6 h-6 rounded-full bg-[#964223] text-white flex items-center justify-center shadow-xs'
                                    : !cell.isCurrentMonth
                                    ? 'text-[#B8A99A]'
                                    : 'text-[#2C221E]'
                                }`}
                              >
                                {cell.dayNumber}
                              </span>
                              {cell.isToday && (
                                <span className="text-[9px] font-bold text-[#964223] uppercase tracking-wider hidden xl:inline">
                                  Today
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Foreground Event Spans Container */}
                      <div className="relative z-10 pt-8 pb-2 px-1 space-y-1.5 min-h-[110px]">
                        {weekSpans.length === 0 ? (
                          <div className="h-6" /> // spacer
                        ) : (
                          weekSpans.map((spanItem, spanIdx) => {
                            const { event, startIndex, span, isStartEdge, isEndEdge } = spanItem;
                            const gridColStart = startIndex + 1;

                            // Dynamic badge style based on event type
                            const badgeColorClass =
                              event.type === 'trip'
                                ? 'bg-[#964223] hover:bg-[#7D351B] text-white border-[#7D351B]'
                                : event.type === 'city'
                                ? 'bg-[#3D5A5E] hover:bg-[#2C4447] text-white border-[#2C4447]'
                                : 'bg-[#39634C] hover:bg-[#2A4B39] text-white border-[#2A4B39]';

                            return (
                              <div
                                key={`${event.id}-${weekIdx}-${spanIdx}`}
                                className="grid grid-cols-7 gap-0"
                              >
                                <div
                                  style={{ gridColumn: `${gridColStart} / span ${span}` }}
                                  className="px-1"
                                >
                                  <button
                                    onClick={() => setSelectedEvent(event)}
                                    id={`calendar-event-bar-${event.id}`}
                                    className={`w-full group text-left px-2.5 py-1.5 rounded-lg transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer flex items-center justify-between gap-2 border ${
                                      isStartEdge ? 'rounded-l-lg' : 'rounded-l-none border-l-0'
                                    } ${
                                      isEndEdge ? 'rounded-r-lg' : 'rounded-r-none border-r-0'
                                    } ${badgeColorClass}`}
                                    title={`${event.title} (${event.startDate} to ${event.endDate})`}
                                  >
                                    <div className="flex items-center gap-1.5 truncate">
                                      {event.type === 'trip' && <Luggage className="w-3 h-3 text-[#F5F1E8] shrink-0" />}
                                      {event.type === 'city' && <MapPin className="w-3 h-3 text-[#F5F1E8] shrink-0" />}
                                      {event.type === 'activity' && <Tag className="w-3 h-3 text-[#F5F1E8] shrink-0" />}
                                      <span className="text-xs font-bold truncate tracking-wide">
                                        {event.title}
                                      </span>
                                    </div>

                                    {event.subtitle && span > 1 && (
                                      <span className="text-[10px] text-white/80 font-medium truncate hidden md:inline">
                                        {event.subtitle}
                                      </span>
                                    )}
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Empty State when no events match filter or search */}
          {events.length === 0 && (
            <div className="p-12 text-center space-y-4 bg-[#FCFAF6] border-t border-[#EAE2D5]">
              <div className="w-14 h-14 rounded-2xl bg-[#F0EAE1] text-[#964223] flex items-center justify-center mx-auto">
                <CalendarIcon className="w-7 h-7" />
              </div>
              <h3 className="font-serif-heading text-xl font-bold text-[#2C221E]">
                No journeys match your search.
              </h3>
              <p className="text-xs text-[#6B5E55] max-w-sm mx-auto">
                Try adjusting your search query, group by, or status filter to view planned multi-city routes.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setGroupBy('trip');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#F0EAE1] hover:bg-[#EAE2D5] text-[#2C221E] text-xs font-bold transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
                <Link
                  to="/trips/new"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#964223] text-white text-xs font-bold rounded-xl hover:bg-[#7D351B] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Plan New Trip</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. EVENT QUICK PREVIEW MODAL */}
      {selectedEvent && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="calendar-modal-title"
        >
          <div className="editorial-card w-full max-w-lg overflow-hidden shadow-2xl space-y-0 relative animate-in zoom-in-95 duration-200">
            
            {/* Header Image */}
            <div className="relative h-44 w-full bg-[#1E140F]">
              <img
                src={selectedEvent.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80'}
                alt={selectedEvent.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors cursor-pointer"
                aria-label="Close details"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute bottom-3 left-4 right-4 text-white">
                <span className="px-2.5 py-0.5 rounded-md bg-[#964223] text-white text-[10px] font-bold uppercase tracking-wider inline-block mb-1">
                  {selectedEvent.type} Segment
                </span>
                <h3 id="calendar-modal-title" className="font-serif-heading text-2xl font-bold leading-tight">
                  {selectedEvent.title}
                </h3>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 bg-[#FCFAF6]">
              
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#EAE2D5] text-xs">
                <div className="flex items-center gap-1.5 text-[#6B5E55]">
                  <Clock className="w-4 h-4 text-[#964223]" />
                  <span className="font-bold text-[#2C221E]">
                    {selectedEvent.startDate} &rarr; {selectedEvent.endDate}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F0EAE1] text-[#2C221E] font-bold capitalize text-[11px] border border-[#E3D9CB]">
                  <span className="w-2 h-2 rounded-full bg-[#964223]"></span>
                  <span>{selectedEvent.status}</span>
                </div>
              </div>

              {selectedEvent.cities && selectedEvent.cities.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8F8175] block mb-1.5">
                    Cities Included:
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {selectedEvent.cities.map((city, idx) => (
                      <React.Fragment key={idx}>
                        <span className="px-2.5 py-1 rounded-lg bg-[#F0EAE1] text-[#2C221E] text-xs font-semibold border border-[#E3D9CB]">
                          {city}
                        </span>
                        {idx < selectedEvent.cities!.length - 1 && (
                          <span className="text-[#8F8175] text-xs">&rarr;</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}

              {activeTripDetails && (
                <div className="pt-2 space-y-2">
                  <p className="text-xs text-[#6B5E55] leading-relaxed">
                    {activeTripDetails.description}
                  </p>

                  <div className="flex items-center justify-between text-xs pt-2">
                    <span className="text-[#8F8175]">Total Journey Budget:</span>
                    <span className="font-bold text-[#2C221E]">
                      {formatCurrentCurrency(convertCostToCurrentCurrency(activeTripDetails.totalBudget || 0, activeTripDetails.currency))}
                    </span>
                  </div>
                </div>
              )}

              {/* Footer CTA */}
              <div className="pt-4 border-t border-[#EAE2D5] flex items-center justify-end gap-3">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#6B5E55] hover:bg-[#F0EAE1] transition-colors cursor-pointer"
                >
                  Close
                </button>

                <button
                  onClick={() => {
                    const tripId = selectedEvent.tripId;
                    setSelectedEvent(null);
                    navigate(`/builder?tripId=${tripId}`);
                  }}
                  id="calendar-open-builder-btn"
                  className="px-5 py-2.5 rounded-xl bg-[#964223] hover:bg-[#7D351B] text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <span>Open Itinerary Builder</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
