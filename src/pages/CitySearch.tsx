import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Compass, 
  Calendar, 
  DollarSign, 
  Sparkles, 
  ArrowRight,
  Filter,
  CheckCircle2,
  Tag,
  Plus
} from 'lucide-react';
import { POPULAR_DESTINATIONS } from '../data/mockData';
import { Destination } from '../types';
import { useCurrency } from '../context/CurrencyContext';

export const CitySearch: React.FC = () => {
  const { formatPrice } = useCurrency();
  const [searchParams] = useSearchParams();
  const initialDestId = searchParams.get('dest');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVibe, setSelectedVibe] = useState<string>('All');
  const [selectedBudgetTier, setSelectedBudgetTier] = useState<string>('All');
  const [selectedDestModal, setSelectedDestModal] = useState<Destination | null>(() => {
    if (initialDestId) {
      return POPULAR_DESTINATIONS.find(d => d.id === initialDestId) || null;
    }
    return null;
  });

  const vibesList = ['All', 'Royal Heritage & Art', 'Pine Whispers & Colonial Heritage', 'Coastal Bliss & Bohemian Spirit', 'Alpine Adventure & Serenity', 'Culture & Tranquility', 'Coastal Romance & Luxury'];

  const filteredDestinations = POPULAR_DESTINATIONS.filter((dest) => {
    const matchesSearch = 
      dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.highlights.some(h => h.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesVibe = selectedVibe === 'All' || dest.vibe.includes(selectedVibe) || selectedVibe.includes(dest.vibe);
    
    const matchesBudget = selectedBudgetTier === 'All' || 
      (selectedBudgetTier === '$' && dest.costIndex === 1) ||
      (selectedBudgetTier === '$$' && dest.costIndex === 2) ||
      (selectedBudgetTier === '$$$' && dest.costIndex === 3) ||
      (selectedBudgetTier === '$$$$' && dest.costIndex === 4);

    return matchesSearch && matchesVibe && matchesBudget;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="editorial-card p-6 sm:p-10 space-y-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#964223] mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>World Destination Explorer</span>
          </div>
          <h1 className="font-serif-heading text-3xl sm:text-4xl font-bold text-[#2C221E] tracking-tight">
            Discover Multi-City Hubs & Itinerary Ideas
          </h1>
          <p className="text-sm text-[#6B5E55] mt-2 leading-relaxed max-w-xl">
            Curated destinations paired with authentic local activities, scenic multi-city routes, and average daily travel costs.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-4">
          <div className="md:col-span-6 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#8F8175]">
              <Search className="w-4.5 h-4.5" />
            </div>
            <input
              type="text"
              placeholder="Search destinations (e.g. Kyoto, Alps)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#D9CBBA] rounded-2xl text-sm text-[#2C221E] placeholder-[#8F8175] shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[#964223]/30 transition-all"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedVibe}
              onChange={(e) => setSelectedVibe(e.target.value)}
              className="w-full px-4 py-3.5 bg-white border border-[#D9CBBA] rounded-2xl text-sm text-[#2C221E] shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[#964223]/30 transition-all cursor-pointer"
            >
              <option value="All">All Travel Vibes</option>
              <option value="Heritage">Heritage & Art</option>
              <option value="Mountains">Mountain & Alpine</option>
              <option value="Coastal">Coastal & Beaches</option>
              <option value="Culture">Culture & Shrines</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={selectedBudgetTier}
              onChange={(e) => setSelectedBudgetTier(e.target.value)}
              className="w-full px-4 py-3.5 bg-white border border-[#D9CBBA] rounded-2xl text-sm text-[#2C221E] shadow-xs focus:outline-hidden focus:ring-2 focus:ring-[#964223]/30 transition-all cursor-pointer"
            >
              <option value="All">All Budget Tiers</option>
              <option value="$">$ Budget Friendly (&lt;{formatPrice(70)}/d)</option>
              <option value="$$">$$ Moderate ({formatPrice(70)}-{formatPrice(120)}/d)</option>
              <option value="$$$">$$$ Premium ({formatPrice(120)}-{formatPrice(200)}/d)</option>
              <option value="$$$$">$$$$ Luxury ({formatPrice(200)}+/d)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Destinations Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredDestinations.map((dest) => (
          <div
            key={dest.id}
            id={`dest-card-${dest.id}`}
            className="group flex flex-col justify-between overflow-hidden cursor-pointer bg-white rounded-3xl border border-[#E0D7C8] shadow-[0_4px_16px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgb(0,0,0,0.08)] transition-all duration-300"
            onClick={() => setSelectedDestModal(dest)}
          >
            <div>
              {/* Destination Cover Image */}
              <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-[#1E140F]">
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${dest.heroGradient} opacity-60 mix-blend-multiply pointer-events-none`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
                
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <span className="px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest border border-white/20 shadow-xs">
                    {dest.vibe.split(' & ')[0]}
                  </span>
                  <span className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-emerald-300 text-[11px] font-bold border border-white/10 shadow-xs flex items-center gap-1.5">
                    <DollarSign className="w-3 h-3 text-emerald-400" />
                    {formatPrice(dest.averageDailyCost)}/d
                  </span>
                </div>

                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <div className="flex items-center gap-1.5 text-white/80 text-[10px] font-bold uppercase tracking-widest mb-1.5">
                    <MapPin className="w-3 h-3" />
                    <span>{dest.region}, {dest.country}</span>
                  </div>
                  <h3 className="font-serif-heading text-3xl font-bold leading-none drop-shadow-md">
                    {dest.name}
                  </h3>
                </div>
              </div>

              {/* Destination Body */}
              <div className="p-5 sm:p-6 space-y-4">
                <p className="text-sm text-[#6B5E55] line-clamp-2 leading-relaxed">
                  {dest.tagline}
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  {dest.highlights.slice(0, 3).map((hl, i) => (
                    <span 
                      key={i}
                      className="text-[10px] font-bold uppercase tracking-wider text-[#8F8175] bg-[#FAF7F2] border border-[#EAE2D5] px-2.5 py-1 rounded-lg"
                    >
                      {hl}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Destination Footer Action */}
            <div className="px-5 sm:px-6 pb-6 pt-0 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#8F8175] flex items-center gap-1.5 bg-[#FAF7F2] px-3 py-1.5 rounded-full border border-[#EAE2D5]">
                <Calendar className="w-3.5 h-3.5 text-[#964223]" />
                Best: {dest.popularSeason.split(' ')[0]}
              </span>

              <Link
                to={`/trips/new?destId=${dest.id}`}
                onClick={(e) => e.stopPropagation()}
                id={`plan-trip-from-explore-${dest.id}`}
                className="px-4 py-2.5 rounded-xl bg-[#964223] text-white text-xs font-bold hover:bg-[#7D351B] transition-all group-hover:-translate-y-0.5 inline-flex items-center gap-1.5 shadow-sm"
              >
                <span>Plan Trip</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Destination Detailed Modal */}
      {selectedDestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="editorial-card w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#EAE2D5]">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#964223]">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{selectedDestModal.region}, {selectedDestModal.country}</span>
                </div>
                <h2 className="font-serif-heading text-3xl font-bold text-[#2C221E] mt-0.5">
                  {selectedDestModal.name}
                </h2>
              </div>

              <button
                onClick={() => setSelectedDestModal(null)}
                className="p-1.5 text-[#8F8175] hover:text-[#2C221E] font-bold text-base"
              >
                ✕
              </button>
            </div>

            <div className="relative h-56 rounded-2xl overflow-hidden">
              <img
                src={selectedDestModal.image}
                alt={selectedDestModal.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <p className="text-xs font-medium text-white/90">{selectedDestModal.tagline}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-serif-heading text-base font-bold text-[#2C221E]">
                About {selectedDestModal.name}
              </h3>
              <p className="text-xs text-[#6B5E55] leading-relaxed">
                {selectedDestModal.description}
              </p>
            </div>

            {/* Curated Authentic Activities preview */}
            <div className="space-y-3 pt-2">
              <h3 className="font-serif-heading text-base font-bold text-[#2C221E] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#964223]" />
                <span>Featured Authentic Experiences</span>
              </h3>
              
              <div className="space-y-2">
                {selectedDestModal.curatedActivities.map((act) => (
                  <div key={act.id} className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E0D7C8] flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-xs text-[#2C221E]">{act.title}</p>
                      <p className="text-[11px] text-[#6B5E55]">{act.duration} · {act.category}</p>
                    </div>
                    <span className="font-bold text-xs text-[#2C221E]">
                      {act.cost ? `$${act.cost}` : 'Free'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#EAE2D5] flex items-center justify-between">
              <button
                onClick={() => setSelectedDestModal(null)}
                className="px-4 py-2.5 rounded-xl border border-[#D9CBBA] text-xs font-bold text-[#6B5E55]"
              >
                Close Guide
              </button>

              <Link
                to={`/trips/new?destId=${selectedDestModal.id}`}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#964223] text-white text-xs font-bold hover:bg-[#7D351B] shadow-xs"
              >
                <span>Plan Journey with this Theme</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
