import React, { useState } from 'react';
import { CommunityTrip } from '../../types/community';
import { 
  X, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Copy, 
  Share2, 
  Clock, 
  Sparkles, 
  Utensils, 
  Compass, 
  Check,
  Luggage,
  Layers,
  ArrowRight
} from 'lucide-react';
import { ActivityCategory } from '../../types';

interface CommunityJourneyModalProps {
  trip: CommunityTrip | null;
  isOpen: boolean;
  onClose: () => void;
  onCopyTrip: (trip: CommunityTrip) => void;
  onShareTrip: (trip: CommunityTrip) => void;
}

export const CommunityJourneyModal: React.FC<CommunityJourneyModalProps> = ({
  trip,
  isOpen,
  onClose,
  onCopyTrip,
  onShareTrip
}) => {
  const [selectedStopIdx, setSelectedStopIdx] = useState(0);

  if (!isOpen || !trip) return null;

  const activeStop = trip.stops?.[selectedStopIdx] || trip.stops?.[0];

  const getCategoryBadge = (category: ActivityCategory) => {
    switch (category) {
      case 'dining':
        return { label: 'Dining', bg: 'bg-amber-100/80 text-amber-900 border-amber-200' };
      case 'transport':
        return { label: 'Transit', bg: 'bg-sky-100/80 text-sky-900 border-sky-200' };
      case 'leisure':
        return { label: 'Leisure', bg: 'bg-emerald-100/80 text-emerald-900 border-emerald-200' };
      case 'lodging':
        return { label: 'Lodging', bg: 'bg-purple-100/80 text-purple-900 border-purple-200' };
      case 'sightseeing':
      default:
        return { label: 'Sightseeing', bg: 'bg-[#F0EAE1] text-[#964223] border-[#E3D9CB]' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div 
        className="relative bg-[#FCFAF6] border border-[#EAE2D5] rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col z-10 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="journey-modal-title"
      >
        
        {/* Modal Header Cover */}
        <div className="relative h-48 sm:h-56 w-full shrink-0 overflow-hidden">
          <img
            src={trip.coverImage}
            alt={trip.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white flex items-center justify-center transition-all cursor-pointer border border-white/20"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Title and Traveler Overlay */}
          <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <span className="bg-[#964223] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px]">
                {trip.travelVibe || 'Shared Journey'}
              </span>
              <span>•</span>
              <span>Planned by {trip.traveler.name}</span>
            </div>
            <h2 id="journey-modal-title" className="font-serif-heading text-xl sm:text-2xl font-bold leading-tight">
              {trip.title}
            </h2>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 p-3.5 bg-[#F9F6F0] rounded-2xl border border-[#EAE2D5] text-center text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8F8175] block">Duration</span>
              <p className="font-serif-heading text-base font-bold text-[#2C221E] mt-0.5">{trip.durationDays} Days</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8F8175] block">Destinations</span>
              <p className="font-serif-heading text-base font-bold text-[#2C221E] mt-0.5">{trip.stopsCount} Cities</p>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8F8175] block">Est. Budget</span>
              <p className="font-serif-heading text-base font-bold text-[#964223] mt-0.5">${trip.totalBudget.toLocaleString()}</p>
            </div>
          </div>

          {/* Description */}
          {trip.description && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8F8175]">About This Journey</span>
              <p className="text-xs sm:text-sm text-[#6B5E55] leading-relaxed italic bg-white p-3.5 rounded-xl border border-[#EAE2D5]/70">
                "{trip.description}"
              </p>
            </div>
          )}

          {/* City Stop Tabs */}
          {trip.stops && trip.stops.length > 0 && (
            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8F8175] block">
                Itinerary Destination Stops
              </span>
              
              <div className="flex gap-2 overflow-x-auto pb-1">
                {trip.stops.map((stop, idx) => (
                  <button
                    key={stop.id || idx}
                    onClick={() => setSelectedStopIdx(idx)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                      selectedStopIdx === idx
                        ? 'bg-[#964223] text-white border-[#964223] shadow-xs'
                        : 'bg-white text-[#2C221E] border-[#EAE2D5] hover:bg-[#F0EAE1]'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{stop.cityName}</span>
                    {stop.days && stop.days.length > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                        selectedStopIdx === idx ? 'bg-white/20 text-white' : 'bg-[#F0EAE1] text-[#6B5E55]'
                      }`}>
                        {stop.days.reduce((s, d) => s + (d.activities || []).length, 0)} acts
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Active Stop Details */}
              {activeStop && (
                <div className="p-4 bg-white rounded-2xl border border-[#EAE2D5] space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-[#F0EAE1] pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#F0EAE1] text-[#964223] flex items-center justify-center font-bold text-xs">
                        {activeStop.cityName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#2C221E]">{activeStop.cityName}</h4>
                        <p className="text-[11px] text-[#8F8175]">{activeStop.country}</p>
                      </div>
                    </div>

                    {activeStop.arrivalDate && activeStop.departureDate && (
                      <span className="text-[11px] font-semibold text-[#6B5E55] bg-[#F9F6F0] px-2.5 py-1 rounded-lg border border-[#EAE2D5]">
                        {activeStop.arrivalDate} &rarr; {activeStop.departureDate}
                      </span>
                    )}
                  </div>

                  {activeStop.notes && (
                    <p className="text-xs text-[#6B5E55] bg-[#FAF7F2] p-2.5 rounded-xl border border-[#EAE2D5]/60">
                      💡 {activeStop.notes}
                    </p>
                  )}

                  {/* Scheduled Days and Activities */}
                  {activeStop.days && activeStop.days.length > 0 ? (
                    <div className="space-y-3">
                      {activeStop.days.map((day) => (
                        <div key={day.dayNumber} className="space-y-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-[#964223]">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Day {day.dayNumber}: {day.title}</span>
                          </div>

                          <div className="space-y-1.5 pl-2 border-l-2 border-[#EAE2D5]">
                            {day.activities && day.activities.length > 0 ? (
                              day.activities.map((act) => {
                                const badge = getCategoryBadge(act.category);
                                return (
                                  <div 
                                    key={act.id} 
                                    className="p-2.5 rounded-xl bg-[#F9F6F0] border border-[#EAE2D5] flex items-center justify-between text-xs hover:bg-white transition-colors"
                                  >
                                    <div className="space-y-0.5">
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold text-[#2C221E]">{act.title}</span>
                                        <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${badge.bg}`}>
                                          {badge.label}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2 text-[11px] text-[#8F8175]">
                                        {act.time && <span>🕒 {act.time}</span>}
                                        {act.duration && <span>• {act.duration}</span>}
                                      </div>
                                    </div>

                                    <span className="font-bold text-xs text-[#2C221E] shrink-0">
                                      ${act.cost}
                                    </span>
                                  </div>
                                );
                              })
                            ) : (
                              <p className="text-xs text-[#8F8175] italic">No activities planned for this day.</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#8F8175] italic">Full day itinerary details available upon copying trip.</p>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-[#F9F6F0] border-t border-[#EAE2D5] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            onClick={() => onShareTrip(trip)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#D9CBBA] bg-white hover:bg-[#F0EAE1] text-[#2C221E] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
          >
            <Share2 className="w-3.5 h-3.5 text-[#6B5E55]" />
            <span>Share Link</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-[#D9CBBA] text-xs font-bold text-[#6B5E55] hover:bg-white transition-all cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                onCopyTrip(trip);
                onClose();
              }}
              id="modal-copy-trip-btn"
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl btn-glass-primary text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy to My Journeys</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
