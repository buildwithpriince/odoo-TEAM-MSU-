import React from 'react';
import { Link } from 'react-router-dom';
import { Trip } from '../../types';
import { ProfileTripCard } from './ProfileTripCard';
import { 
  Luggage, 
  Plus, 
  ArrowRight, 
  Sparkles, 
  Compass, 
  CheckCircle2, 
  Calendar 
} from 'lucide-react';

interface ProfileTripSectionProps {
  title: string;
  subtitle: string;
  type: 'upcoming' | 'completed';
  trips: Trip[];
  maxDisplay?: number;
}

export const ProfileTripSection: React.FC<ProfileTripSectionProps> = ({
  title,
  subtitle,
  type,
  trips,
  maxDisplay = 6
}) => {
  const displayedTrips = trips.slice(0, maxDisplay);
  const hasMore = trips.length > maxDisplay;

  return (
    <section className="space-y-4">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-2 border-b border-[#EAE2D5]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif-heading text-2xl font-bold text-[#2C221E]">
              {title}
            </h2>
            <span className="text-xs font-bold text-[#8F8175] bg-[#F0EAE1] px-2.5 py-0.5 rounded-full">
              {trips.length}
            </span>
          </div>
          <p className="text-xs text-[#6B5E55] mt-0.5">{subtitle}</p>
        </div>

        {trips.length > 0 && (
          <Link
            to="/trips"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#964223] hover:underline self-start sm:self-auto"
          >
            <span>View all in My Trips</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Grid or Empty State */}
      {trips.length === 0 ? (
        <div className="editorial-card p-8 sm:p-10 text-center space-y-4 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-[#F0EAE1] text-[#964223] flex items-center justify-center mx-auto shadow-xs">
            {type === 'upcoming' ? (
              <Luggage className="w-6 h-6" />
            ) : (
              <CheckCircle2 className="w-6 h-6" />
            )}
          </div>

          <div className="space-y-1">
            <h3 className="font-serif-heading text-lg font-bold text-[#2C221E]">
              {type === 'upcoming'
                ? 'No upcoming journeys yet'
                : 'No completed journeys yet'}
            </h3>
            <p className="text-xs text-[#6B5E55] max-w-sm mx-auto">
              {type === 'upcoming'
                ? 'Start planning your next multi-city route and customize daily activities.'
                : 'Your travel history will appear here once your journeys reach completion.'}
            </p>
          </div>

          {type === 'upcoming' && (
            <div className="pt-2">
              <Link
                to="/trips/new"
                id="profile-empty-plan-trip-btn"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl btn-glass-primary text-xs font-bold shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Plan New Journey</span>
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedTrips.map((trip) => (
            <ProfileTripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}

      {/* View All Button if more */}
      {hasMore && (
        <div className="pt-2 text-center">
          <Link
            to="/trips"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#D9CBBA] bg-white hover:bg-[#F5F1E8] text-[#2C221E] text-xs font-bold transition-all shadow-xs"
          >
            <span>View All {trips.length} {title}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

    </section>
  );
};
