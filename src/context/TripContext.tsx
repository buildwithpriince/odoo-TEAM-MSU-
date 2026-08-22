import React, { createContext, useContext, useState, useEffect } from 'react';
import { Trip, CityStop, BudgetItem, ActivityItem } from '../types';
import { INITIAL_TRIPS } from '../data/mockData';

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

export const TripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trips, setTrips] = useState<Trip[]>(() => {
    const saved = localStorage.getItem('globetrotter_trips');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        return INITIAL_TRIPS;
      }
    }
    return INITIAL_TRIPS;
  });

  const [activeTripId, setActiveTripIdState] = useState<string>(() => {
    return trips[0]?.id || '';
  });

  useEffect(() => {
    localStorage.setItem('globetrotter_trips', JSON.stringify(trips));
  }, [trips]);

  const getTripById = (id: string) => {
    return trips.find(t => t.id === id);
  };

  const activeTrip = trips.find(t => t.id === activeTripId) || trips[0] || null;

  const setActiveTripId = (id: string) => {
    setActiveTripIdState(id);
  };

  const createTrip = (tripData: Partial<Trip>): Trip => {
    const newTrip: Trip = {
      id: 'trip-' + Date.now(),
      title: tripData.title || 'New Multi-City Journey',
      description: tripData.description || 'Custom multi-destination itinerary',
      coverImage: tripData.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
      startDate: tripData.startDate || new Date().toISOString().split('T')[0],
      endDate: tripData.endDate || new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
      status: 'planning',
      travelVibe: tripData.travelVibe || 'Discovery & Adventure',
      totalBudget: tripData.totalBudget || 2500,
      currency: tripData.currency || 'USD',
      destinationTheme: tripData.destinationTheme,
      stops: tripData.stops || [],
      budgetItems: tripData.budgetItems || [
        { id: 'b-' + Date.now() + '-1', category: 'Flights', estimatedCost: Math.round((tripData.totalBudget || 2500) * 0.35), actualCost: 0, paid: false, notes: 'Roundtrip & regional transport' },
        { id: 'b-' + Date.now() + '-2', category: 'Lodging', estimatedCost: Math.round((tripData.totalBudget || 2500) * 0.40), actualCost: 0, paid: false, notes: 'Boutique hotels & havelis' },
        { id: 'b-' + Date.now() + '-3', category: 'Food & Drinks', estimatedCost: Math.round((tripData.totalBudget || 2500) * 0.15), actualCost: 0, paid: false, notes: 'Daily culinary adventures' },
        { id: 'b-' + Date.now() + '-4', category: 'Activities', estimatedCost: Math.round((tripData.totalBudget || 2500) * 0.10), actualCost: 0, paid: false, notes: 'Local tours & experiences' }
      ]
    };

    setTrips(prev => [newTrip, ...prev]);
    setActiveTripIdState(newTrip.id);
    return newTrip;
  };

  const updateTrip = (id: string, tripData: Partial<Trip>) => {
    setTrips(prev => prev.map(t => t.id === id ? { ...t, ...tripData } : t));
  };

  const deleteTrip = (id: string) => {
    setTrips(prev => prev.filter(t => t.id !== id));
  };

  const duplicateTrip = (id: string): Trip | undefined => {
    const target = trips.find(t => t.id === id);
    if (!target) return undefined;
    const clonedTrip: Trip = {
      ...target,
      id: 'trip-' + Date.now(),
      title: `${target.title} (Copy)`,
      status: 'planning',
      stops: target.stops.map(s => ({
        ...s,
        id: 'stop-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6)
      }))
    };
    setTrips(prev => [clonedTrip, ...prev]);
    return clonedTrip;
  };

  const addStopToTrip = (tripId: string, stop: CityStop) => {
    setTrips(prev => prev.map(t => {
      if (t.id === tripId) {
        return {
          ...t,
          stops: [...t.stops, stop]
        };
      }
      return t;
    }));
  };

  const removeStopFromTrip = (tripId: string, stopId: string) => {
    setTrips(prev => prev.map(t => {
      if (t.id === tripId) {
        return {
          ...t,
          stops: t.stops.filter(s => s.id !== stopId)
        };
      }
      return t;
    }));
  };

  const reorderStops = (tripId: string, newStops: CityStop[]) => {
    setTrips(prev => prev.map(t => {
      if (t.id === tripId) {
        return { ...t, stops: newStops };
      }
      return t;
    }));
  };

  const addActivityToStop = (tripId: string, stopId: string, activity: ActivityItem, dayNumber: number = 1) => {
    setTrips(prev => prev.map(t => {
      if (t.id !== tripId) return t;

      const updatedStops = t.stops.map(stop => {
        if (stop.id !== stopId) return stop;

        const existingDays = stop.days && stop.days.length > 0 ? [...stop.days] : [];
        let dayFound = existingDays.find(d => d.dayNumber === dayNumber);

        if (!dayFound) {
          dayFound = {
            dayNumber: dayNumber,
            date: stop.arrivalDate || t.startDate,
            title: `Day ${dayNumber} in ${stop.cityName}`,
            activities: [activity]
          };
          existingDays.push(dayFound);
        } else {
          dayFound.activities = [...dayFound.activities, activity];
        }

        return { ...stop, days: existingDays };
      });

      return { ...t, stops: updatedStops };
    }));
  };

  const removeActivityFromStop = (tripId: string, stopId: string, activityId: string) => {
    setTrips(prev => prev.map(t => {
      if (t.id !== tripId) return t;

      const updatedStops = t.stops.map(stop => {
        if (stop.id !== stopId || !stop.days) return stop;

        const updatedDays = stop.days.map(d => ({
          ...d,
          activities: d.activities.filter(a => a.id !== activityId)
        }));

        return { ...stop, days: updatedDays };
      });

      return { ...t, stops: updatedStops };
    }));
  };

  const addBudgetItem = (tripId: string, item: BudgetItem) => {
    setTrips(prev => prev.map(t => {
      if (t.id === tripId) {
        return {
          ...t,
          budgetItems: [...(t.budgetItems || []), item]
        };
      }
      return t;
    }));
  };

  const updateBudgetItem = (tripId: string, itemId: string, itemData: Partial<BudgetItem>) => {
    setTrips(prev => prev.map(t => {
      if (t.id === tripId) {
        return {
          ...t,
          budgetItems: (t.budgetItems || []).map(b => b.id === itemId ? { ...b, ...itemData } : b)
        };
      }
      return t;
    }));
  };

  const removeBudgetItem = (tripId: string, itemId: string) => {
    setTrips(prev => prev.map(t => {
      if (t.id === tripId) {
        return {
          ...t,
          budgetItems: (t.budgetItems || []).filter(b => b.id !== itemId)
        };
      }
      return t;
    }));
  };

  const toggleBudgetItemPaid = (tripId: string, itemId: string) => {
    setTrips(prev => prev.map(t => {
      if (t.id === tripId) {
        return {
          ...t,
          budgetItems: (t.budgetItems || []).map(b => b.id === itemId ? { ...b, paid: !b.paid } : b)
        };
      }
      return t;
    }));
  };

  return (
    <TripContext.Provider
      value={{
        trips,
        activeTrip,
        setActiveTripId,
        getTripById,
        createTrip,
        updateTrip,
        deleteTrip,
        duplicateTrip,
        addStopToTrip,
        removeStopFromTrip,
        reorderStops,
        addActivityToStop,
        removeActivityFromStop,
        addBudgetItem,
        updateBudgetItem,
        removeBudgetItem,
        toggleBudgetItemPaid
      }}
    >
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = () => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
};
