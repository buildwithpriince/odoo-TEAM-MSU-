import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth, requireAdmin } from '../auth.js';
import { tripFromRow, userFromRow } from '../serializers.js';

const router = Router();
router.use(requireAuth);
router.use(requireAdmin);

// Overview KPIs
router.get('/overview', (_req, res) => {
  const usersCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as any)?.count || 0;
  const tripsRows = db.prepare('SELECT * FROM trips').all() as any[];
  const trips = tripsRows.map(tripFromRow);

  const totalTrips = trips.length;
  const now = new Date();

  let activeTrips = 0;
  let upcomingTrips = 0;
  let completedTrips = 0;
  let planningTrips = 0;

  let totalDurationDays = 0;
  let validDurationTrips = 0;
  let totalStopsCount = 0;
  let totalActivitiesCount = 0;
  let totalBudget = 0;

  const citySet = new Set<string>();

  for (const trip of trips) {
    if (trip.status === 'planning') planningTrips++;
    
    if (trip.startDate && trip.endDate) {
      const start = new Date(trip.startDate);
      const end = new Date(trip.endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const diffDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
        totalDurationDays += diffDays;
        validDurationTrips++;

        if (start <= now && now <= end) {
          activeTrips++;
        } else if (start > now) {
          upcomingTrips++;
        } else if (end < now) {
          completedTrips++;
        }
      }
    }

    const stops = trip.stops || [];
    totalStopsCount += stops.length;
    for (const stop of stops) {
      if (stop.cityName) citySet.add(stop.cityName.toLowerCase().trim());
      for (const day of stop.days || []) {
        totalActivitiesCount += (day.activities || []).length;
      }
    }

    totalBudget += Number(trip.totalBudget) || 0;
  }

  res.json({
    totalUsers: usersCount,
    totalTrips,
    totalCities: citySet.size,
    totalActivities: totalActivitiesCount,
    activeTrips,
    upcomingTrips,
    completedTrips,
    planningTrips,
    avgTripDurationDays: validDurationTrips > 0 ? Number((totalDurationDays / validDurationTrips).toFixed(1)) : 0,
    avgCitiesPerTrip: totalTrips > 0 ? Number((totalStopsCount / totalTrips).toFixed(1)) : 0,
    avgActivitiesPerTrip: totalTrips > 0 ? Number((totalActivitiesCount / totalTrips).toFixed(1)) : 0,
    avgTargetBudget: totalTrips > 0 ? Math.round(totalBudget / totalTrips) : 0,
    totalBudgetPlanned: totalBudget
  });
});

// Trends over time
router.get('/trends', (req, res) => {
  const period = (req.query.period as string) || 'all';
  const tripsRows = db.prepare('SELECT created_at, start_date FROM trips ORDER BY datetime(created_at) ASC').all() as any[];
  const usersRows = db.prepare('SELECT created_at FROM users ORDER BY datetime(created_at) ASC').all() as any[];

  // Group by month/day depending on span
  const dateMap = new Map<string, { label: string; tripsCreated: number; usersRegistered: number }>();

  for (const t of tripsRows) {
    const raw = t.created_at || t.start_date || new Date().toISOString();
    const d = new Date(raw);
    const key = isNaN(d.getTime()) ? '2026-08' : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = isNaN(d.getTime()) ? 'Aug 2026' : d.toLocaleString('default', { month: 'short', year: 'numeric' });
    
    const existing = dateMap.get(key) || { label, tripsCreated: 0, usersRegistered: 0 };
    existing.tripsCreated++;
    dateMap.set(key, existing);
  }

  for (const u of usersRows) {
    const raw = u.created_at || new Date().toISOString();
    const d = new Date(raw);
    const key = isNaN(d.getTime()) ? '2026-08' : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = isNaN(d.getTime()) ? 'Aug 2026' : d.toLocaleString('default', { month: 'short', year: 'numeric' });

    const existing = dateMap.get(key) || { label, tripsCreated: 0, usersRegistered: 0 };
    existing.usersRegistered++;
    dateMap.set(key, existing);
  }

  const sorted = Array.from(dateMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, data]) => ({
      date,
      label: data.label,
      tripsCreated: data.tripsCreated,
      usersRegistered: data.usersRegistered
    }));

  res.json({ period, trends: sorted });
});

