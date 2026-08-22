import { Router } from 'express';
import { db } from '../db.js';
import { tripFromRow, userFromRow } from '../serializers.js';

const router = Router();

// Public Shared Community Trips
router.get('/trips', (req, res) => {
  const search = ((req.query.search as string) || '').toLowerCase().trim();
  const sort = (req.query.sort as string) || 'recent';
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));

  // Query trips joined with user info
  const rows = db.prepare(`
    SELECT trips.*, users.name as author_name, users.avatar_url as author_avatar, users.home_city as author_city
    FROM trips
    JOIN users ON trips.user_id = users.id
    ORDER BY datetime(trips.created_at) DESC
  `).all() as any[];

  let publicTrips = rows.map(row => {
    const trip = tripFromRow(row);
    let duration = 1;
    if (trip.startDate && trip.endDate) {
      const diff = new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime();
      duration = Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
    }

    return {
      id: trip.id,
      shareCode: `gt-${trip.id.slice(-4)}`,
      title: trip.title,
      description: trip.description,
      coverImage: trip.coverImage,
      startDate: trip.startDate,
      endDate: trip.endDate,
      durationDays: duration,
      stopsCount: trip.stops?.length || 0,
      totalBudget: trip.totalBudget,
      currency: trip.currency,
      travelVibe: trip.travelVibe || 'Discovery & Adventure',
      stops: trip.stops || [],
      traveler: {
        id: row.user_id,
        name: row.author_name || 'GlobeTrotter Traveler',
        avatarUrl: row.author_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        homeCity: row.author_city || 'San Francisco, CA'
      },
      createdAt: trip.createdAt || new Date().toISOString(),
      likesCount: 12,
      savesCount: 8
    };
  });

  if (search) {
    publicTrips = publicTrips.filter(t => 
      t.title.toLowerCase().includes(search) ||
      t.description.toLowerCase().includes(search) ||
      t.stops.some(s => s.cityName?.toLowerCase().includes(search) || s.country?.toLowerCase().includes(search))
    );
  }

  const total = publicTrips.length;
  const paginated = publicTrips.slice((page - 1) * limit, page * limit);

  res.json({
    items: paginated,
    total,
    page,
    limit,
    hasMore: page * limit < total
  });
});

export default router;
