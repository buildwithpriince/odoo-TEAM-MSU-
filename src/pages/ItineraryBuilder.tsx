import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Plus, 
  Clock, 
  Compass, 
  DollarSign, 
  Utensils, 
  Train, 
  BedDouble, 
  Camera, 
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Layers,
  CheckCircle2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Share2,
  Printer,
  Edit3,
  Luggage,
  Coffee,
  Trees,
  Check
} from 'lucide-react';
import { useTrip } from '../context/TripContext';
import { useCurrency } from '../context/CurrencyContext';
import { ActivityItem, CityStop, ActivityCategory } from '../types';
import { POPULAR_DESTINATIONS } from '../data/mockData';

import { RouteBackground } from "../components/RouteBackground";

export const ItineraryBuilder: React.FC = () => {
  const { formatPrice, currency, convertCostToCurrentCurrency, formatCurrentCurrency } = useCurrency();
  const [searchParams, setSearchParams] = useSearchParams();
  const tripIdParam = searchParams.get('tripId');
  const { trips, activeTrip, updateTrip, addActivityToStop, removeActivityFromStop, reorderStops, addStopToTrip, removeStopFromTrip } = useTrip();

  const selectedTrip = trips.find(t => t.id === tripIdParam) || activeTrip || trips[0];

  // Active Wizard Step: 1 = Stops, 2 = Activities, 3 = Chronological View
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(2);

  // Selected stop for activity editing
  const [selectedStopId, setSelectedStopId] = useState<string>(
    selectedTrip?.stops?.[0]?.id || ''
  );

  // Modal / Form state for custom activity
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newActivityTitle, setNewActivityTitle] = useState('');
  const [newActivityCategory, setNewActivityCategory] = useState<ActivityCategory>('sightseeing');
  const [newActivityTime, setNewActivityTime] = useState('10:00');
  const [newActivityDuration, setNewActivityDuration] = useState('2 hrs');
  const [newActivityCost, setNewActivityCost] = useState('25');
  const [newActivityNotes, setNewActivityNotes] = useState('');

  // Trip Intelligence state
  const [isIntelligenceOpen, setIsIntelligenceOpen] = useState(false);
  const [isGeneratingIntelligence, setIsGeneratingIntelligence] = useState(false);
  const [intelligenceSuggestions, setIntelligenceSuggestions] = useState<any[]>([]);

  const handleGenerateIntelligence = async () => {
    if (!selectedTrip || isGeneratingIntelligence) return;
    setIsIntelligenceOpen(true);
    setIsGeneratingIntelligence(true);
    
    try {
      const context = `Destination: ${selectedTrip.stops.map(s => s.cityName).join(', ')}. Dates: ${selectedTrip.startDate} to ${selectedTrip.endDate}. Budget: ${selectedTrip.totalBudget} ${selectedTrip.currency}. Vibe: ${selectedTrip.travelVibe}.`;
      
      const res = await fetch('/api/trip-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context })
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data && data.suggestions) {
          setIntelligenceSuggestions(data.suggestions);
        }
      }
    } catch (e) {
      console.error('Failed to generate intelligence', e);
    } finally {
      setIsGeneratingIntelligence(false);
    }
  };
  const [targetDayNumber, setTargetDayNumber] = useState(1);

  // Quick add stop state for Step 1
  const [newStopCity, setNewStopCity] = useState('');
  const [newStopCountry, setNewStopCountry] = useState('');

  // Destination curated recommendations
  const matchedDest = POPULAR_DESTINATIONS.find(
    d => d.name.toLowerCase() === (selectedTrip?.stops?.find(s => s.id === selectedStopId)?.cityName || '').toLowerCase()
      || selectedTrip?.title.toLowerCase().includes(d.name.toLowerCase())
  );

  if (!selectedTrip) {
    return (
      <div className="editorial-card p-12 text-center max-w-md mx-auto my-12 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-[#F0EAE1] text-[#964223] flex items-center justify-center mx-auto">
          <Luggage className="w-8 h-8" />
        </div>
        <h2 className="font-serif-heading text-xl font-bold text-[#2C221E]">No Journey Selected</h2>
        <p className="text-[#6B5E55] text-xs leading-relaxed">
          Select or plan a new journey to begin architecting daily stops and itinerary activities.
        </p>
        <Link 
          to="/trips/new" 
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#964223] text-white rounded-xl text-xs font-bold"
        >
          <Plus className="w-4 h-4" />
          <span>Plan New Journey</span>
        </Link>
      </div>
    );
  }

  const currentStop = selectedTrip.stops?.find(s => s.id === selectedStopId) || selectedTrip.stops?.[0];

  // Helper to get total activities count in trip
  const totalActivitiesCount = (selectedTrip.stops || []).reduce((sum, stop) => {
    return sum + (stop.days || []).reduce((dSum, day) => dSum + (day.activities?.length || 0), 0);
  }, 0);

  // Helper for category styling & icon
  const getCategoryMeta = (cat: ActivityCategory) => {
    switch (cat) {
      case 'dining':
        return { icon: Utensils, label: 'Dining & Food', color: 'text-amber-700 bg-amber-100/70 border-amber-200' };
      case 'transport':
        return { icon: Train, label: 'Transit & Travel', color: 'text-blue-700 bg-blue-100/70 border-blue-200' };
      case 'lodging':
        return { icon: BedDouble, label: 'Lodging / Stay', color: 'text-purple-700 bg-purple-100/70 border-purple-200' };
      case 'leisure':
        return { icon: Trees, label: 'Leisure & Nature', color: 'text-emerald-700 bg-emerald-100/70 border-emerald-200' };
      case 'sightseeing':
      default:
        return { icon: Camera, label: 'Sightseeing & Culture', color: 'text-[#964223] bg-[#F4EBE3] border-[#E8D8CA]' };
    }
  };

  const handleAddCustomActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivityTitle.trim() || !currentStop) return;

    const newActivity: ActivityItem = {
      id: 'act-' + Date.now(),
      title: newActivityTitle.trim(),
      time: newActivityTime,
      duration: newActivityDuration,
      category: newActivityCategory,
      cost: Number(newActivityCost) || 0,
      notes: newActivityNotes,
      isCustom: true
    };

    addActivityToStop(selectedTrip.id, currentStop.id, newActivity, targetDayNumber);

    // Reset form
    setNewActivityTitle('');
    setNewActivityCost('0');
    setNewActivityNotes('');
    setIsAddModalOpen(false);
  };

  const handleAddCuratedActivity = (activity: any) => {
    if (!currentStop) return;
    const newActivity: ActivityItem = {
      id: 'act-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      title: activity.title,
      time: activity.time || '11:00',
      duration: activity.duration || '2 hrs',
      category: activity.category,
      cost: activity.cost || 0,
      notes: activity.description
    };
    addActivityToStop(selectedTrip.id, currentStop.id, newActivity, 1);
  };

  const handleMoveStop = (idx: number, direction: 'up' | 'down') => {
    if (!selectedTrip.stops) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= selectedTrip.stops.length) return;

    const newStops = [...selectedTrip.stops];
    const [moved] = newStops.splice(idx, 1);
    newStops.splice(targetIdx, 0, moved);
    reorderStops(selectedTrip.id, newStops);
  };

  const handleAddNewStop = () => {
    if (!newStopCity.trim()) return;
    const newStop: CityStop = {
      id: 'stop-' + Date.now(),
      cityName: newStopCity.trim(),
      country: newStopCountry.trim() || 'Worldwide',
      arrivalDate: selectedTrip.startDate,
      departureDate: selectedTrip.endDate,
      days: [
        {
          dayNumber: 1,
          date: selectedTrip.startDate,
          title: `Day 1 in ${newStopCity.trim()}`,
          activities: []
        }
      ]
    };
    addStopToTrip(selectedTrip.id, newStop);
    setNewStopCity('');
    setNewStopCountry('');
  };

  return (
    <>
      <RouteBackground />
      <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Top Journey Header & Controls */}
      <div className="editorial-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#EAE2D5]">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#964223] mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Itinerary Architect</span>
              <span className="text-[#8F8175]">·</span>
              <span className="text-[#6B5E55]">{selectedTrip.travelVibe}</span>
            </div>
            
            <h1 className="font-serif-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2C221E] tracking-tight">
              {selectedTrip.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#6B5E55] mt-2">
              {selectedTrip.createdAt && (
                <>
                  <span className="flex items-center gap-1 font-medium">
                    Created on {new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(selectedTrip.createdAt))}
                  </span>
                  <span className="text-[#D9CBBA]">·</span>
                </>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#964223]" />
                {selectedTrip.startDate} &rarr; {selectedTrip.endDate}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 font-semibold text-[#2C221E]">
                <MapPin className="w-3.5 h-3.5 text-[#964223]" />
                {selectedTrip.stops?.length || 0} City Stops
              </span>
              <span>·</span>
              <span className="font-semibold text-[#2C221E]">
                {totalActivitiesCount} Activities Planned
              </span>
            </div>
          </div>

          {/* Quick Actions & Trip Switcher */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to={`/budget?tripId=${selectedTrip.id}`}
              id="itinerary-view-budget-cta"
              className="px-4 py-2.5 rounded-xl bg-[#F0EAE1] hover:bg-[#EAE2D5] text-[#2C221E] text-xs font-bold transition-colors flex items-center gap-1.5 border border-[#E3D9CB]"
            >
              <DollarSign className="w-3.5 h-3.5 text-[#964223]" />
              <span>Live Budget ({formatCurrentCurrency(convertCostToCurrentCurrency(selectedTrip.totalBudget || 0, selectedTrip.currency))})</span>
            </Link>

            {trips.length > 1 && (
              <div className="relative">
                <select
                  value={selectedTrip.id}
                  onChange={(e) => setSearchParams({ tripId: e.target.value })}
                  className="px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#E0D7C8] text-xs font-semibold text-[#2C221E] focus:outline-hidden focus:ring-2 focus:ring-[#964223]/30"
                >
                  {trips.map(t => (
                    <option key={t.id} value={t.id}>
                      Trip: {t.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* 3-Step Wizard Navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            id="step-1-stops-btn"
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
              currentStep === 1
                ? 'bg-[#FAF7F2] border-[#964223] ring-1 ring-[#964223] shadow-xs'
                : 'bg-[#FCFAF6] border-[#EAE2D5] text-[#6B5E55] hover:border-[#D9CBBA]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8F8175]">Step 1</span>
              <span className="text-xs font-bold text-[#2C221E]">{selectedTrip.stops?.length || 0} Cities</span>
            </div>
            <p className="font-serif-heading font-bold text-sm text-[#2C221E] mt-0.5">
              1. City Stops & Route
            </p>
          </button>

          <button
            type="button"
            onClick={() => setCurrentStep(2)}
            id="step-2-activities-btn"
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
              currentStep === 2
                ? 'bg-[#FAF7F2] border-[#964223] ring-1 ring-[#964223] shadow-xs'
                : 'bg-[#FCFAF6] border-[#EAE2D5] text-[#6B5E55] hover:border-[#D9CBBA]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8F8175]">Step 2</span>
              <span className="text-xs font-bold text-[#2C221E]">{totalActivitiesCount} Planned</span>
            </div>
            <p className="font-serif-heading font-bold text-sm text-[#2C221E] mt-0.5">
              2. Day-by-Day Activities
            </p>
          </button>

          <button
            type="button"
            onClick={() => setCurrentStep(3)}
            id="step-3-overview-btn"
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
              currentStep === 3
                ? 'bg-[#FAF7F2] border-[#964223] ring-1 ring-[#964223] shadow-xs'
                : 'bg-[#FCFAF6] border-[#EAE2D5] text-[#6B5E55] hover:border-[#D9CBBA]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8F8175]">Step 3</span>
              <span className="text-xs font-bold text-[#2C221E]">Timeline View</span>
            </div>
            <p className="font-serif-heading font-bold text-sm text-[#2C221E] mt-0.5">
              3. Chronological Itinerary
            </p>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STEP 1: CITY STOPS & ROUTE SEQUENCING                                     */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <div className="editorial-card p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#EAE2D5]">
            <div>
              <h2 className="font-serif-heading text-xl font-bold text-[#2C221E]">
                Route Circuit & Multi-City Stops
              </h2>
              <p className="text-xs text-[#6B5E55]">
                Order your travel circuit logically to optimize transit and train legs.
              </p>
            </div>
            <button
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#964223] text-white rounded-xl text-xs font-bold hover:bg-[#7D351B]"
            >
              <span>Next: Plan Activities</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Stops Reordering List */}
          <div className="space-y-3">
            {selectedTrip.stops?.map((stop, idx) => (
              <div 
                key={stop.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-[#FAF7F2] border border-[#E0D7C8] shadow-2xs"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-[#EAE2D5] text-[#2C221E] font-serif-heading font-bold text-sm flex items-center justify-center">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif-heading font-bold text-base text-[#2C221E]">
                        {stop.cityName}
                      </h3>
                      <span className="text-xs text-[#8F8175]">({stop.country})</span>
                    </div>
                    <p className="text-[11px] text-[#6B5E55]">
                      {(stop.days || []).reduce((s, d) => s + (d.activities?.length || 0), 0)} activities scheduled
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Move Up/Down Controls */}
                  <button
                    type="button"
                    onClick={() => handleMoveStop(idx, 'up')}
                    disabled={idx === 0}
                    className="p-2 text-[#8F8175] hover:text-[#2C221E] disabled:opacity-30 rounded-lg hover:bg-[#EAE2D5]"
                    title="Move stop earlier"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMoveStop(idx, 'down')}
                    disabled={idx === (selectedTrip.stops?.length || 0) - 1}
                    className="p-2 text-[#8F8175] hover:text-[#2C221E] disabled:opacity-30 rounded-lg hover:bg-[#EAE2D5]"
                    title="Move stop later"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => removeStopFromTrip(selectedTrip.id, stop.id)}
                    className="p-2 text-[#8F8175] hover:text-rose-600 rounded-lg hover:bg-rose-50 ml-2"
                    title="Remove stop"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Add Stop to Route */}
          <div className="p-4 rounded-2xl bg-[#F0EAE1]/70 border border-[#E3D9CB] space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B5E55] block">
              + Append Another Stop to Circuit
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              <datalist id="builder-cities-list">
                {POPULAR_DESTINATIONS.map(d => (
                  <option key={d.id} value={d.name}>{d.country}</option>
                ))}
              </datalist>
              <input
                type="text"
                list="builder-cities-list"
                placeholder="City Name (e.g. Udaipur)"
                value={newStopCity}
                onChange={(e) => {
                  const val = e.target.value;
                  setNewStopCity(val);
                  const match = POPULAR_DESTINATIONS.find(d => d.name.toLowerCase() === val.toLowerCase());
                  if (match && !newStopCountry) {
                    setNewStopCountry(match.country);
                  }
                }}
                className="sm:col-span-3 px-3.5 py-2.5 bg-white border border-[#D9CBBA] rounded-xl text-xs text-[#2C221E] focus:outline-hidden focus:ring-2 focus:ring-[#964223]/30"
              />
              <div className="sm:col-span-2 flex gap-2">
                <input
                  type="text"
                  placeholder="Country (e.g. India)"
                  value={newStopCountry}
                  onChange={(e) => setNewStopCountry(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D9CBBA] rounded-xl text-xs text-[#2C221E] focus:outline-hidden focus:ring-2 focus:ring-[#964223]/30"
                />
                <button
                  type="button"
                  onClick={handleAddNewStop}
                  className="px-4 py-2.5 rounded-xl bg-[#2C221E] text-white text-xs font-bold hover:bg-black transition-colors shrink-0"
                >
                  Add Stop
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: ACTIVITY PLANNER BY CITY STOP                                     */}
      {/* ========================================================================= */}
      {currentStep === 2 && (
        <div className="space-y-6">
          
          {/* City Stop Tabs Navigation */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {selectedTrip.stops?.map((stop, idx) => {
              const isSelected = (stop.id === selectedStopId) || (!selectedStopId && idx === 0);
              const stopActsCount = (stop.days || []).reduce((s, d) => s + (d.activities?.length || 0), 0);

              return (
                <button
                  key={stop.id}
                  id={`stop-tab-${stop.id}`}
                  onClick={() => setSelectedStopId(stop.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl border text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-[#964223] text-white border-[#964223] shadow-xs'
                      : 'bg-[#FCFAF6] border-[#EAE2D5] text-[#6B5E55] hover:bg-[#FAF7F2] hover:border-[#D9CBBA]'
                  }`}
                >
                  <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-[#FAF7F2]' : 'text-[#964223]'}`} />
                  <span>{stop.cityName}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-[#EAE2D5] text-[#2C221E]'
                  }`}>
                    {stopActsCount}
                  </span>
                </button>
              );
            })}
          </div>

          {currentStop && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left 2 Columns: Scheduled Daily Activities */}
              <div className="lg:col-span-2 space-y-6">
                
                <div className="editorial-card p-6 sm:p-8 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAE2D5]">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#964223]">
                        Daily Itinerary
                      </span>
                      <h3 className="font-serif-heading text-xl sm:text-2xl font-bold text-[#2C221E]">
                        Experiences in {currentStop.cityName}
                      </h3>
                    </div>

                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      id="open-add-activity-modal-btn"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#964223] text-white text-xs font-bold hover:bg-[#7D351B] transition-all shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Custom Activity</span>
                    </button>
                  </div>

                  {/* Days breakdown */}
                  {(!currentStop.days || currentStop.days.length === 0 || currentStop.days.every(d => d.activities.length === 0)) ? (
                    <div className="p-8 text-center bg-[#FAF7F2] rounded-2xl border border-dashed border-[#D9CBBA] space-y-3">
                      <Compass className="w-8 h-8 text-[#8F8175] mx-auto" />
                      <p className="font-serif-heading font-bold text-[#2C221E] text-base">
                        No activities scheduled in {currentStop.cityName} yet
                      </p>
                      <p className="text-xs text-[#6B5E55] max-w-sm mx-auto">
                        Add curated authentic experiences from the suggestions on the right or craft your custom activity!
                      </p>
                      <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2C221E] text-white text-xs font-bold"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add First Activity</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {currentStop.days.map((day) => (
                        <div key={day.dayNumber} className="space-y-3">
                          <div className="flex items-center justify-between pb-1 border-b border-[#EAE2D5]">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-[#964223]" />
                              <h4 className="font-serif-heading font-bold text-sm text-[#2C221E]">
                                Day {day.dayNumber}: {day.title || `Exploration`}
                              </h4>
                            </div>
                            <span className="text-xs text-[#8F8175] font-medium">
                              Subtotal: ${day.activities.reduce((s, a) => s + (a.cost || 0), 0)}
                            </span>
                          </div>

                          <div className="space-y-2.5">
                            {day.activities.map((act) => {
                              const meta = getCategoryMeta(act.category);
                              const Icon = meta.icon;

                              return (
                                <div 
                                  key={act.id}
                                  className="group flex items-center justify-between p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E0D7C8] hover:border-[#D4C4B0] transition-all"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${meta.color}`}>
                                      <Icon className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <p className="font-semibold text-xs text-[#2C221E]">
                                          {act.title}
                                        </p>
                                        <span className="text-[10px] font-medium text-[#8F8175] bg-[#EAE2D5] px-1.5 py-0.5 rounded">
                                          {meta.label}
                                        </span>
                                      </div>
                                      
                                      <div className="flex items-center gap-3 text-[11px] text-[#6B5E55] mt-1">
                                        {act.time && (
                                          <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3 text-[#8F8175]" />
                                            {act.time}
                                          </span>
                                        )}
                                        {act.duration && (
                                          <span>· {act.duration}</span>
                                        )}
                                        {act.notes && (
                                          <span className="text-[#8F8175] truncate max-w-[200px]">· {act.notes}</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <span className="font-semibold text-xs text-[#2C221E]">
                                      {act.cost ? `$${act.cost}` : 'Free'}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => removeActivityFromStop(selectedTrip.id, currentStop.id, act.id)}
                                      className="p-1 text-[#8F8175] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                      title="Remove activity"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Right Column: Curated Recommendations & AI Intelligence */}
              <div className="space-y-4">
                {/* Trip Intelligence Panel */}
                <div className="editorial-card p-5 space-y-4 bg-gradient-to-br from-[#FAF7F2] to-[#F5F1E8]">
                  <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D5]">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <h4 className="font-serif-heading font-bold text-sm text-[#2C221E]">
                        Trip Intelligence
                      </h4>
                    </div>
                    {!isIntelligenceOpen && (
                      <button
                        onClick={handleGenerateIntelligence}
                        className="btn-glass text-[10px] font-bold px-2.5 py-1 text-amber-700 bg-amber-100/50 hover:bg-amber-100 cursor-pointer"
                      >
                        ✨ Ask AI
                      </button>
                    )}
                  </div>
                  
                  {isIntelligenceOpen && (
                    <div className="space-y-3">
                      {isGeneratingIntelligence ? (
                        <div className="flex flex-col items-center justify-center py-6 space-y-3">
                          <Sparkles className="w-6 h-6 text-amber-500 animate-spin-slow" />
                          <p className="text-xs font-medium text-[#6B5E55] animate-pulse">Generating insights...</p>
                        </div>
                      ) : (
                        intelligenceSuggestions.map((suggestion, idx) => (
                          <div key={idx} className="p-3 bg-white/60 border border-amber-100/60 rounded-xl shadow-[0_2px_10px_-2px_rgba(150,66,35,0.05)] backdrop-blur-sm transition-all hover:bg-white/80">
                            <h5 className="font-bold text-xs text-[#2C221E] mb-1">{suggestion.title}</h5>
                            <p className="text-[10px] text-[#6B5E55] leading-relaxed mb-2">{suggestion.body}</p>
                            {suggestion.actionable && suggestion.actionActivity && (
                              <button
                                onClick={() => addActivityToStop(selectedTrip.id, currentStop.id, {
                                  id: 'ai-act-' + Date.now(),
                                  title: suggestion.actionActivity.title,
                                  category: (suggestion.actionActivity.category as ActivityCategory) || 'sightseeing',
                                  cost: suggestion.actionActivity.cost || 0,
                                  duration: suggestion.actionActivity.duration || '2 hrs',
                                  isCustom: true
                                }, 1)}
                                className="text-[10px] font-bold text-[#964223] hover:text-[#7D351B] flex items-center gap-1 cursor-pointer"
                              >
                                <Plus className="w-3 h-3" /> Add to Itinerary
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <div className="editorial-card p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D5]">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#964223]" />
                      <h4 className="font-serif-heading font-bold text-sm text-[#2C221E]">
                        Curated for {currentStop.cityName}
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold uppercase text-[#8F8175]">1-Click Add</span>
                  </div>

                  {matchedDest && matchedDest.curatedActivities ? (
                    <div className="space-y-2.5">
                      {matchedDest.curatedActivities.map((cAct) => {
                        const meta = getCategoryMeta(cAct.category);
                        const Icon = meta.icon;

                        return (
                          <div 
                            key={cAct.id}
                            className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E0D7C8] space-y-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2">
                                <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 border ${meta.color}`}>
                                  <Icon className="w-3 h-3" />
                                </div>
                                <div>
                                  <p className="font-semibold text-xs text-[#2C221E] leading-tight">
                                    {cAct.title}
                                  </p>
                                  <span className="text-[10px] text-[#8F8175]">
                                    {cAct.duration} · ${cAct.cost}
                                  </span>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleAddCuratedActivity(cAct)}
                                className="px-2.5 py-1 rounded-lg bg-[#964223] hover:bg-[#7D351B] text-white text-[10px] font-bold shrink-0 transition-colors cursor-pointer"
                              >
                                + Add
                              </button>
                            </div>
                            <p className="text-[11px] text-[#6B5E55] line-clamp-2 leading-snug">
                              {cAct.description}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-xs text-[#6B5E55]">
                      <p>Browse explore guide for more suggestions or add your custom experiences above.</p>
                      <Link to="/explore" className="text-[#964223] font-bold mt-2 inline-block hover:underline">
                        Search Destination Guide &rarr;
                      </Link>
                    </div>
                  )}
                </div>

                {/* Stop Quick Notes */}
                <div className="editorial-card p-5 space-y-2">
                  <h4 className="font-serif-heading font-bold text-xs text-[#2C221E] uppercase tracking-wider">
                    Stop Details: {currentStop.cityName}
                  </h4>
                  <p className="text-xs text-[#6B5E55] leading-relaxed">
                    Arrival: <span className="font-semibold text-[#2C221E]">{currentStop.arrivalDate}</span> · Departure: <span className="font-semibold text-[#2C221E]">{currentStop.departureDate}</span>
                  </p>
                  <p className="text-[11px] text-[#8F8175]">
                    Costs added here automatically synchronize with your <strong>Trip Budget</strong> live.
                  </p>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: COMPREHENSIVE CHRONOLOGICAL TIMELINE                              */}
      {/* ========================================================================= */}
      {currentStep === 3 && (
        <div className="editorial-card p-6 sm:p-10 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EAE2D5]">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#964223]">
                Editorial Summary
              </span>
              <h2 className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#2C221E]">
                Full Chronological Itinerary
              </h2>
              <p className="text-xs text-[#6B5E55]">
                A clean, comprehensive overview of all destinations, times, and activities
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-[#F0EAE1] hover:bg-[#EAE2D5] text-[#2C221E] text-xs font-bold flex items-center gap-1.5 border border-[#E3D9CB]"
              >
                <Printer className="w-3.5 h-3.5 text-[#964223]" />
                <span>Print Itinerary</span>
              </button>

              <Link
                to={`/budget?tripId=${selectedTrip.id}`}
                className="px-4 py-2 rounded-xl bg-[#964223] text-white text-xs font-bold hover:bg-[#7D351B] flex items-center gap-1.5"
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Budget & Expense Sync</span>
              </Link>
            </div>
          </div>

          {/* Timeline Sequence across all stops */}
          <div className="space-y-8">
            {selectedTrip.stops?.map((stop, sIdx) => (
              <div key={stop.id} className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-[#964223] text-white font-serif-heading font-bold text-xs flex items-center justify-center">
                    {sIdx + 1}
                  </span>
                  <div>
                    <h3 className="font-serif-heading text-xl font-bold text-[#2C221E]">
                      Stop {sIdx + 1}: {stop.cityName}, {stop.country}
                    </h3>
                    <p className="text-xs text-[#8F8175]">
                      {stop.arrivalDate} to {stop.departureDate}
                    </p>
                  </div>
                </div>

                <div className="pl-4 sm:pl-11 space-y-3">
                  {stop.days?.map((day) => (
                    <div key={day.dayNumber} className="editorial-card p-4 space-y-2.5">
                      <div className="flex items-center justify-between pb-1.5 border-b border-[#EAE2D5]">
                        <span className="font-serif-heading font-bold text-xs text-[#2C221E]">
                          Day {day.dayNumber} · {day.title}
                        </span>
                        <span className="text-[11px] font-semibold text-[#8F8175]">
                          Day Cost: ${day.activities.reduce((s, a) => s + (a.cost || 0), 0)}
                        </span>
                      </div>

                      {day.activities.length === 0 ? (
                        <p className="text-xs text-[#8F8175] italic py-2">
                          No activities added yet for this day.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {day.activities.map((act) => {
                            const meta = getCategoryMeta(act.category);
                            const Icon = meta.icon;

                            return (
                              <div 
                                key={act.id} 
                                className="flex items-center justify-between text-xs py-1"
                              >
                                <div className="flex items-center gap-2.5">
                                  <span className="text-[#8F8175] font-mono text-[11px] w-12 shrink-0">
                                    {act.time || '—'}
                                  </span>
                                  <Icon className="w-3.5 h-3.5 text-[#964223]" />
                                  <span className="font-semibold text-[#2C221E]">{act.title}</span>
                                  {act.duration && (
                                    <span className="text-[#8F8175] text-[11px]">({act.duration})</span>
                                  )}
                                </div>
                                <span className="font-bold text-[#2C221E]">
                                  {act.cost ? formatPrice(act.cost) : 'Free'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CUSTOM ACTIVITY MODAL                                                     */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="editorial-card w-full max-w-lg p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#EAE2D5]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#964223]">
                  {currentStop?.cityName}
                </span>
                <h3 className="font-serif-heading text-xl font-bold text-[#2C221E]">
                  Add Custom Experience
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#8F8175] hover:text-[#2C221E] text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustomActivity} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6B5E55] mb-1">
                  Activity Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunrise Yoga overlooking the valley"
                  value={newActivityTitle}
                  onChange={(e) => setNewActivityTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E0D7C8] rounded-xl text-xs text-[#2C221E] focus:outline-hidden focus:ring-2 focus:ring-[#964223]/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#6B5E55] mb-1">
                    Category
                  </label>
                  <select
                    value={newActivityCategory}
                    onChange={(e) => setNewActivityCategory(e.target.value as ActivityCategory)}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E0D7C8] rounded-xl text-xs text-[#2C221E]"
                  >
                    <option value="sightseeing">Sightseeing & Culture</option>
                    <option value="dining">Dining & Food</option>
                    <option value="transport">Transit & Travel</option>
                    <option value="lodging">Lodging / Stay</option>
                    <option value="leisure">Leisure & Nature</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#6B5E55] mb-1">
                    Target Day #
                  </label>
                  <select
                    value={targetDayNumber}
                    onChange={(e) => setTargetDayNumber(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E0D7C8] rounded-xl text-xs text-[#2C221E]"
                  >
                    <option value={1}>Day 1</option>
                    <option value={2}>Day 2</option>
                    <option value={3}>Day 3</option>
                    <option value={4}>Day 4</option>
                    <option value={5}>Day 5</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#6B5E55] mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={newActivityTime}
                    onChange={(e) => setNewActivityTime(e.target.value)}
                    className="w-full px-2.5 py-2 bg-[#FAF7F2] border border-[#E0D7C8] rounded-xl text-xs text-[#2C221E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#6B5E55] mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    placeholder="2 hrs"
                    value={newActivityDuration}
                    onChange={(e) => setNewActivityDuration(e.target.value)}
                    className="w-full px-2.5 py-2 bg-[#FAF7F2] border border-[#E0D7C8] rounded-xl text-xs text-[#2C221E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#6B5E55] mb-1">
                    Cost ({currency === 'INR' ? '₹' : '$'})
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newActivityCost}
                    onChange={(e) => setNewActivityCost(e.target.value)}
                    className="w-full px-2.5 py-2 bg-[#FAF7F2] border border-[#E0D7C8] rounded-xl text-xs text-[#2C221E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6B5E55] mb-1">
                  Notes / Location Details
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Bring walking shoes, meet at hotel lobby"
                  value={newActivityNotes}
                  onChange={(e) => setNewActivityNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#E0D7C8] rounded-xl text-xs text-[#2C221E]"
                />
              </div>

              <div className="pt-4 border-t border-[#EAE2D5] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#D9CBBA] text-xs font-bold text-[#6B5E55]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#964223] text-white text-xs font-bold hover:bg-[#7D351B]"
                >
                  Add to Itinerary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </>
  );
};
