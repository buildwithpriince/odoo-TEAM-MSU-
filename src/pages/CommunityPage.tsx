import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTrip } from '../context/TripContext';
import { useAuth } from '../context/AuthContext';
import { 
  CommunityTrip, 
  CommunityFilters, 
  CommunityResponse 
} from '../types/community';
import { 
  fetchCommunityTrips, 
  toggleLikeTrip, 
  toggleSaveTrip 
} from '../services/communityService';
import { CommunityHeader } from '../components/community/CommunityHeader';
import { CommunityToolbar } from '../components/community/CommunityToolbar';
import { CommunityTripCard } from '../components/community/CommunityTripCard';
import { CommunityJourneyModal } from '../components/community/CommunityJourneyModal';
import { CommunityEmptyState } from '../components/community/CommunityEmptyState';
import { CommunitySkeleton } from '../components/community/CommunitySkeleton';

import { 
  Compass, 
  Sparkles, 
  Plus, 
  Check, 
  Share2, 
  Copy, 
  RotateCw, 
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  X
} from 'lucide-react';

export const CommunityPage: React.FC = () => {
  const { trips: userTrips, createTrip } = useTrip();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [filters, setFilters] = useState<CommunityFilters>({
    search: '',
    country: 'all',
    travelVibe: 'all',
    durationRange: 'all',
    budgetRange: 'all',
    groupBy: 'none',
    sortBy: 'recent'
  });

  const [communityTrips, setCommunityTrips] = useState<CommunityTrip[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modal State
  const [selectedTripForModal, setSelectedTripForModal] = useState<CommunityTrip | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<{ title: string; actionText?: string; onAction?: () => void } | null>(null);

  const showToast = (title: string, actionText?: string, onAction?: () => void) => {
    setToastMessage({ title, actionText, onAction });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Load community trips
  useEffect(() => {
    let isMounted = true;

    async function loadTrips() {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const res = await fetchCommunityTrips(filters, 1, 10, userTrips);
        if (isMounted) {
          setCommunityTrips(res.items);
          setTotalCount(res.total);
          setCurrentPage(1);
          setHasMore(res.hasMore);
        }
      } catch (err) {
        if (isMounted) {
          setErrorMsg("Couldn't load community journeys.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadTrips();
    return () => { isMounted = false; };
  }, [filters, userTrips]);

  // Load more handler
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const res = await fetchCommunityTrips(filters, nextPage, 10, userTrips);
      setCommunityTrips(prev => [...prev, ...res.items.slice(prev.length)]);
      setCurrentPage(nextPage);
      setHasMore(res.hasMore);
    } catch {
      showToast("Couldn't load more journeys.");
    } finally {
      setIsLoadingMore(false);
    }
  };

  // View Journey action
  const handleViewJourney = (trip: CommunityTrip) => {
    setSelectedTripForModal(trip);
    setIsModalOpen(true);
  };

  // Copy Trip action
  const handleCopyTrip = (trip: CommunityTrip) => {
    const clonedStops = (trip.stops || []).map(s => ({
      ...s,
      id: 'stop-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      days: (s.days || []).map(d => ({
        ...d,
        activities: (d.activities || []).map(a => ({
          ...a,
          id: 'act-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6)
        }))
      }))
    }));

    const newTrip = createTrip({
      title: `${trip.title} (My Copy)`,
      description: trip.description,
      coverImage: trip.coverImage,
      startDate: trip.startDate,
      endDate: trip.endDate,
      totalBudget: trip.totalBudget,
      currency: trip.currency,
      travelVibe: trip.travelVibe,
      stops: clonedStops,
      budgetItems: trip.budgetItems
    });

    showToast(
      `"${trip.title}" copied to your journeys!`,
      'Open Builder',
      () => navigate(`/builder?tripId=${newTrip.id}`)
    );
  };

  // Share Trip action
  const handleShareTrip = async (trip: CommunityTrip) => {
    const shareUrl = `${window.location.origin}/community?search=${encodeURIComponent(trip.title)}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: trip.title,
          text: `Check out this journey on GlobeTrotter: ${trip.title}`,
          url: shareUrl
        });
        showToast('Journey link shared!');
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast('Journey link copied to clipboard!');
    } catch {
      showToast('Could not copy link to clipboard.');
    }
  };

  // Like toggle
  const handleToggleLike = (tripId: string) => {
    const isNowLiked = toggleLikeTrip(tripId);
    setCommunityTrips(prev => prev.map(t => {
      if (t.id === tripId) {
        return {
          ...t,
          isLiked: isNowLiked,
          likesCount: isNowLiked ? t.likesCount + 1 : Math.max(0, t.likesCount - 1)
        };
      }
      return t;
    }));
  };

  // Save toggle
  const handleToggleSave = (tripId: string) => {
    const isNowSaved = toggleSaveTrip(tripId);
    setCommunityTrips(prev => prev.map(t => {
      if (t.id === tripId) {
        return {
          ...t,
          isSaved: isNowSaved,
          savesCount: isNowSaved ? t.savesCount + 1 : Math.max(0, t.savesCount - 1)
        };
      }
      return t;
    }));

    if (isNowSaved) {
      showToast('Saved to your travel wishlist!');
    }
  };

  // Extract available countries & vibes for filters
  const { availableCountries, availableVibes, totalDestinations } = useMemo(() => {
    const countries = new Set<string>();
    const vibes = new Set<string>();
    const cities = new Set<string>();

    communityTrips.forEach(t => {
      if (t.travelVibe) vibes.add(t.travelVibe);
      t.stops?.forEach(s => {
        if (s.country) countries.add(s.country);
        if (s.cityName) cities.add(s.cityName);
      });
    });

    return {
      availableCountries: Array.from(countries).sort(),
      availableVibes: Array.from(vibes).sort(),
      totalDestinations: cities.size || 12
    };
  }, [communityTrips]);

  // Grouped Trips Calculation
  const groupedTrips = useMemo(() => {
    if (filters.groupBy === 'none') return null;

    const groups = new Map<string, CommunityTrip[]>();

    communityTrips.forEach(trip => {
      let key = 'Other';
      if (filters.groupBy === 'destination') {
        key = trip.stops?.[0]?.cityName || 'Multi-City';
      } else if (filters.groupBy === 'country') {
        key = trip.stops?.[0]?.country || 'International';
      } else if (filters.groupBy === 'vibe') {
        key = trip.travelVibe || 'General Inspiration';
      }

      const existing = groups.get(key) || [];
      existing.push(trip);
      groups.set(key, existing);
    });

    return Array.from(groups.entries());
  }, [communityTrips, filters.groupBy]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200 pb-16">
      
      {/* Community Page Header */}
      <CommunityHeader
        totalTrips={totalCount}
        totalDestinations={totalDestinations}
      />

      {/* Discovery Toolbar */}
      <CommunityToolbar
        filters={filters}
        onFilterChange={(updated) => setFilters(prev => ({ ...prev, ...updated }))}
        availableCountries={availableCountries}
        availableVibes={availableVibes}
      />

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => setFilters({ ...filters })}
            className="font-bold underline hover:text-rose-950 cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Feed Content Area */}
      {isLoading ? (
        <CommunitySkeleton />
      ) : communityTrips.length === 0 ? (
        <CommunityEmptyState
          isFiltered={
            filters.search.trim().length > 0 ||
            filters.country !== 'all' ||
            filters.travelVibe !== 'all' ||
            filters.durationRange !== 'all' ||
            filters.budgetRange !== 'all'
          }
          onResetFilters={() => setFilters({
            search: '',
            country: 'all',
            travelVibe: 'all',
            durationRange: 'all',
            budgetRange: 'all',
            groupBy: 'none',
            sortBy: 'recent'
          })}
        />
      ) : groupedTrips ? (
        /* Grouped Feed Display */
        <div className="space-y-10">
          {groupedTrips.map(([groupName, tripsInGroup]) => (
            <section key={groupName} className="space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-[#EAE2D5]">
                <div className="flex items-center gap-2">
                  <h2 className="font-serif-heading text-xl font-bold text-[#2C221E]">
                    {groupName}
                  </h2>
                  <span className="text-xs text-[#8F8175] font-semibold bg-[#F0EAE1] px-2 py-0.5 rounded-full">
                    {tripsInGroup.length} {tripsInGroup.length === 1 ? 'journey' : 'journeys'}
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                {tripsInGroup.map(trip => (
                  <CommunityTripCard
                    key={trip.id}
                    trip={trip}
                    onViewJourney={handleViewJourney}
                    onCopyTrip={handleCopyTrip}
                    onShareTrip={handleShareTrip}
                    onToggleLike={handleToggleLike}
                    onToggleSave={handleToggleSave}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        /* Standard Vertical Feed */
        <div className="space-y-6">
          {communityTrips.map(trip => (
            <CommunityTripCard
              key={trip.id}
              trip={trip}
              onViewJourney={handleViewJourney}
              onCopyTrip={handleCopyTrip}
              onShareTrip={handleShareTrip}
              onToggleLike={handleToggleLike}
              onToggleSave={handleToggleSave}
            />
          ))}

          {/* Load More Button */}
          {hasMore && (
            <div className="pt-4 text-center">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                id="community-load-more-btn"
                className="px-6 py-3 rounded-2xl border border-[#D9CBBA] bg-white hover:bg-[#F5F1E8] text-[#2C221E] text-xs font-bold transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoadingMore ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin text-[#964223]" />
                    <span>Loading Journeys...</span>
                  </>
                ) : (
                  <>
                    <Compass className="w-3.5 h-3.5 text-[#964223]" />
                    <span>Load More Shared Journeys</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Journey Detail Modal */}
      <CommunityJourneyModal
        trip={selectedTripForModal}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTripForModal(null);
        }}
        onCopyTrip={handleCopyTrip}
        onShareTrip={handleShareTrip}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2C221E] text-white px-4 py-3 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-3 text-xs animate-in slide-in-from-bottom-5 duration-200">
          <div className="w-6 h-6 rounded-full bg-emerald-600/30 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <span className="font-medium text-[#FAF7F2]">{toastMessage.title}</span>
          {toastMessage.actionText && toastMessage.onAction && (
            <button
              onClick={toastMessage.onAction}
              className="ml-1 px-2.5 py-1 rounded-lg bg-[#964223] hover:bg-[#7D351B] text-white font-bold text-[11px] transition-colors cursor-pointer"
            >
              {toastMessage.actionText}
            </button>
          )}
          <button
            onClick={() => setToastMessage(null)}
            className="text-white/60 hover:text-white ml-1 cursor-pointer"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
};
