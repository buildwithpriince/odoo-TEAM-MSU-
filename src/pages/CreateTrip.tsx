import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  Compass, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Plus, 
  Trash2, 
  Sparkles, 
  ArrowLeft,
  ArrowRight,
  Luggage,
  CheckCircle2,
  AlertCircle,
  Layers
} from 'lucide-react';
import { useTrip } from '../context/TripContext';
import { CityStop } from '../types';
import { POPULAR_DESTINATIONS } from '../data/mockData';
import { useCurrency } from '../context/CurrencyContext';

export const CreateTrip: React.FC = () => {
  const { currency } = useCurrency();
  const [searchParams] = useSearchParams();
  const destIdParam = searchParams.get('destId');
  const cityParam = searchParams.get('city');
  const countryParam = searchParams.get('country');

  const matchedDest = POPULAR_DESTINATIONS.find(
    d => d.id === destIdParam || d.name.toLowerCase() === (cityParam || '').toLowerCase()
  );

  const { createTrip } = useTrip();
  const navigate = useNavigate();

  const [title, setTitle] = useState(
    matchedDest ? `Grand Tour of ${matchedDest.name} & Beyond` : (cityParam ? `Journey to ${cityParam}` : '')
  );
  const [description, setDescription] = useState(
    matchedDest ? matchedDest.tagline : ''
  );
  const [startDate, setStartDate] = useState('2026-10-15');
  const [endDate, setEndDate] = useState('2026-10-25');
  const [travelVibe, setTravelVibe] = useState(matchedDest?.vibe || 'Culture & Discovery');
  const [budget, setBudget] = useState(matchedDest ? matchedDest.averageDailyCost * 10 : 2500);
  const [coverImage, setCoverImage] = useState(
    matchedDest?.image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80'
  );

  const [stops, setStops] = useState<Array<{ id: string; cityName: string; country: string; coverImage?: string }>>(() => {
    if (matchedDest && matchedDest.curatedStops && matchedDest.curatedStops.length > 0) {
      return matchedDest.curatedStops.map((stopName, idx) => ({
        id: 'stop-' + idx,
        cityName: stopName,
        country: matchedDest.country,
        coverImage: idx === 0 ? matchedDest.image : undefined
      }));
    }
    return [
      { id: 'stop-1', cityName: cityParam || 'Jaipur', country: countryParam || 'India' },
      { id: 'stop-2', cityName: 'Jodhpur', country: 'India' },
      { id: 'stop-3', cityName: 'Udaipur', country: 'India' }
    ];
  });

  const [newCity, setNewCity] = useState('');
  const [newCountry, setNewCountry] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (matchedDest) {
      setTitle(`Grand Tour of ${matchedDest.name} & Beyond`);
      setDescription(matchedDest.tagline);
      setTravelVibe(matchedDest.vibe);
      setCoverImage(matchedDest.image);
      setBudget(matchedDest.averageDailyCost * 10);
      if (matchedDest.curatedStops) {
        setStops(matchedDest.curatedStops.map((s, i) => ({
          id: 'stop-' + i,
          cityName: s,
          country: matchedDest.country
        })));
      }
    }
  }, [destIdParam]);

  const handleAddStop = () => {
    if (!newCity.trim()) return;
    setStops(prev => [
      ...prev,
      {
        id: 'stop-' + Date.now(),
        cityName: newCity.trim(),
        country: newCountry.trim() || 'Worldwide'
      }
    ]);
    setNewCity('');
    setNewCountry('');
  };

  const handleRemoveStop = (id: string) => {
    if (stops.length <= 1) {
      setErrorMsg('A journey requires at least one city stop.');
      return;
    }
    setErrorMsg('');
    setStops(prev => prev.filter(s => s.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Please enter a journey title.');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setErrorMsg('End Date cannot be earlier than Start Date.');
      return;
    }

    if (stops.length === 0) {
      setErrorMsg('Please add at least one city stop.');
      return;
    }

    // Build stops and include curated activities if available for matching destination
    const formattedStops: CityStop[] = stops.map((s, index) => {
      let initialActivities = [];
      if (matchedDest && matchedDest.curatedActivities && index === 0) {
        initialActivities = matchedDest.curatedActivities.map(ca => ({
          id: 'act-' + Math.random().toString(36).substr(2, 7),
          title: ca.title,
          time: ca.time,
          duration: ca.duration,
          category: ca.category,
          cost: ca.cost
        }));
      }

      return {
        id: s.id,
        cityName: s.cityName,
        country: s.country,
        arrivalDate: startDate,
        departureDate: endDate,
        coverImage: s.coverImage || coverImage,
        days: [
          {
            dayNumber: 1,
            date: startDate,
            title: `Day 1 in ${s.cityName}`,
            activities: initialActivities
          }
        ]
      };
    });

    const newTrip = createTrip({
      title: title.trim(),
      description: description.trim() || `Multi-city adventure exploring ${stops.map(s => s.cityName).join(', ')}`,
      startDate,
      endDate,
      travelVibe,
      totalBudget: Number(budget) || 2500,
      coverImage,
      destinationTheme: matchedDest ? {
        accentColor: matchedDest.dominantAccent,
        gradient: matchedDest.heroGradient,
        bgTint: matchedDest.bgTint
      } : undefined,
      stops: formattedStops
    });

    navigate(`/builder?tripId=${newTrip.id}`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Back button */}
      <Link 
        to="/trips" 
        id="back-to-trips-btn"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8F8175] hover:text-[#2C221E] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to My Journeys</span>
      </Link>

      {/* Main Card */}
      <div className="editorial-card p-6 sm:p-10 space-y-8">
        
        {/* Header with Destination Banner if selected */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EAE2D5]">
          <div className="flex items-center gap-3.5">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xs"
              style={{ backgroundColor: matchedDest?.dominantAccent || '#964223' }}
            >
              <Luggage className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#964223]">
                Journey Architect
              </span>
              <h1 className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#2C221E]">
                Plan a New Journey
              </h1>
            </div>
          </div>

          {matchedDest && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F0EAE1] border border-[#E3D9CB] text-xs font-semibold text-[#2C221E]">
              <Sparkles className="w-3.5 h-3.5 text-[#964223]" />
              <span>Theme: {matchedDest.name} ({matchedDest.vibe})</span>
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" id="create-trip-form">
          
          {/* Section: Basic Details */}
          <div className="space-y-4">
            <h2 className="font-serif-heading text-lg font-bold text-[#2C221E] flex items-center gap-2">
              <span>1. Overview & Timeframe</span>
            </h2>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6B5E55] mb-1.5" htmlFor="trip-title">
                Journey Name *
              </label>
              <input
                id="trip-title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Royal Rajasthan: Jaipur, Jodhpur & Udaipur"
                className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#E0D7C8] rounded-xl text-sm text-[#2C221E] focus:outline-hidden focus:ring-2 focus:ring-[#964223]/30 focus:border-[#964223]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#6B5E55] mb-1.5" htmlFor="trip-desc">
                Description / Editorial Notes
              </label>
              <textarea
                id="trip-desc"
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Exploring mountain ridge trails, ancient forts, and boutique heritage chalets..."
                className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#E0D7C8] rounded-xl text-sm text-[#2C221E] focus:outline-hidden focus:ring-2 focus:ring-[#964223]/30 focus:border-[#964223]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6B5E55] mb-1.5" htmlFor="trip-start">
                  Start Date *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8F8175]">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    id="trip-start"
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#E0D7C8] rounded-xl text-sm text-[#2C221E] focus:outline-hidden focus:ring-2 focus:ring-[#964223]/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6B5E55] mb-1.5" htmlFor="trip-end">
                  End Date *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8F8175]">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    id="trip-end"
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#E0D7C8] rounded-xl text-sm text-[#2C221E] focus:outline-hidden focus:ring-2 focus:ring-[#964223]/30"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6B5E55] mb-1.5" htmlFor="trip-vibe">
                  Travel Vibe / Style
                </label>
                <select
                  id="trip-vibe"
                  value={travelVibe}
                  onChange={(e) => setTravelVibe(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#FAF7F2] border border-[#E0D7C8] rounded-xl text-sm text-[#2C221E] focus:outline-hidden focus:ring-2 focus:ring-[#964223]/30"
                >
                  <option value="Royal Heritage & Art">Royal Heritage & Art</option>
                  <option value="Pine Whispers & Mountains">Pine Whispers & Mountains</option>
                  <option value="Coastal Bliss & Bohemian">Coastal Bliss & Bohemian</option>
                  <option value="Culture & Tranquility">Culture & Tranquility</option>
                  <option value="Alpine Adventure & Serenity">Alpine Adventure & Serenity</option>
                  <option value="Culinary & Wine Exploration">Culinary & Wine Exploration</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6B5E55] mb-1.5" htmlFor="trip-budget">
                  Target Budget ({currency === 'INR' ? '₹' : '$'})
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8F8175]">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <input
                    id="trip-budget"
                    type="number"
                    min="100"
                    step="50"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#E0D7C8] rounded-xl text-sm text-[#2C221E] focus:outline-hidden focus:ring-2 focus:ring-[#964223]/30"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Multi-City Stops */}
          <div className="space-y-6 pt-6 border-t border-[#EAE2D5]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif-heading text-lg font-bold text-[#2C221E]">
                  2. Multi-City Stops & Route Sequence
                </h2>
                <p className="text-xs text-[#8F8175] mt-0.5">
                  Design your journey's trajectory and intermediate destinations
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#F0EAE1] text-[#6B5E55] border border-[#E3D9CB]">
                {stops.length} Stops Configured
              </span>
            </div>

            {/* Stops list with timeline connectors */}
            <div className="relative pl-1 sm:pl-4 space-y-4">
              {/* Vertical line connector */}
              <div className="absolute top-8 bottom-12 left-[1.4rem] sm:left-[2.15rem] w-px bg-gradient-to-b from-[#964223] via-[#D9CBBA] to-transparent pointer-events-none" />
              
              {stops.map((stop, idx) => (
                <div 
                  key={stop.id}
                  className="relative flex items-center gap-3 sm:gap-5 group"
                >
                  {/* Step Badge */}
                  <div className="relative z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white border-2 border-[#964223] text-[#964223] font-serif-heading font-bold text-sm flex items-center justify-center shadow-sm shrink-0">
                    {idx + 1}
                  </div>

                  {/* Stop Card */}
                  <div className="flex-1 flex items-center justify-between p-3.5 sm:p-5 rounded-2xl bg-white border border-[#E0D7C8] shadow-[0_2px_8px_rgb(0,0,0,0.02)] transition-all group-hover:shadow-[0_4px_12px_rgb(0,0,0,0.06)] group-hover:border-[#D9CBBA]">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-semibold text-sm sm:text-base text-[#2C221E]">{stop.cityName}</p>
                        <p className="text-[11px] sm:text-xs text-[#8F8175] mt-0.5">{stop.country}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {idx === 0 && (
                        <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-widest text-[#964223] bg-[#964223]/10 px-3 py-1 rounded-full">
                          Departure
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveStop(stop.id)}
                        className="p-2 text-[#8F8175] hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
                        title="Remove stop"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Quick Add Stop Input within timeline */}
              <div className="relative flex items-center gap-3 sm:gap-5 mt-2">
                <div className="relative z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#FAF7F2] border-2 border-dashed border-[#D9CBBA] text-[#D9CBBA] flex items-center justify-center shrink-0">
                  <Plus className="w-4 h-4" />
                </div>
                
                <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center p-2 rounded-2xl bg-[#FAF7F2] border border-dashed border-[#D9CBBA] focus-within:border-[#964223]/50 focus-within:bg-white focus-within:shadow-[0_2px_8px_rgb(0,0,0,0.04)] transition-all gap-2">
                  <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center divide-y sm:divide-y-0 sm:divide-x divide-[#EAE2D5]">
                    <input
                      type="text"
                      placeholder="Next city (e.g. Kyoto)"
                      value={newCity}
                      onChange={(e) => setNewCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-transparent border-none text-sm text-[#2C221E] focus:outline-hidden placeholder:text-[#8F8175]"
                    />
                    <input
                      type="text"
                      placeholder="Country (optional)"
                      value={newCountry}
                      onChange={(e) => setNewCountry(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-transparent border-none text-sm text-[#2C221E] focus:outline-hidden placeholder:text-[#8F8175]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddStop}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2C221E] text-white hover:bg-black transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!newCity.trim()}
                  >
                    <Plus className="w-4 h-4" />
                    <span className="sm:hidden text-xs font-bold">Add Stop</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-6 border-t border-[#EAE2D5] flex items-center justify-between gap-4">
            <Link
              to="/trips"
              className="px-4 py-2.5 rounded-xl border border-[#D9CBBA] text-[#6B5E55] text-xs font-bold hover:bg-[#FAF7F2]"
            >
              Cancel
            </Link>

            <button
              type="submit"
              id="save-trip-and-build-btn"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#964223] hover:bg-[#7D351B] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <span>Save & Launch Itinerary Builder</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};
