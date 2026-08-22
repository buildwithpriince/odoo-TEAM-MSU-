import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trip } from '../../types';
import { 
  MapPin, 
  Calendar, 
  ArrowRight, 
  DollarSign, 
  Luggage,
  Sparkles,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

interface ProfileTripCardProps {
  trip: Trip;
}

export const ProfileTripCard: React.FC<ProfileTripCardProps> = ({ trip }) => {
  const { formatCurrentCurrency, convertCostToCurrentCurrency } = useCurrency();
  const [imageError, setImageError] = useState(false);

  // Derive duration in days
  const durationDays = React.useMemo(() => {
    if (!trip.startDate || !trip.endDate) return 1;
    const diff = new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime();
    return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
  }, [trip.startDate, trip.endDate]);

  // Derive status badge styling
  const getStatusBadge = (status: Trip['status']) => {
    switch (status) {
      case 'completed':
        return {
          label: 'Completed',
          className: 'bg-emerald-100/90 text-emerald-900 border-emerald-300',
          icon: CheckCircle2
        };
      case 'upcoming':
        return {
          label: 'Upcoming',
          className: 'bg-amber-100/90 text-amber-900 border-amber-300',
          icon: Calendar
        };
      case 'planning':
      default:
        return {
          label: 'In Planning',
          className: 'bg-[#964223]/10 text-[#964223] border-[#964223]/25',
          icon: Sparkles
        };
    }
  };

  const statusBadge = getStatusBadge(trip.status);
  const StatusIcon = statusBadge.icon;

  const fallbackImage = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80';
  const coverSrc = imageError ? fallbackImage : (trip.coverImage || trip.stops?.[0]?.coverImage || fallbackImage);

  // Format date display
  const formatDateRange = () => {
    if (!trip.startDate) return 'Dates in planning';
    try {
      const start = new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      if (!trip.endDate) return start;
      const end = new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return `${start} → ${end}`;
    } catch {
      return `${trip.startDate} - ${trip.endDate}`;
    }
  };

  return (
    <article className="editorial-card-hover rounded-2xl overflow-hidden flex flex-col group transition-all duration-300">
      
      {/* Cover Image */}
      <div className="relative h-44 w-full overflow-hidden shrink-0 bg-[#EAE2D5]">
        <img
          src={coverSrc}
          alt={trip.title}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md shadow-xs ${statusBadge.className}`}>
            <StatusIcon className="w-3 h-3" />
            {statusBadge.label}
          </span>
        </div>

        {/* Overlay Duration & Cities */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[11px] font-semibold drop-shadow-md">
          <span className="bg-black/40 backdrop-blur-md px-2.5 py-0.5 rounded-md border border-white/20">
            {durationDays} {durationDays === 1 ? 'Day' : 'Days'}
          </span>
          <span className="bg-black/40 backdrop-blur-md px-2.5 py-0.5 rounded-md border border-white/20">
            {trip.stops?.length || 0} {(trip.stops?.length || 0) === 1 ? 'City' : 'Cities'}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        
        <div className="space-y-2.5">
          {/* Trip Title */}
          <h3 className="font-serif-heading text-lg font-bold text-[#2C221E] group-hover:text-[#964223] transition-colors leading-snug line-clamp-1">
            {trip.title}
          </h3>

          {/* Connected Route Circuit */}
          {trip.stops && trip.stops.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1">
              {trip.stops.slice(0, 3).map((stop, sIdx) => (
                <React.Fragment key={stop.id || `${stop.cityName}-${sIdx}`}>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#FAF7F2] border border-[#EAE2D5] text-[10px] font-bold text-[#2C221E]">
                    <MapPin className="w-2.5 h-2.5 text-[#964223]" />
                    {stop.cityName}
                  </span>
                  {sIdx < Math.min(trip.stops.length, 3) - 1 && (
                    <span className="text-[#964223] text-[10px] font-bold">&rarr;</span>
                  )}
                </React.Fragment>
              ))}
              {trip.stops.length > 3 && (
                <span className="text-[10px] font-bold text-[#8F8175]">
                  +{trip.stops.length - 3} more
                </span>
              )}
            </div>
          ) : (
            <p className="text-[11px] text-[#8F8175] italic">Route in planning</p>
          )}

          {/* Date Range */}
          <div className="flex items-center gap-1.5 text-[11px] text-[#6B5E55] pt-0.5">
            <Calendar className="w-3.5 h-3.5 text-[#8F8175]" />
            <span>{formatDateRange()}</span>
          </div>
        </div>

        {/* Card Footer */}
        <div className="pt-3 border-t border-[#F0EAE1] flex items-center justify-between gap-2">
          <div className="text-xs">
            <span className="text-[10px] text-[#8F8175] block uppercase tracking-wider font-semibold">Budget</span>
            <span className="font-serif-heading font-bold text-[#2C221E]">
              {formatCurrentCurrency(convertCostToCurrentCurrency(trip.totalBudget || 0, trip.currency))}
            </span>
          </div>

          <Link
            to={`/builder?tripId=${trip.id}`}
            id={`profile-view-trip-${trip.id}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#F0EAE1] hover:bg-[#964223] text-[#2C221E] hover:text-white text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            <span>View Itinerary</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

      </div>

    </article>
  );
};
