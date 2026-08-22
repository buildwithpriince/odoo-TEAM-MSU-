# GlobeTrotter Backend

Standalone backend for the existing GlobeTrotter frontend. The frontend UI is intentionally not included in this package.

## Stack
- Node.js + TypeScript
- Express
- SQLite (`better-sqlite3`)
- JWT authentication
- bcrypt password hashing
- Zod validation
- Optional Google Gemini integration for existing AI features

## Setup

```bash
cd backend
npm install
cp .env.example .env
```

Set a strong `JWT_SECRET`. `DATABASE_PATH` defaults to `./data/globetrotter.sqlite`.

## Run

```bash
npm run dev
```

API: `http://localhost:5000/api`

Health check: `GET /api/health`

## Existing frontend integration

The existing frontend should point to:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

The `frontend-integration/` folder in the parent package contains the API/auth/trip integration files from the compatible frontend version. If your GitHub frontend is still using mock data, copy those three files into the corresponding locations, or implement the same API calls in your existing service/context layer. No UI components need to be changed.

## API
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/demo`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/users/me`
- `PATCH /api/users/me`
- `GET /api/trips`
- `POST /api/trips`
- `GET /api/trips/:id`
- `PATCH /api/trips/:id`
- `DELETE /api/trips/:id`
- `POST /api/trips/:id/duplicate`
- AI endpoints under `/api/ai/*` as used by the existing frontend

All trip/user data is persisted in SQLite and protected by the authenticated user.

## Demo
Email: `alex.morgan@globetrotter.io`
Password: `traveler2026`

The first database initialization seeds the demo user and demo trips.

## Validation

```bash
npm run typecheck
npm test
npm run build
```

## Production
Build with `npm run build`, set `NODE_ENV=production`, provide a strong `JWT_SECRET`, and run `npm start`.
