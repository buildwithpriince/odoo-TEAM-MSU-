import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  MapPin, 
  Calendar, 
  ArrowRight, 
  DollarSign, 
  Compass, 
  Sparkles, 
  Navigation,
  Luggage,
  Copy,
  Trash2,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Layers
} from 'lucide-react';
import { useTrip } from '../context/TripContext';
import { useAuth } from '../context/AuthContext';
import { DynamicDestinationHero } from '../components/DynamicDestinationHero';
import { POPULAR_DESTINATIONS } from '../data/mockData';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { trips, deleteTrip, duplicateTrip } = useTrip();
  const navigate = useNavigate();

  const totalStops = trips.reduce((sum, t) => sum + (t.stops?.length || 0), 0);
  const totalBudgeted = trips.reduce((sum, t) => sum + (t.totalBudget || 0), 0);

  const calculateDays = () => {
    let totalDays = 0;
    trips.forEach(t => {
      if (t.startDate && t.endDate) {
        const diff = new Date(t.endDate).getTime() - new Date(t.startDate).getTime();
        const days = Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
        totalDays += days;
      }
    });
    return totalDays || 18;
  };

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
    if (window.confirm('Are you sure you want to remove this trip?')) {
      deleteTrip(id);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      
      {/* Dynamic Destination Hero Spotlight */}
      <section>
        <DynamicDestinationHero />
      </section>

      {/* Travel Stats Strip */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="editorial-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8F8175]">Active Journeys</span>
            <div className="w-8 h-8 rounded-xl bg-[#F0EAE1] flex items-center justify-center text-[#964223]">
              <Luggage className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif-heading text-3xl font-bold text-[#2C221E]">{trips.length}</p>
          <p className="text-xs text-[#8F8175] mt-0.5">Across diverse territories</p>
        </div>

        <div className="editorial-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8F8175]">City Stops</span>
            <div className="w-8 h-8 rounded-xl bg-[#EBE7DF] flex items-center justify-center text-[#4A6B70]">
              <Navigation className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif-heading text-3xl font-bold text-[#2C221E]">{totalStops}</p>
          <p className="text-xs text-[#8F8175] mt-0.5">Multi-leg destinations</p>
        </div>

        <div className="editorial-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8F8175]">Planned Days</span>
            <div className="w-8 h-8 rounded-xl bg-[#E8EFE9] flex items-center justify-center text-[#3F6E54]">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif-heading text-3xl font-bold text-[#2C221E]">{calculateDays()}</p>
          <p className="text-xs text-[#8F8175] mt-0.5">Days of exploration</p>
        </div>

        <div className="editorial-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8F8175]">Target Budget</span>
            <div className="w-8 h-8 rounded-xl bg-[#F4EBE3] flex items-center justify-center text-[#C85A32]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="font-serif-heading text-3xl font-bold text-[#2C221E]">${totalBudgeted.toLocaleString()}</p>
          <p className="text-xs text-[#8F8175] mt-0.5">Tracked & synchronized</p>
        </div>
      </section>

      {/* Your Current Journeys Section */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-1 border-b border-[#EAE2D5]">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#964223]">Itinerary Management</span>
            <h2 className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#2C221E] mt-0.5">
              Your Current Journeys
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              to="/trips/new"
              id="dashboard-create-journey-btn"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#964223] hover:bg-[#7D351B] text-[#FAF7F2] text-xs font-bold transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Journey</span>
            </Link>
            <Link 
              to="/trips" 
              id="view-all-trips-link"
              className="text-xs font-bold text-[#964223] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {trips.length === 0 ? (
          <div className="editorial-card p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-[#F0EAE1] text-[#964223] flex items-center justify-center mx-auto">
              <Luggage className="w-8 h-8" />
            </div>
            <h3 className="font-serif-heading text-xl font-bold text-[#2C221E]">No journeys planned yet</h3>
            <p className="text-sm text-[#6B5E55] max-w-md mx-auto">
              Select a featured destination above or create your custom multi-city itinerary from scratch.
            </p>
            <Link
              to="/trips/new"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#964223] text-white text-xs font-bold"
            >
              <Plus className="w-4 h-4" />
              <span>Start Planning Your First Trip</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {trips.map((trip) => {
              const actualSpent = (trip.budgetItems || []).reduce((s, b) => s + (b.actualCost || 0), 0);
              const totalEst = (trip.budgetItems || []).reduce((s, b) => s + (b.estimatedCost || 0), 0);
              const effectiveCost = actualSpent > 0 ? actualSpent : totalEst;
              const budgetPercent = Math.min(100, Math.round((effectiveCost / (trip.totalBudget || 1)) * 100));

              return (
                <div 
                  key={trip.id}
                  id={`trip-card-${trip.id}`}
                  className="editorial-card-hover group overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {/* Card Cover */}
                    <div className="relative h-52 w-full overflow-hidden bg-[#1E140F]">
                      <img
                        src={trip.coverImage}
                        alt={trip.title}
                        className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      
                      {/* Top Badges */}
                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                        <span className="px-3 py-1 rounded-lg bg-black/50 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-wider border border-white/20">
                          {trip.travelVibe || 'Multi-City Route'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => handleDuplicate(e, trip.id)}
                            title="Duplicate journey"
                            className="p-2 rounded-lg bg-black/40 hover:bg-black/70 backdrop-blur-md text-white/90 transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, trip.id)}
                            title="Delete journey"
                            className="p-2 rounded-lg bg-black/40 hover:bg-rose-950/80 backdrop-blur-md text-white/90 hover:text-rose-300 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Bottom Title inside Image */}
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <h3 className="font-serif-heading text-xl sm:text-2xl font-bold leading-snug drop-shadow-xs">
                          {trip.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-white/80 mt-1">
                          <Calendar className="w-3.5 h-3.5 text-amber-300" />
                          <span>{trip.startDate} &rarr; {trip.endDate}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 space-y-4">
                      {/* Multi-City Sequence */}
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8F8175] block mb-2">
                          Multi-City Stops ({trip.stops?.length || 0})
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                          {trip.stops?.map((stop, sIdx) => (
                            <React.Fragment key={stop.id || sIdx}>
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#F0EAE1] text-[#2C221E] text-xs font-semibold border border-[#E3D9CB]">
                                <MapPin className="w-3 h-3 text-[#964223]" />
                                {stop.cityName}
                              </span>
                              {sIdx < (trip.stops?.length || 0) - 1 && (
                                <span className="text-[#8F8175] text-xs font-bold">&rarr;</span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-[#6B5E55] line-clamp-2 leading-relaxed">
                        {trip.description}
                      </p>

                      {/* Budget Tracker Progress */}
                      <div className="pt-2 border-t border-[#EAE2D5] space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#8F8175] font-medium">Budget Tracked:</span>
                          <span className="font-semibold text-[#2C221E]">
                            ${effectiveCost.toLocaleString()} / <span className="text-[#8F8175]">${trip.totalBudget?.toLocaleString()}</span>
                          </span>
                        </div>
                        <div className="w-full h-2 bg-[#EBE4D5] rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              budgetPercent > 90 ? 'bg-amber-600' : 'bg-[#964223]'
                            }`}
                            style={{ width: `${budgetPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="p-6 pt-0 flex items-center justify-between gap-3">
                    <Link
                      to={`/budget?tripId=${trip.id}`}
                      id={`trip-budget-btn-${trip.id}`}
                      className="px-4 py-2.5 rounded-xl bg-[#F0EAE1] hover:bg-[#EAE2D5] text-[#2C221E] text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <DollarSign className="w-3.5 h-3.5 text-[#964223]" />
                      <span>Budget Breakdown</span>
                    </Link>

                    <Link
                      to={`/builder?tripId=${trip.id}`}
                      id={`trip-builder-btn-${trip.id}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#964223] hover:bg-[#7D351B] text-white text-xs font-bold transition-all shadow-xs"
                    >
                      <span>Open Itinerary Builder</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Curated Multi-City Circuit Ideas */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#964223]">Inspiration</span>
            <h2 className="font-serif-heading text-2xl font-bold text-[#2C221E] mt-0.5">
              Popular Multi-City Circuits
            </h2>
            <p className="text-xs text-[#8F8175]">Handcrafted journey routes with optimal train & scenic links</p>
          </div>
          <Link
            to="/explore"
            className="text-xs font-bold text-[#964223] hover:underline flex items-center gap-1"
          >
            <span>Explore All Cities</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {POPULAR_DESTINATIONS.slice(0, 3).map((dest) => (
            <div 
              key={dest.id}
              className="editorial-card-hover p-5 flex flex-col justify-between"
            >
              <div>
                <div className="relative h-36 rounded-2xl overflow-hidden mb-4">
                  <img 
                    src={dest.image} 
                    alt={dest.name}
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <span className="absolute bottom-2.5 left-3 text-white font-serif-heading font-bold text-base">
                    {dest.name} Circuit
                  </span>
                  <span className="absolute top-2.5 right-3 px-2 py-0.5 rounded-md bg-black/50 text-white text-[10px] font-bold">
                    ${dest.averageDailyCost}/day
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8F8175]">
                    Suggested Multi-Stop Trail:
                  </span>
                  <p className="text-xs font-semibold text-[#2C221E]">
                    {(dest.curatedStops || [dest.name]).join(' → ')}
                  </p>
                  <p className="text-xs text-[#6B5E55] line-clamp-2 leading-relaxed">
                    {dest.tagline}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[#EAE2D5] flex items-center justify-between">
                <span className="text-[11px] text-[#8F8175]">
                  Best season: <span className="font-semibold text-[#2C221E]">{dest.popularSeason.split(' ')[0]}</span>
                </span>
                <Link
                  to={`/trips/new?destId=${dest.id}`}
                  className="px-3.5 py-1.5 rounded-xl bg-[#964223] text-white text-xs font-bold hover:bg-[#7D351B] transition-colors"
                >
                  Plan Circuit
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
