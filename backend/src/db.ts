
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import { env } from './config/env.js';
import { INITIAL_TRIPS } from './data/mockData.js';

const dbPath = path.resolve(process.cwd(), env.databasePath);
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  home_city TEXT,
  currency TEXT NOT NULL DEFAULT 'USD',
  bio TEXT,
  saved_destinations TEXT NOT NULL DEFAULT '[]',
  role TEXT NOT NULL DEFAULT 'traveler',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS trips (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  cover_image TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  status TEXT NOT NULL,
  total_budget REAL NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  travel_vibe TEXT,
  boarding_from TEXT,
  ai_transport_estimates TEXT NOT NULL DEFAULT '[]',
  destination_theme TEXT,
  stops TEXT NOT NULL DEFAULT '[]',
  budget_items TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_trips_user_created ON trips(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
`);

// Auto-migrate role column if table was created earlier without it
try {
  db.exec("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'traveler'");
} catch {
  // Column already exists
}

const now = new Date().toISOString();
const demoEmail = 'alex.morgan@globetrotter.io';
const demo = db.prepare('SELECT id FROM users WHERE email = ?').get(demoEmail) as { id: string } | undefined;

if (!demo) {
  const userId = 'usr-demo';
  const passwordHash = bcrypt.hashSync('traveler2026', 12);
  db.prepare(`
    INSERT INTO users (id,email,password_hash,name,avatar_url,home_city,currency,bio,saved_destinations,role,created_at,updated_at)
    VALUES (@id,@email,@password_hash,@name,@avatar_url,@home_city,@currency,@bio,@saved_destinations,@role,@created_at,@updated_at)
  `).run({
    id: userId,
    email: demoEmail,
    password_hash: passwordHash,
    name: 'Alex Morgan',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    home_city: 'San Francisco, CA',
    currency: 'USD',
    bio: 'Passionate wanderer, coffee enthusiast, seeking authentic food stalls and hidden mountain trails.',
    saved_destinations: JSON.stringify(['Kyoto', 'Amalfi Coast', 'Cape Town']),
    role: 'traveler',
    created_at: now,
    updated_at: now,
  });

  const insertTrip = db.prepare(`
    INSERT INTO trips (
      id,user_id,title,description,cover_image,start_date,end_date,status,total_budget,currency,travel_vibe,
      boarding_from,ai_transport_estimates,destination_theme,stops,budget_items,created_at,updated_at
    ) VALUES (
      @id,@user_id,@title,@description,@cover_image,@start_date,@end_date,@status,@total_budget,@currency,@travel_vibe,
      @boarding_from,@ai_transport_estimates,@destination_theme,@stops,@budget_items,@created_at,@updated_at
    )
  `);

  const tx = db.transaction(() => {
    for (const trip of INITIAL_TRIPS) {
      insertTrip.run({
        id: trip.id,
        user_id: userId,
        title: trip.title,
        description: trip.description,
        cover_image: trip.coverImage,
        start_date: trip.startDate,
        end_date: trip.endDate,
        status: trip.status,
        total_budget: trip.totalBudget,
        currency: trip.currency,
        travel_vibe: trip.travelVibe || null,
        boarding_from: trip.boardingFrom || null,
        ai_transport_estimates: JSON.stringify(trip.aiTransportEstimates || []),
        destination_theme: JSON.stringify(trip.destinationTheme || null),
        stops: JSON.stringify(trip.stops || []),
        budget_items: JSON.stringify(trip.budgetItems || []),
        created_at: trip.createdAt || now,
        updated_at: now,
      });
    }
  });
  tx();
}

// Seed admin user if missing
const adminEmail = 'admin@globetrotter.io';
const adminUser = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail) as { id: string } | undefined;
if (!adminUser) {
  const adminId = 'usr-admin-01';
  const adminHash = bcrypt.hashSync('admin2026', 12);
  db.prepare(`
    INSERT INTO users (id,email,password_hash,name,avatar_url,home_city,currency,bio,saved_destinations,role,created_at,updated_at)
    VALUES (@id,@email,@password_hash,@name,@avatar_url,@home_city,@currency,@bio,@saved_destinations,@role,@created_at,@updated_at)
  `).run({
    id: adminId,
    email: adminEmail,
    password_hash: adminHash,
    name: 'Platform Administrator',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    home_city: 'Global Operations',
    currency: 'USD',
    bio: 'GlobeTrotter platform administrator managing destinations, itineraries, and travel intelligence.',
    saved_destinations: JSON.stringify(['Jaipur', 'Tokyo', 'Paris']),
    role: 'admin',
    created_at: now,
    updated_at: now,
  });
}
