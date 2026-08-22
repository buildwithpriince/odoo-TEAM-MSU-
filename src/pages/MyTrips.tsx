import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Luggage, 
  MapPin, 
  Calendar, 
  Plus, 
  DollarSign, 
  Copy, 
  Trash2, 
  ArrowRight, 
  Search,
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useTrip } from '../context/TripContext';
import { useCurrency } from '../context/CurrencyContext';
import { Trip } from '../types';

export const MyTrips: React.FC = () => {
  const { trips, deleteTrip, duplicateTrip } = useTrip();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'planning' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTrips = trips.filter((trip) => {
    const matchesStatus = statusFilter === 'all' || trip.status === statusFilter;
    const matchesSearch = 
      trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (trip.stops || []).some(s => s.cityName.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  const handleDuplicate = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const cloned = duplicateTrip(id);
    if (cloned) {
      navigate(`/builder?tripId=${cloned.id}`);
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this journey?')) {
      deleteTrip(id);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="editorial-card p-6 sm:p-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAE2D5]">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#964223] mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multi-City Portfolio</span>
            </div>
            <h1 className="font-serif-heading text-3xl sm:text-4xl font-bold text-[#2C221E] tracking-tight">
              My Journeys & Itineraries
            </h1>
            <p className="text-xs sm:text-sm text-[#6B5E55] mt-1">
              Manage your active expeditions, past explorations, and upcoming multi-city routes.
            </p>
          </div>

          <Link
            to="/trips/new"
            id="my-trips-new-trip-cta"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#964223] hover:bg-[#7D351B] text-white text-xs font-bold shadow-xs transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Plan New Journey</span>
          </Link>
        </div>

        {/* Filter Tabs & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 bg-[#F0EAE1]/80 p-1.5 rounded-xl border border-[#E3D9CB] w-full sm:w-auto">
            {(['all', 'upcoming', 'planning', 'completed'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                  statusFilter === status
                    ? 'bg-[#FCFAF6] text-[#2C221E] shadow-2xs'
                    : 'text-[#6B5E55] hover:text-[#2C221E]'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8F8175]">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              placeholder="Filter by trip or city name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-[#FAF7F2] border border-[#E0D7C8] rounded-xl text-xs text-[#2C221E] placeholder-[#8F8175] focus:outline-hidden focus:ring-2 focus:ring-[#964223]/30"
            />
          </div>
        </div>
      </div>

      {/* Trips Grid */}
      {filteredTrips.length === 0 ? (
        <div className="editorial-card p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#F0EAE1] text-[#964223] flex items-center justify-center mx-auto">
            <Luggage className="w-7 h-7" />
          </div>
          <h3 className="font-serif-heading text-xl font-bold text-[#2C221E]">
            No journeys match your criteria
          </h3>
          <p className="text-xs text-[#6B5E55] max-w-sm mx-auto">
            Try adjusting your search query or create a fresh multi-destination journey.
          </p>
          <Link
            to="/trips/new"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#964223] text-white text-xs font-bold rounded-xl"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Plan New Journey</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => {
            const actualSpent = (trip.budgetItems || []).reduce((s, b) => s + (b.actualCost || 0), 0);
            const totalEst = (trip.budgetItems || []).reduce((s, b) => s + (b.estimatedCost || 0), 0);
            const cost = actualSpent > 0 ? actualSpent : totalEst;

            return (
              <div
                key={trip.id}
                id={`my-trip-card-${trip.id}`}
                className="editorial-card-hover group flex flex-col justify-between overflow-hidden"
              >
                <div>
                  {/* Cover */}
                  <div className="relative h-48 w-full overflow-hidden bg-[#1E140F]">
                    <img
                      src={trip.coverImage}
                      alt={trip.title}
                      className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-md bg-black/50 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                        {trip.travelVibe || 'Journey'}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => handleDuplicate(e, trip.id)}
                          title="Duplicate journey"
                          className="p-1.5 rounded-md bg-black/50 hover:bg-black/80 text-white/90 transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, trip.id)}
                          title="Delete journey"
                          className="p-1.5 rounded-md bg-black/50 hover:bg-rose-950/80 text-white/90 hover:text-rose-300 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h3 className="font-serif-heading text-xl font-bold leading-tight">
                        {trip.title}
                      </h3>
                      <p className="text-[11px] text-white/80 mt-0.5">
                        {trip.startDate} &rarr; {trip.endDate}
                      </p>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 space-y-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8F8175] block mb-1.5">
                        Multi-City Route:
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {trip.stops?.map((s, idx) => (
                          <React.Fragment key={s.id || idx}>
                            <span className="px-2 py-0.5 rounded-md bg-[#F0EAE1] text-[#2C221E] text-[11px] font-semibold border border-[#E3D9CB]">
                              {s.cityName}
                            </span>
                            {idx < (trip.stops?.length || 0) - 1 && (
                              <span className="text-[#8F8175] text-[10px]">&rarr;</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-[#6B5E55] line-clamp-2 leading-relaxed">
                      {trip.description}
                    </p>

                    <div className="pt-2 border-t border-[#EAE2D5] flex items-center justify-between text-xs">
                      <span className="text-[#8F8175]">Budget:</span>
                      <span className="font-bold text-[#2C221E]">
                        {formatPrice(cost)} / {formatPrice(trip.totalBudget || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-5 pt-0 flex items-center justify-between gap-2 border-t border-[#EAE2D5] mt-2 pt-3">
                  <Link
                    to={`/budget?tripId=${trip.id}`}
                    className="px-3 py-1.5 rounded-xl bg-[#F0EAE1] hover:bg-[#EAE2D5] text-[#2C221E] text-[11px] font-bold transition-colors flex items-center gap-1"
                  >
                    <DollarSign className="w-3 h-3 text-[#964223]" />
                    <span>Budget</span>
                  </Link>

                  <Link
                    to={`/builder?tripId=${trip.id}`}
                    className="px-3.5 py-1.5 rounded-xl bg-[#964223] text-white text-[11px] font-bold hover:bg-[#7D351B] transition-colors flex items-center gap-1"
                  >
                    <span>Builder</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
