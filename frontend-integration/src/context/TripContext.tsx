
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Trip, CityStop, BudgetItem, ActivityItem } from '../types';
import { useAuth } from './AuthContext';
import { apiFetch } from '../lib/api';

interface TripContextType {
  trips: Trip[];
  activeTrip: Trip | null;
  setActiveTripId: (id: string) => void;
  getTripById: (id: string) => Trip | undefined;
  createTrip: (tripData: Partial<Trip>) => Trip;
  updateTrip: (id: string, tripData: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;
  duplicateTrip: (id: string) => Trip | undefined;
  addStopToTrip: (tripId: string, stop: CityStop) => void;
  removeStopFromTrip: (tripId: string, stopId: string) => void;
  reorderStops: (tripId: string, newStops: CityStop[]) => void;
  addActivityToStop: (tripId: string, stopId: string, activity: ActivityItem, dayNumber?: number) => void;
  removeActivityFromStop: (tripId: string, stopId: string, activityId: string) => void;
  addBudgetItem: (tripId: string, item: BudgetItem) => void;
  updateBudgetItem: (tripId: string, itemId: string, itemData: Partial<BudgetItem>) => void;
  removeBudgetItem: (tripId: string, itemId: string) => void;
  toggleBudgetItemPaid: (tripId: string, itemId: string) => void;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const TripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [activeTripId, setActiveTripIdState] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!user) {
        setTrips([]);
        setActiveTripIdState('');
        return;
      }
      try {
        const data = await apiFetch<{ trips: Trip[] }>('/trips');
        if (!cancelled) {
          setTrips(data.trips);
          setActiveTripIdState(prev => data.trips.some(t => t.id === prev) ? prev : (data.trips[0]?.id || ''));
        }
      } catch (error) {
        console.error('Failed to load trips:', error);
        if (!cancelled) {
          setTrips([]);
          setActiveTripIdState('');
        }
      }
    };
    load();
    return () => { cancelled = true; };
  }, [user?.id]);

  const getTripById = (id: string) => trips.find(t => t.id === id);
  const activeTrip = trips.find(t => t.id === activeTripId) || trips[0] || null;

  const persistTrip = (trip: Trip) => {
    void apiFetch<{ trip: Trip }>(`/trips/${trip.id}`, {
      method: 'PATCH',
      body: JSON.stringify(trip)
    }).then(data => {
      setTrips(prev => prev.map(t => t.id === data.trip.id ? data.trip : t));
    }).catch(error => console.error('Failed to persist trip:', error));
  };

  const createTrip = (tripData: Partial<Trip>): Trip => {
    const budget = Number(tripData.totalBudget) || 2500;
    const transport = tripData.aiTransportEstimates || [];
    const now = new Date().toISOString();
    const baseId = tripData.id || makeId('trip');
    const newTrip: Trip = {
      id: baseId,
      createdAt: now,
      title: tripData.title || 'New Multi-City Journey',
      description: tripData.description || 'Custom multi-destination itinerary',
      coverImage: tripData.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
      startDate: tripData.startDate || new Date().toISOString().split('T')[0],
      endDate: tripData.endDate || new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
      status: tripData.status || 'planning',
      travelVibe: tripData.travelVibe || 'Discovery & Adventure',
      totalBudget: budget,
      currency: tripData.currency || 'USD',
      destinationTheme: tripData.destinationTheme,
      boardingFrom: tripData.boardingFrom,
      aiTransportEstimates: transport,
      stops: tripData.stops || [],
      budgetItems: tripData.budgetItems || [
        { id: makeId('b'), category: 'Flights', estimatedCost: transport.reduce((acc: number, e: any) => acc + Number(e.estimated_cost_usd || 0), 0) || Math.round(budget * 0.35), actualCost: 0, paid: false, notes: transport.length ? '✨ AI Estimated Transport (Origin -> Destination)' : 'Roundtrip & regional transport', currency: transport.length ? 'USD' : (tripData.currency || 'USD') },
        { id: makeId('b'), category: 'Lodging', estimatedCost: Math.round(budget * 0.40), actualCost: 0, paid: false, notes: 'Boutique hotels & havelis', currency: tripData.currency || 'USD' },
        { id: makeId('b'), category: 'Food & Drinks', estimatedCost: Math.round(budget * 0.15), actualCost: 0, paid: false, notes: 'Daily culinary adventures', currency: tripData.currency || 'USD' },
        { id: makeId('b'), category: 'Activities', estimatedCost: Math.round(budget * 0.10), actualCost: 0, paid: false, notes: 'Local tours & experiences', currency: tripData.currency || 'USD' }
      ]
    };

    setTrips(prev => [newTrip, ...prev]);
    setActiveTripIdState(newTrip.id);
    void apiFetch('/trips', { method: 'POST', body: JSON.stringify(newTrip) })
      .then((data: { trip: Trip }) => setTrips(prev => prev.map(t => t.id === data.trip.id ? data.trip : t)))
      .catch(error => console.error('Failed to create trip:', error));
    return newTrip;
  };

  const updateTrip = (id: string, tripData: Partial<Trip>) => {
    const current = getTripById(id);
    if (!current) return;
    const updated = { ...current, ...tripData };
    setTrips(prev => prev.map(t => t.id === id ? updated : t));
    persistTrip(updated);
  };

  const deleteTrip = (id: string) => {
    setTrips(prev => prev.filter(t => t.id !== id));
    if (activeTripId === id) setActiveTripIdState(trips.find(t => t.id !== id)?.id || '');
    void apiFetch(`/trips/${id}`, { method: 'DELETE' }).catch(error => console.error('Failed to delete trip:', error));
  };

  const duplicateTrip = (id: string): Trip | undefined => {
    const target = getTripById(id);
    if (!target) return undefined;
    const cloned: Trip = {
      ...target,
      id: makeId('trip'),
      createdAt: new Date().toISOString(),
      title: `${target.title} (Copy)`,
      status: 'planning',
      stops: target.stops.map(s => ({ ...s, id: makeId('stop') })),
      budgetItems: target.budgetItems?.map(b => ({ ...b, id: makeId('b') }))
    };
    setTrips(prev => [cloned, ...prev]);
    void apiFetch('/trips', { method: 'POST', body: JSON.stringify(cloned) }).catch(error => console.error('Failed to duplicate trip:', error));
    return cloned;
  };

  const mutateTrip = (id: string, transform: (trip: Trip) => Trip) => {
    const current = getTripById(id);
    if (!current) return;
    const updated = transform(current);
    setTrips(prev => prev.map(t => t.id === id ? updated : t));
    persistTrip(updated);
  };

  const addStopToTrip = (tripId: string, stop: CityStop) => mutateTrip(tripId, t => ({ ...t, stops: [...t.stops, stop] }));
  const removeStopFromTrip = (tripId: string, stopId: string) => mutateTrip(tripId, t => ({ ...t, stops: t.stops.filter(s => s.id !== stopId) }));
  const reorderStops = (tripId: string, newStops: CityStop[]) => mutateTrip(tripId, t => ({ ...t, stops: newStops }));

  const addActivityToStop = (tripId: string, stopId: string, activity: ActivityItem, dayNumber = 1) => {
    mutateTrip(tripId, t => ({
      ...t,
      stops: t.stops.map(stop => {
        if (stop.id !== stopId) return stop;
        const days = (stop.days && stop.days.length ? stop.days : []).map(d => ({ ...d, activities: [...d.activities] }));
        const found = days.find(d => d.dayNumber === dayNumber);
        if (found) {
          found.activities.push(activity);
        } else {
          days.push({ dayNumber, date: stop.arrivalDate || t.startDate, title: `Day ${dayNumber} in ${stop.cityName}`, activities: [activity] });
        }
        return { ...stop, days };
      })
    }));
  };

  const removeActivityFromStop = (tripId: string, stopId: string, activityId: string) => {
    mutateTrip(tripId, t => ({
      ...t,
      stops: t.stops.map(stop => stop.id !== stopId ? stop : {
        ...stop,
        days: (stop.days || []).map(day => ({ ...day, activities: day.activities.filter(a => a.id !== activityId) }))
      })
    }));
  };

  const addBudgetItem = (tripId: string, item: BudgetItem) => mutateTrip(tripId, t => ({ ...t, budgetItems: [...(t.budgetItems || []), item] }));
  const updateBudgetItem = (tripId: string, itemId: string, itemData: Partial<BudgetItem>) => mutateTrip(tripId, t => ({ ...t, budgetItems: (t.budgetItems || []).map(b => b.id === itemId ? { ...b, ...itemData } : b) }));
  const removeBudgetItem = (tripId: string, itemId: string) => mutateTrip(tripId, t => ({ ...t, budgetItems: (t.budgetItems || []).filter(b => b.id !== itemId) }));
  const toggleBudgetItemPaid = (tripId: string, itemId: string) => mutateTrip(tripId, t => ({ ...t, budgetItems: (t.budgetItems || []).map(b => b.id === itemId ? { ...b, paid: !b.paid } : b) }));

  return (
    <TripContext.Provider value={{
      trips, activeTrip, setActiveTripId: setActiveTripIdState, getTripById, createTrip, updateTrip, deleteTrip, duplicateTrip,
      addStopToTrip, removeStopFromTrip, reorderStops, addActivityToStop, removeActivityFromStop,
      addBudgetItem, updateBudgetItem, removeBudgetItem, toggleBudgetItemPaid
    }}>
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = () => {
  const context = useContext(TripContext);
  if (!context) throw new Error('useTrip must be used within a TripProvider');
  return context;
};
