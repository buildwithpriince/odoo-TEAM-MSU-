
import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db.js';
import { requireAuth } from '../auth.js';
import { userFromRow } from '../serializers.js';

const router = Router();
const profileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  homeCity: z.string().trim().max(120).optional(),
  currency: z.enum(['USD','INR']).optional(),
  bio: z.string().max(1000).optional(),
  avatarUrl: z.string().url().max(1000).optional(),
  savedDestinations: z.array(z.string().max(100)).max(50).optional(),
});

router.get('/me', requireAuth, (req: any, res) => {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id) as any;
  if (!row) return res.status(404).json({ error: 'User not found' });
  res.json({ user: userFromRow(row) });
});

router.patch('/me', requireAuth, (req: any, res) => {
  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid profile data' });

  const data = parsed.data;
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id) as any;
  if (!row) return res.status(404).json({ error: 'User not found' });

  const next = {
    name: data.name ?? row.name,
    home_city: data.homeCity ?? row.home_city,
    currency: data.currency ?? row.currency,
    bio: data.bio ?? row.bio,
    avatar_url: data.avatarUrl ?? row.avatar_url,
    saved_destinations: JSON.stringify(data.savedDestinations ?? JSON.parse(row.saved_destinations || '[]')),
    updated_at: new Date().toISOString(),
  };
  db.prepare(`
    UPDATE users SET name=@name,home_city=@home_city,currency=@currency,bio=@bio,avatar_url=@avatar_url,
    saved_destinations=@saved_destinations,updated_at=@updated_at WHERE id=@id
  `).run({ ...next, id: req.user.id });

  const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id) as any;
  res.json({ user: userFromRow(updated) });
});

export default router;
