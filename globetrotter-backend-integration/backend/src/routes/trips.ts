import { randomUUID } from 'node:crypto';

import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db.js';
import { requireAuth } from '../auth.js';
import { tripFromRow } from '../serializers.js';

const router = Router();
router.use(requireAuth);

const idSchema = z.string().min(1).max(100);
const tripSchema = z.object({
  id: z.string().min(1).max(100).optional(),
  createdAt: z.string().optional(),
  title: z.string().trim().min(1).max(200),
  description: z.string().max(3000),
  coverImage: z.string().url().max(2000),
  startDate: z.string(),
  endDate: z.string(),
  status: z.enum(['planning','upcoming','completed']),
  totalBudget: z.number().nonnegative().max(1_000_000),
  currency: z.enum(['USD','INR']),
  travelVibe: z.string().max(200).optional(),
  boardingFrom: z.string().max(200).optional(),
  aiTransportEstimates: z.array(z.any()).optional(),
  destinationTheme: z.any().optional(),
  stops: z.array(z.any()),
  budgetItems: z.array(z.any()).optional(),
});

function getTrip(id: string, userId: string) {
  return db.prepare('SELECT * FROM trips WHERE id = ? AND user_id = ?').get(id, userId) as any;
}

router.get('/', (req: any, res) => {
  const rows = db.prepare('SELECT * FROM trips WHERE user_id = ? ORDER BY datetime(created_at) DESC').all(req.user.id) as any[];
  res.json({ trips: rows.map(tripFromRow) });
});

router.get('/:id', (req: any, res) => {
  const id = idSchema.safeParse(req.params.id);
  if (!id.success) return res.status(400).json({ error: 'Invalid trip id' });
  const row = getTrip(id.data, req.user.id);
  if (!row) return res.status(404).json({ error: 'Trip not found' });
  res.json({ trip: tripFromRow(row) });
});

router.post('/', (req: any, res) => {
  const parsed = tripSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid trip data', details: parsed.error.flatten() });
  const t = parsed.data;
  if (new Date(t.endDate) < new Date(t.startDate)) return res.status(400).json({ error: 'End date cannot be earlier than start date' });
  if (t.stops.length < 1) return res.status(400).json({ error: 'A trip requires at least one stop' });

  const id = t.id || `trip-${randomUUID()}`;
  const now = t.createdAt || new Date().toISOString();
  db.prepare(`
    INSERT INTO trips (
      id,user_id,title,description,cover_image,start_date,end_date,status,total_budget,currency,travel_vibe,
      boarding_from,ai_transport_estimates,destination_theme,stops,budget_items,created_at,updated_at
    ) VALUES (@id,@user_id,@title,@description,@cover_image,@start_date,@end_date,@status,@total_budget,@currency,@travel_vibe,
      @boarding_from,@ai_transport_estimates,@destination_theme,@stops,@budget_items,@created_at,@updated_at)
  `).run({
    id, user_id: req.user.id, title: t.title, description: t.description, cover_image: t.coverImage,
    start_date: t.startDate, end_date: t.endDate, status: t.status, total_budget: t.totalBudget, currency: t.currency,
    travel_vibe: t.travelVibe || null, boarding_from: t.boardingFrom || null,
    ai_transport_estimates: JSON.stringify(t.aiTransportEstimates || []),
    destination_theme: JSON.stringify(t.destinationTheme ?? null),
    stops: JSON.stringify(t.stops),
    budget_items: JSON.stringify(t.budgetItems || []),
    created_at: now, updated_at: now,
  });

  const row = getTrip(id, req.user.id);
  res.status(201).json({ trip: tripFromRow(row) });
});

router.patch('/:id', (req: any, res) => {
  const id = idSchema.safeParse(req.params.id);
  if (!id.success) return res.status(400).json({ error: 'Invalid trip id' });
  const existing = getTrip(id.data, req.user.id);
  if (!existing) return res.status(404).json({ error: 'Trip not found' });

  const merged = {
    ...tripFromRow(existing),
    ...req.body,
    id: existing.id,
    createdAt: existing.created_at,
  };
  const parsed = tripSchema.safeParse(merged);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid trip update', details: parsed.error.flatten() });
  if (new Date(parsed.data.endDate) < new Date(parsed.data.startDate)) return res.status(400).json({ error: 'End date cannot be earlier than start date' });

  const t = parsed.data;
  db.prepare(`
    UPDATE trips SET title=@title,description=@description,cover_image=@cover_image,start_date=@start_date,end_date=@end_date,
      status=@status,total_budget=@total_budget,currency=@currency,travel_vibe=@travel_vibe,boarding_from=@boarding_from,
      ai_transport_estimates=@ai_transport_estimates,destination_theme=@destination_theme,stops=@stops,budget_items=@budget_items,
      updated_at=@updated_at WHERE id=@id AND user_id=@user_id
  `).run({
    id: existing.id, user_id: req.user.id, title: t.title, description: t.description, cover_image: t.coverImage,
    start_date: t.startDate, end_date: t.endDate, status: t.status, total_budget: t.totalBudget, currency: t.currency,
    travel_vibe: t.travelVibe || null, boarding_from: t.boardingFrom || null,
    ai_transport_estimates: JSON.stringify(t.aiTransportEstimates || []),
    destination_theme: JSON.stringify(t.destinationTheme ?? null),
    stops: JSON.stringify(t.stops), budget_items: JSON.stringify(t.budgetItems || []),
    updated_at: new Date().toISOString(),
  });
  res.json({ trip: tripFromRow(getTrip(existing.id, req.user.id)) });
});

router.delete('/:id', (req: any, res) => {
  const result = db.prepare('DELETE FROM trips WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Trip not found' });
  res.status(204).send();
});

router.post('/:id/duplicate', (req: any, res) => {
  const source = getTrip(req.params.id, req.user.id);
  if (!source) return res.status(404).json({ error: 'Trip not found' });
  const trip = tripFromRow(source);
  const id = `trip-${randomUUID()}`;
  const now = new Date().toISOString();
  const clonedStops = (trip.stops || []).map((stop: any) => ({ ...stop, id: `stop-${randomUUID()}` }));
  db.prepare(`
    INSERT INTO trips (id,user_id,title,description,cover_image,start_date,end_date,status,total_budget,currency,travel_vibe,
      boarding_from,ai_transport_estimates,destination_theme,stops,budget_items,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(
    id, req.user.id, `${trip.title} (Copy)`, trip.description, trip.coverImage, trip.startDate, trip.endDate, 'planning',
    trip.totalBudget, trip.currency, trip.travelVibe || null, trip.boardingFrom || null,
    JSON.stringify(trip.aiTransportEstimates || []), JSON.stringify(trip.destinationTheme ?? null),
    JSON.stringify(clonedStops), JSON.stringify(trip.budgetItems || []), now, now
  );
  res.status(201).json({ trip: tripFromRow(getTrip(id, req.user.id)) });
});

export default router;
