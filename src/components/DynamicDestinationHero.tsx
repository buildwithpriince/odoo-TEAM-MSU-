import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  MapPin, 
  Calendar, 
  DollarSign, 
  ArrowRight, 
  Compass, 
  ChevronRight,
  TrendingUp,
  Tag
} from 'lucide-react';
import { Destination } from '../types';
import { POPULAR_DESTINATIONS } from '../data/mockData';

interface Props {
  onSelectDestination?: (dest: Destination) => void;
}

export const DynamicDestinationHero: React.FC<Props> = ({ onSelectDestination }) => {
  const [activeDestIndex, setActiveDestIndex] = useState(0);
  const navigate = useNavigate();
  const activeDest = POPULAR_DESTINATIONS[activeDestIndex] || POPULAR_DESTINATIONS[0];

  const handleStartTrip = () => {
    if (onSelectDestination) {
      onSelectDestination(activeDest);
    }
    navigate(`/trips/new?destId=${activeDest.id}`);
  };

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-[#E0D7C8] transition-all">
      
      {/* Background Image Container with Crossfade */}
      <div className="relative min-h-[520px] sm:min-h-[560px] lg:min-h-[580px] w-full overflow-hidden flex flex-col justify-between">
        
        {/* Animated Background Images */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeDest.id}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 z-0 bg-[#1E140F]"
          >
            <img
              src={activeDest.image}
              alt={activeDest.name}
              className="w-full h-full object-cover object-center"
            />
            {/* Dynamic Adaptive Gradient Overlays */}
            <div className={`absolute inset-0 bg-gradient-to-t ${activeDest.heroGradient}`} />
            <div className="absolute inset-0 bg-radial from-transparent via-black/30 to-black/70" />
          </motion.div>
        </AnimatePresence>

        {/* Ambient Top Glow adapted to destination */}
        <div 
          className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-all duration-700 opacity-40"
          style={{ backgroundColor: activeDest.dominantAccent }}
        />

        {/* Top Header Bar inside Hero */}
        <div className="relative z-10 p-6 sm:p-8 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-xs font-semibold uppercase tracking-widest shadow-xs">
            <span 
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: activeDest.dominantAccent }}
            />
            <span>Curated Destination Spotlight</span>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <span className="text-xs text-white/80 font-medium">Hover or tap cards below to shift preview</span>
          </div>
        </div>

        {/* Hero Content Area */}
        <div className="relative z-10 px-6 sm:px-10 py-4 max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeDest.id + '-content'}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="space-y-4"
            >
              {/* Country & Region pill */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-3 py-1 rounded-lg bg-white/15 backdrop-blur-md text-white font-bold border border-white/20 flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-[#F5F1E8]" />
                  {activeDest.name}, {activeDest.country}
                </span>
                <span className="px-3 py-1 rounded-lg bg-black/30 backdrop-blur-md text-white/90 font-medium border border-white/10">
                  {activeDest.vibe}
                </span>
                <span className="px-3 py-1 rounded-lg bg-black/30 backdrop-blur-md text-white/90 font-medium border border-white/10 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-amber-300" />
                  Best: {activeDest.popularSeason}
                </span>
              </div>

              {/* Editorial Display Heading */}
              <h1 className="font-serif-heading text-3xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.08] drop-shadow-sm">
                Discover {activeDest.name}
              </h1>

              {/* Tagline */}
              <p className="text-white/90 text-sm sm:text-base lg:text-lg font-light leading-relaxed max-w-2xl drop-shadow-xs">
                {activeDest.tagline}
              </p>

              {/* Highlights tags */}
              <div className="flex flex-wrap gap-2 pt-1">
                {activeDest.highlights.slice(0, 3).map((hl, i) => (
                  <span 
                    key={i} 
                    className="text-xs text-white/80 bg-black/35 backdrop-blur-xs px-2.5 py-1 rounded-md border border-white/10"
                  >
                    • {hl}
                  </span>
                ))}
              </div>

              {/* Actions Button Row */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <button
                  onClick={handleStartTrip}
                  id="hero-plan-trip-btn"
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-white font-bold text-sm shadow-lg shadow-black/30 active:scale-95 transition-all cursor-pointer"
                  style={{ backgroundColor: activeDest.dominantAccent }}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Plan Trip to {activeDest.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <Link
                  to={`/explore?dest=${activeDest.id}`}
                  id="hero-explore-dest-btn"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-semibold text-sm backdrop-blur-md border border-white/20 transition-all"
                >
                  <Compass className="w-4 h-4" />
                  <span>Explore Guide & Activities</span>
                </Link>

                <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-black/40 backdrop-blur-md border border-white/15 text-white/90 text-xs font-semibold ml-2">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Avg. ${activeDest.averageDailyCost}/day</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Interactive Bottom Destination Selector Row */}
        <div className="relative z-10 p-4 sm:p-6 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
          <div className="flex items-center justify-between mb-2.5 px-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-white/70 flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3 text-amber-400" />
              Featured Destinations & Multi-City Hubs
            </span>
            <span className="text-[11px] text-white/60">
              {activeDestIndex + 1} of {POPULAR_DESTINATIONS.length}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {POPULAR_DESTINATIONS.map((dest, idx) => {
              const isSelected = idx === activeDestIndex;
              return (
                <button
                  key={dest.id}
                  id={`dest-selector-card-${dest.id}`}
                  onMouseEnter={() => setActiveDestIndex(idx)}
                  onClick={() => setActiveDestIndex(idx)}
                  className={`group relative text-left rounded-xl overflow-hidden p-2.5 transition-all duration-200 border cursor-pointer ${
                    isSelected
                      ? 'bg-white/20 border-white text-white shadow-md ring-2 ring-white/40 scale-102'
                      : 'bg-black/40 hover:bg-white/10 border-white/15 text-white/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <p className="font-serif-heading font-bold text-xs tracking-tight truncate">
                      {dest.name}
                    </p>
                    <span 
                      className="w-2 h-2 rounded-full shrink-0 transition-opacity"
                      style={{ 
                        backgroundColor: dest.dominantAccent,
                        opacity: isSelected ? 1 : 0.4
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-white/70 truncate">{dest.country}</p>
                  <p className="text-[10px] text-emerald-300 font-medium mt-0.5">${dest.averageDailyCost}/d</p>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