// Popular Cities
router.get('/cities', (_req, res) => {
  const tripsRows = db.prepare('SELECT * FROM trips').all() as any[];
  const trips = tripsRows.map(tripFromRow);

  const cityMap = new Map<string, {
    cityName: string;
    country: string;
    region?: string;
    tripAppearances: number;
    travelers: Set<string>;
    totalDays: number;
    totalActivities: number;
  }>();

  for (const trip of trips) {
    for (const stop of trip.stops || []) {
      const name = (stop.cityName || '').trim();
      if (!name) continue;
      const key = name.toLowerCase();

      let daysInStop = 1;
      if (stop.arrivalDate && stop.departureDate) {
        const arr = new Date(stop.arrivalDate);
        const dep = new Date(stop.departureDate);
        if (!isNaN(arr.getTime()) && !isNaN(dep.getTime())) {
          daysInStop = Math.max(1, Math.round((dep.getTime() - arr.getTime()) / (1000 * 60 * 60 * 24)));
        }
      }

      let acts = 0;
      for (const d of stop.days || []) {
        acts += (d.activities || []).length;
      }

      const existing = cityMap.get(key) || {
        cityName: name,
        country: stop.country || 'International',
        tripAppearances: 0,
        travelers: new Set<string>(),
        totalDays: 0,
        totalActivities: 0
      };

      existing.tripAppearances++;
      if (trip.id) existing.travelers.add(trip.id);
      existing.totalDays += daysInStop;
      existing.totalActivities += acts;
      cityMap.set(key, existing);
    }
  }

  const totalTrips = Math.max(1, trips.length);
  const ranked = Array.from(cityMap.entries())
    .map(([key, data]) => ({
      id: `city-${key}`,
      cityName: data.cityName,
      country: data.country,
      region: data.region,
      tripAppearances: data.tripAppearances,
      uniqueTravelers: data.travelers.size,
      percentageOfTrips: Math.round((data.tripAppearances / totalTrips) * 100),
      averageDaysStayed: Number((data.totalDays / data.tripAppearances).toFixed(1)),
      totalActivitiesInCity: data.totalActivities
    }))
    .sort((a, b) => b.tripAppearances - a.tripAppearances);

  res.json({ cities: ranked });
});

// Popular Activities
router.get('/activities', (_req, res) => {
  const tripsRows = db.prepare('SELECT * FROM trips').all() as any[];
  const trips = tripsRows.map(tripFromRow);

  const actMap = new Map<string, {
    title: string;
    cityName: string;
    category: any;
    timesScheduled: number;
    totalCost: number;
    duration?: string;
  }>();

  for (const trip of trips) {
    for (const stop of trip.stops || []) {
      for (const day of stop.days || []) {
        for (const act of day.activities || []) {
          const title = (act.title || '').trim();
          if (!title) continue;
          const key = title.toLowerCase();

          const existing = actMap.get(key) || {
            title,
            cityName: stop.cityName || 'Destination',
            category: act.category || 'sightseeing',
            timesScheduled: 0,
            totalCost: 0,
            duration: act.duration
          };

          existing.timesScheduled++;
          existing.totalCost += Number(act.cost) || 0;
          if (act.duration && !existing.duration) existing.duration = act.duration;
          actMap.set(key, existing);
        }
      }
    }
  }

  const ranked = Array.from(actMap.entries())
    .map(([key, data]) => ({
      id: `act-${key}`,
      title: data.title,
      cityName: data.cityName,
      category: data.category,
      timesScheduled: data.timesScheduled,
      averageCost: Math.round(data.totalCost / data.timesScheduled),
      duration: data.duration || '2 hrs',
      totalSpendEstimate: data.totalCost
    }))
    .sort((a, b) => b.timesScheduled - a.timesScheduled);

  res.json({ activities: ranked });
});

// Users List for Admin
router.get('/users', (_req, res) => {
  const usersRows = db.prepare('SELECT * FROM users ORDER BY datetime(created_at) DESC').all() as any[];
  const tripsRows = db.prepare('SELECT id, user_id, stops FROM trips').all() as any[];

  const userTripCounts = new Map<string, { trips: number; acts: number }>();
  for (const t of tripsRows) {
    const uid = t.user_id;
    const existing = userTripCounts.get(uid) || { trips: 0, acts: 0 };
    existing.trips++;

    const stops = JSON.parse(t.stops || '[]');
    for (const s of stops) {
      for (const d of s.days || []) {
        existing.acts += (d.activities || []).length;
      }
    }
    userTripCounts.set(uid, existing);
  }

  const userList = usersRows.map(row => {
    const user = userFromRow(row);
    const stats = userTripCounts.get(user.id) || { trips: 0, acts: 0 };
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: row.role || (row.email?.toLowerCase().includes('admin') ? 'admin' : 'traveler'),
      homeCity: user.homeCity || 'Traveler Destination',
      tripsCount: stats.trips,
      activitiesCount: stats.acts,
      createdAt: row.created_at || new Date().toISOString(),
      status: stats.trips > 0 ? 'active' : 'new'
    };
  });

  res.json({ users: userList });
});

export default router;
