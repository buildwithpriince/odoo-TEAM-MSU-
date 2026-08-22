import { randomUUID } from 'node:crypto';

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '../db.js';
import { requireAuth, signToken } from '../auth.js';
import { userFromRow } from '../serializers.js';

const router = Router();

const credentials = z.object({
  email: z.string().email().max(255),
  password: z.string().min(6).max(128),
});
const signupSchema = credentials.extend({ name: z.string().trim().min(2).max(100) });

router.post('/signup', (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid signup details' });

  const { email, password, name } = parsed.data;
  const normalizedEmail = email.toLowerCase();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
  if (existing) return res.status(409).json({ error: 'An account with that email already exists' });

  const id = `usr-${randomUUID()}`;
  const now = new Date().toISOString();
  const passwordHash = bcrypt.hashSync(password, 12);

  db.prepare(`
    INSERT INTO users (id,email,password_hash,name,avatar_url,home_city,currency,bio,saved_destinations,created_at,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)
  `).run(
    id, normalizedEmail, passwordHash, name,
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    'New York, NY', 'USD', 'Ready for my next adventure!', '[]', now, now
  );

  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
  const user = userFromRow(row);
  return res.status(201).json({ token: signToken({ id, email: user.email, name: user.name }), user });
});

router.post('/login', (req, res) => {
  const parsed = credentials.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid email or password' });

  const { email, password } = parsed.data;
  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase()) as any;
  if (!row || !bcrypt.compareSync(password, row.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const user = userFromRow(row);
  return res.json({ token: signToken({ id: user.id, email: user.email, name: user.name }), user });
});

router.post('/demo', (_req, res) => {
  const row = db.prepare('SELECT * FROM users WHERE email = ?').get('alex.morgan@globetrotter.io') as any;
  const user = userFromRow(row);
  return res.json({ token: signToken({ id: user.id, email: user.email, name: user.name }), user });
});

router.get('/me', requireAuth, (req: any, res) => {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id) as any;
  if (!row) return res.status(404).json({ error: 'User not found' });
  return res.json({ user: userFromRow(row) });
});

router.post('/logout', requireAuth, (_req, res) => res.status(204).send());

export default router;
