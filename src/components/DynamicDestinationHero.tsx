import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Sparkles, 
  Compass, 
  ChevronRight,
  ChevronLeft,
  TrendingUp
} from 'lucide-react';
import { POPULAR_DESTINATIONS } from '../data/mockData';
import { Destination } from '../types';
import { useCurrency } from '../context/CurrencyContext';

interface Props {
  onSelectDestination?: (dest: Destination) => void;
}

export const DynamicDestinationHero: React.FC<Props> = ({ onSelectDestination }) => {
  const { formatPrice } = useCurrency();
  const baseLength = POPULAR_DESTINATIONS.length;
  // Tripled array for seamless infinite looping
  const extendedDestinations = [...POPULAR_DESTINATIONS, ...POPULAR_DESTINATIONS, ...POPULAR_DESTINATIONS];
  
  const [carouselIndex, setCarouselIndex] = useState(baseLength);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [activeDestIndex, setActiveDestIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [cardWidth, setCardWidth] = useState(320);

  const containerRef = useRef<HTMLDivElement>(null);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  const activeDest = POPULAR_DESTINATIONS[activeDestIndex] || POPULAR_DESTINATIONS[0];

  // Dynamically calculate card width based on responsive breakpoints and container width
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const width = entry.contentRect.width;
        if (width > 0) {
          const windowWidth = window.innerWidth;
          const isMobile = windowWidth < 640;
          const isTablet = windowWidth >= 640 && windowWidth < 1024;
          // Determine how many cards should fit inside the container (including the "peek" fraction)
          const cardsToShow = isMobile ? 1.25 : isTablet ? 2.4 : 3.4;
          const gap = 24;
          // Formula: the total width is (cardsToShow * cardWidth) + ((cardsToShow - 1) * gap)
          const calculatedWidth = ((width + gap) / cardsToShow) - gap;
          setCardWidth(Math.max(calculatedWidth, 240)); // ensure a sensible minimum
        }
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      handleNext();
    }, 4500);
    return () => clearInterval(timer);
  }, [isHovered, carouselIndex]);

  // Sync hero background with carousel active index if not hovering
  useEffect(() => {
    if (!isHovered) {
      setActiveDestIndex(carouselIndex % baseLength);
    }
  }, [carouselIndex, isHovered, baseLength]);

  const handleNext = () => {
    setIsTransitioning(true);
    setCarouselIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    setIsTransitioning(true);
    setCarouselIndex((prev) => prev - 1);
  };

  // Seamless loop reset logic
  useEffect(() => {
    if (!isTransitioning) return;
    const transitionDuration = 600; // Matches CSS transition duration

    let timeout: NodeJS.Timeout;
    if (carouselIndex >= baseLength * 2) {
      timeout = setTimeout(() => {
        setIsTransitioning(false);
        setCarouselIndex(carouselIndex - baseLength);
      }, transitionDuration);
    } else if (carouselIndex <= 0) {
      timeout = setTimeout(() => {
        setIsTransitioning(false);
        setCarouselIndex(carouselIndex + baseLength);
      }, transitionDuration);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [carouselIndex, isTransitioning, baseLength]);

  const handleMouseEnterCarousel = () => {
    setIsHovered(true);
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
  };

  const handleMouseLeaveCarousel = () => {
    // Resume auto-advance 2.5s after mouse leaves
    pauseTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 2500);
  };

  // Mobile Swipe Handling
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) {
      handleNext();
    } else if (distance < -50) {
      handlePrev();
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  const handleStartTrip = () => {
    if (onSelectDestination) {
      onSelectDestination(activeDest);
    }
    navigate(`/trips/new?destId=${activeDest.id}`);
  };

  return (
    <div className="space-y-10">
      {/* Hero Container */}
      <div className="relative rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-[#E0D7C8] bg-[#1E140F]">
        
        {/* Hero Background */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeDest.id}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0"
            >
              <img
                src={activeDest.image}
                alt={activeDest.name}
                className="w-full h-full object-cover object-center pointer-events-none"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${activeDest.heroGradient} opacity-90 mix-blend-multiply pointer-events-none`} />
              <div className="absolute inset-0 bg-radial from-transparent via-black/40 to-black/80 pointer-events-none" />
            </motion.div>
          </AnimatePresence>
          {/* Dynamic Accent Tint */}
          <div 
            className="absolute inset-0 mix-blend-color opacity-30 pointer-events-none transition-colors duration-700"
            style={{ backgroundColor: activeDest.dominantAccent }}
          />
        </div>

        {/* Top Header Bar inside Hero */}
        <div className="relative z-10 p-6 sm:px-10 sm:py-8 flex items-center justify-between pointer-events-none">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-widest shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            Live Feed
          </div>
        </div>

        {/* Hero Main Content */}
        <div className="relative z-10 px-6 sm:px-10 pt-4 pb-12 sm:pb-16 max-w-4xl pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeDest.id + '-content'}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="space-y-6"
            >
              <div className="flex flex-wrap items-center gap-3 text-white/90 text-sm font-bold uppercase tracking-widest">
                <span className="flex items-center gap-1.5 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  {activeDest.region}, {activeDest.country}
                </span>
                <span className="bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10">
                  {activeDest.vibe}
                </span>
              </div>

              <h1 className="font-serif-heading text-3xl sm:text-5xl lg:text-7xl font-bold text-white tracking-tight leading-[1.05] drop-shadow-lg">
                {activeDest.name}
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-white/80 max-w-2xl leading-relaxed drop-shadow-md font-medium">
                {activeDest.description}
              </p>

              {/* Actions Button Row */}
              <div className="flex flex-wrap items-center gap-4 pt-4 pointer-events-auto justify-start">
                <button
                  onClick={handleStartTrip}
                  id="hero-plan-trip-btn"
                  className="inline-flex items-center gap-2 px-5 py-3 sm:px-7 sm:py-4 rounded-2xl text-white font-bold text-xs sm:text-sm shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-95 transition-all cursor-pointer"
                  style={{ backgroundColor: activeDest.dominantAccent }}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Design Itinerary for {activeDest.name}</span>
                </button>

                <Link
                  to={`/explore?dest=${activeDest.id}`}
                  id="hero-explore-dest-btn"
                  className="inline-flex items-center gap-2 px-5 py-3 sm:px-6 sm:py-4 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm backdrop-blur-md border border-white/20 transition-all hover:-translate-y-1 shadow-lg"
                >
                  <Compass className="w-4 h-4" />
                  <span>Explore Guide</span>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Premium Featured Destinations Carousel */}
      <div 
        className="relative"
        onMouseEnter={handleMouseEnterCarousel}
        onMouseLeave={handleMouseLeaveCarousel}
      >
        {/* Carousel Header & Controls */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-bold uppercase tracking-widest text-[#964223] flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Featured Hubs
          </span>
          
          <div className="hidden sm:flex items-center gap-3">
            {/* Progress Indicators */}
            <div className="hidden md:flex items-center gap-1.5 mr-4">
              {POPULAR_DESTINATIONS.map((_, idx) => {
                const isActive = (carouselIndex % baseLength) === idx;
                return (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      isActive ? 'w-6 bg-[#964223]' : 'w-2 bg-[#E0D7C8]'
                    }`}
                  />
                );
              })}
            </div>

            <button 
              onClick={handlePrev} 
              className="w-10 h-10 rounded-full bg-white hover:bg-[#F5F1E8] border border-[#E0D7C8] shadow-sm flex items-center justify-center text-[#2C221E] transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={handleNext} 
              className="w-10 h-10 rounded-full bg-white hover:bg-[#F5F1E8] border border-[#E0D7C8] shadow-sm flex items-center justify-center text-[#2C221E] transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* The Track Container */}
        <div 
          ref={containerRef}
          className="relative w-full overflow-hidden"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div 
            className="flex flex-nowrap w-max"
            style={{
              gap: '24px',
              transform: `translateX(calc(-${carouselIndex} * (${cardWidth}px + 24px)))`,
              transition: isTransitioning ? 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
            }}
          >
            {extendedDestinations.map((dest, i) => {
              const isVisuallyActive = i === carouselIndex;
              return (
                <div
                  key={`${dest.id}-${i}`}
                  style={{ width: `${cardWidth}px` }}
                  className={`shrink-0 h-[220px] sm:h-[260px] relative rounded-3xl overflow-hidden cursor-pointer group shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-[#E0D7C8] transition-all duration-500 ${
                    isVisuallyActive ? 'ring-2 ring-[#964223]/30 scale-[1.02]' : 'opacity-90 hover:opacity-100 hover:scale-[1.01]'
                  }`}
                  onMouseEnter={() => {
                    setActiveDestIndex(i % baseLength);
                    setIsHovered(true);
                    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
                  }}
                  onClick={() => {
                    setActiveDestIndex(i % baseLength);
                    setCarouselIndex(i);
                  }}
                >
                  <img 
                    src={dest.image} 
                    alt={dest.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out pointer-events-none" 
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${dest.heroGradient} opacity-60 mix-blend-multiply pointer-events-none`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />
                  
                  {/* Price Pill */}
                  <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-emerald-300 text-xs font-bold border border-white/10 shadow-xs pointer-events-none">
                    {formatPrice(dest.averageDailyCost)}/day
                  </div>

                  <div className="absolute bottom-5 left-5 right-5 pointer-events-none">
                    <h3 className="font-serif-heading text-2xl sm:text-3xl font-bold text-white leading-none drop-shadow-md mb-2">
                      {dest.name}
                    </h3>
                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white/70">
                      {dest.country}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
