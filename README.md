# 🌍 GlobeTrotter

> **Personalized multi-city travel planning platform**  
> *Plan your entire multi-city journey in one place.*

GlobeTrotter brings discovery, route creation, day-by-day activity scheduling, budget tracking, calendar timelines, community discovery, and administrative intelligence into a single visual workspace.

---

## ✨ Overview

Traditional travel planning often scatters itineraries across disconnected browser tabs, spreadsheet formulas, map pins, calendar notes, and messaging chats.

**GlobeTrotter** eliminates this fragmentation by providing an end-to-end, editorial travel-planning workspace designed for modern travelers, multi-city explorers, and curated travel curators.

- **Unified Planning**: Combine destination discovery, route sequencing, daily activities, transport estimates, and budget management in one dashboard.
- **Dynamic Multi-Stop Circuits**: Seamlessly organize trips across multiple cities (e.g. *Jaipur → Jodhpur → Udaipur* or *Tokyo → Kyoto*).
- **Intelligent Cost Tracking**: Real-time budget progress, category breakdowns (Lodging, Transit, Sightseeing, Dining, Leisure), and multi-currency support (USD / INR).
- **AI-Powered Estimates**: Automated round-trip transport cost estimation and contextual trip intelligence suggestions via Google Gemini AI.
- **Community Discovery**: Share public itineraries, browse fellow travelers' routes, and copy shared journeys to your portfolio with one click.
- **Administrative Intelligence**: Role-protected analytics console with live platform KPIs, interactive trend charts, and destination metrics.

---

## 🎯 Core Experience

```text
Discover ──► Plan ──► Customize ──► Optimize ──► Visualize ──► Share
```

GlobeTrotter answers the four fundamental questions of every journey:

```text
📍 Where am I going?   ──► Multi-city routes and destination discovery
📅 When am I going?    ──► Chronological day-by-day itineraries and calendar timelines
🧭 What am I doing?    ──► Curated activities, durations, and category schedules
💰 How much will it cost? ──► Live budget breakdowns, currency conversion, and AI transit estimates
```

---

## 🚀 Features

### 🧳 Trip Planning & Route Management
- **Multi-City Route Builder**: Create journeys with sequential destination stops and custom travel vibes.
- **Flexible Scheduling**: Configure overall trip timeframe and individual arrival/departure dates for each stop.
- **Stop Reordering & Departure Points**: Define starting points and reorder destination sequences dynamically.
- **Trip Duplication & Archiving**: One-click duplication to clone journeys or start new plans from existing templates.

### 📅 Day-by-Day Itinerary Builder
- **Daily Activity Scheduling**: Assign activities to specific days with scheduled times, durations, and category badges.
- **Custom Activity Creator**: Add personal activities with custom costs, categories (Sightseeing, Dining, Transport, Lodging, Leisure), and notes.
- **Interactive Route Visualization**: Visual timeline connecting stops, travel days, and scheduled highlights.
- **Multi-Day Calendar View**: Grid calendar and chronological timeline across all active journeys.

### 💰 Budget & Expense Intelligence
- **Target vs. Actual Budget**: Track total budgeted amounts against scheduled activity costs in real time.
- **Category Expense Breakdown**: Visual cost distributions across Lodging, Dining, Transit, Sightseeing, and Leisure.
- **Multi-Currency Support**: Instant conversion and formatting between **USD ($)** and **INR (₹)**.
- **Cost Items & Payment Tracking**: Mark individual expenses as planned or paid.

### 🤖 AI Travel Intelligence (Google Gemini)
- **Transport Cost Estimator**: Generates realistic flight/train round-trip transport cost estimates between departure cities and destination stops.
- **Contextual Trip Suggestions**: AI-generated hidden local experiences, logistics advice, packing notes, and budget optimization tips.

### 🌐 Community & Public Sharing
- **Public Inspiration Feed**: Discover public journeys shared by fellow GlobeTrotter travelers.
- **Multi-Criteria Discovery**: Search journeys by city, country, activity, or traveler name; filter by duration, budget, and travel vibe.
- **1-Click Trip Copying**: Clone community itineraries directly into your personal portfolio.
- **Public Itinerary Review**: Detailed view of shared multi-city stops, daily schedules, and budgets.
- **Web Share & Clipboard Links**: Native browser sharing and instant link copying with feedback toasts.

### 👤 Traveler Profile & Preferences
- **Identity & Bio**: Profile header with avatar image, fallback initials, verified badges, and travel bio notes.
- **Global Preferences**: Update display name, home city, default currency, and avatar with live application-wide sync.
- **Journey Portfolio**: Categorized views of upcoming journeys and completed expeditions.

### 🛡️ Admin & Platform Analytics Console
- **Role-Based Access Control**: Strict client and server-side authorization protecting `/admin` routes and endpoints.
- **Live Platform Metrics**: Real-time totals for Travelers, Trips, Cities Planned, and Activities Scheduled derived from domain data.
- **Interactive SVG Charts**: Dual-series interactive line chart (Trips & Travelers over time) and Trip Status breakdown donut chart.
- **Ranked Intelligence Tables**: Destination rankings, activity popularity directories, and registered traveler registries.

---

## 🖥️ Screens & Navigation

| # | Screen / Route | Description |
|---|---|---|
| 1 | **Dashboard** (`/`) | Portfolio overview, active journeys, statistics, quick planning CTA, recent trips, dynamic destination hero, and budget highlights. |
| 2 | **Authentication** (`/login`) | Passport sign-in and registration with traveler and administrator 1-click demo accounts. |
| 3 | **My Trips** (`/trips`) | Portfolio manager with search, filter tabs (All, Upcoming, Planning, Completed), trip duplication, deletion modal, and direct builder links. |
| 4 | **Create Trip** (`/create-trip`, `/trips/new`) | Multi-step trip wizard with destination selection, dates, departure airport, travel style vibe, and target budget. |
| 5 | **Itinerary Builder** (`/builder`, `/trips/:id/builder`) | Multi-city itinerary workspace with stop reordering, daily activity scheduling, custom activity modals, AI transit estimates, and route visualization. |
| 6 | **Explore / Destinations** (`/explore`, `/search`) | Destination discovery directory with search, country filters, curated activities, and 1-click "Plan Trip" actions. |
| 7 | **Calendar Timeline** (`/calendar`) | Visual multi-day itinerary calendar and timeline across trips and stops. |
| 8 | **Trip Budget** (`/budget`, `/trips/:id/budget`) | Detailed budget breakdown, target vs estimated spend, category breakdown, paid status toggles, and currency conversion. |
| 9 | **User Profile / Settings** (`/profile`) | Traveler identity card with avatar initials fallback, editable preferences, upcoming journeys list, completed journeys history, and sign out. |
| 10 | **Community Feed** (`/community`) | Discovery feed for public shared journeys with debounced search, Group By, Filter popover, detailed View Journey modal, and Copy Trip cloning. |
| 11 | **Admin Panel** (`/admin`) | Protected admin-only platform analytics console with role-based access control, live KPI metrics, interactive SVG charts, and intelligence tables. |

---

## 🏗️ Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                 React 19 + TypeScript Frontend              │
│       Tailwind CSS (v4) · Lucide Icons · Motion · SVG       │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
        HTTP / JSON REST API           Google Gemini AI API
               │                              │
               ▼                              ▼
┌─────────────────────────────┐  ┌────────────────────────────┐
│   Node.js / Express Server  │  │ Google GenAI SDK (@genai)  │
│  auth · trips · admin · comm│  │ Transport & Trip Insights  │
└──────────────┬──────────────┘  └────────────────────────────┘
               │
               ▼
┌─────────────────────────────┐
│       SQLite Database       │
│  users · trips · stops · act│
└─────────────────────────────┘
```

- **Frontend**: Single-page application built with React 19, TypeScript, React Router 7, Tailwind CSS v4, and Lucide React.
- **Client State**: Context-driven architecture (`AuthContext`, `TripContext`, `CurrencyContext`) with persistent `localStorage` synchronization.
- **Backend**: Express API server providing JWT authentication, profile management, trip CRUD, public community feeds, and admin analytics.
- **AI Integration**: Express server orchestrates Google Gemini (`@google/genai`) to generate structured transport cost estimates and contextual travel intelligence.
- **Security Boundary**: Token-based authentication (`requireAuth`) and role-based middleware (`requireAdmin`) preventing unauthorized access to private trips and admin data.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 19 (`react`, `react-dom`) |
| **Language** | TypeScript (~5.8) |
| **Build Tool & Bundler** | Vite 6 + esbuild |
| **Styling & Design System** | Tailwind CSS v4 (`@tailwindcss/vite`), Custom Editorial Theme |
| **Routing** | React Router v7 (`react-router-dom`) |
| **Icons** | Lucide React (`lucide-react`) |
| **Animations** | Motion (`motion`) |
| **Backend Framework** | Node.js + Express (`express`, `tsx`) |
| **Database** | SQLite (`better-sqlite3`) |
| **Authentication** | JWT (`jsonwebtoken`) + Password Hashing (`bcryptjs`) |
| **Validation** | Zod (`zod`) |
| **Artificial Intelligence** | Google Gemini (`@google/genai`) |

---

## 🗄️ Database Schema & Entities

The SQLite database (`backend/src/db.ts`) is organized around the core travel domain:

```text
User (id, email, password_hash, name, role, avatar_url, home_city, currency, bio)
 │
 ├──► Trip (id, user_id, title, description, cover_image, start_date, end_date,
 │          status, total_budget, currency, travel_vibe, stops_json, budget_items_json,
 │          is_public, created_at, updated_at)
 │
 └──► Public Share / Community Records
```

### Relational Entity Roles
- **Users**: Authentication identity, display name, role (`traveler` or `admin`), default currency, and travel bio.
- **Trips**: Journey parent record containing overall dates, vibe, budget, and ownership (`user_id`).
- **City Stops**: Ordered sequential stops within a journey with arrival and departure timestamps.
- **Trip Activities**: Day-by-day scheduled activities associated with specific stops, including duration, category, and cost.
- **Cost Items**: Budget line items for lodging, transit, meals, sightseeing, and miscellaneous expenses.

---

## 🔐 Authentication & Security

- **Authentication**: JWT token-based authentication stored client-side in `localStorage` (`globetrotter_token`).
- **Password Security**: Passwords hashed securely using `bcryptjs` with salt rounds.
- **Role-Based Authorization**:
  - `traveler`: Standard access to personal trips, public discovery, community feeds, and itinerary builder.
  - `admin`: Full access to the `/admin` platform analytics dashboard and administrative endpoints.
- **Privacy Enforcement**:
  - Private itineraries are accessible only by the authenticated owner (`trip.user_id === current_user.id`).
  - Community feed queries strictly surface public/shared journeys (`is_public = 1`), never exposing private traveler drafts.
  - Non-admin sessions attempting to access `/admin` or `/api/admin/*` receive an immediate `403 Forbidden` response and an "Access Restricted" fallback view.

---

## 📡 API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/signup` — Register a new traveler account.
- `POST /api/auth/login` — Authenticate and receive a JWT token.
- `GET /api/auth/me` — Retrieve the authenticated user session.

### User Profile (`/api/users`)
- `GET /api/users/me` — Retrieve the current user's profile.
- `PATCH /api/users/me` — Update display name, home city, currency, avatar, or bio.

### Trips (`/api/trips`)
- `GET /api/trips` — List all journeys owned by the authenticated user.
- `POST /api/trips` — Create a new multi-city journey.
- `GET /api/trips/:id` — Retrieve a specific journey by ID.
- `PATCH /api/trips/:id` — Update journey metadata, stops, or budget items.
- `DELETE /api/trips/:id` — Delete a journey.
- `POST /api/trips/:id/duplicate` — Clone a journey.

### Community Feed (`/api/community`)
- `GET /api/community/trips` — Retrieve public shared journeys with search, filter, sort, and pagination.

### Admin Analytics (`/api/admin`) *(Admin Role Required)*
- `GET /api/admin/overview` — Platform KPI summary (Total Users, Trips, Cities, Activities, Statuses, Averages).
- `GET /api/admin/trends` — Time-series journey creation and user registration metrics.
- `GET /api/admin/cities` — Ranked destination stops across all platform journeys.
- `GET /api/admin/activities` — Ranked scheduled experiences and category breakdowns.
- `GET /api/admin/users` — Directory of registered travelers and journey counts.

### AI Intelligence (`/api`)
- `POST /api/estimate-transport` — Gemini-powered transport cost estimation.
- `POST /api/trip-intelligence` — Gemini-powered contextual itinerary recommendations.

---

## 📁 Project Structure

```text
odoo-TEAM-MSU-/
├── backend/                  # Express + SQLite Backend
│   ├── src/
│   │   ├── config/           # Environment & database configuration
│   │   ├── routes/           # Auth, Users, Trips, Community, Admin, AI routes
│   │   ├── auth.ts           # JWT middleware & requireAdmin guard
│   │   ├── db.ts             # SQLite schema initialization & seeding
│   │   ├── serializers.ts    # Model serialization helpers
│   │   └── server.ts         # Backend Express server
│   └── package.json
│
├── src/                      # React 19 Frontend Application
│   ├── components/           # Reusable UI components
│   │   ├── admin/            # Admin console charts, KPIs, tabs, toolbars
│   │   ├── community/        # Community feed cards, modal, toolbar, skeleton
│   │   ├── profile/          # Profile header, preferences editor, trip cards
│   │   ├── ErrorBoundary.tsx # Top-level error boundary
│   │   ├── Layout.tsx        # Shell layout with persistent footer
│   │   ├── Navbar.tsx        # Responsive navigation with role indicators
│   │   └── RouteBackground.tsx
│   │
│   ├── context/              # Global React Context providers
│   │   ├── AuthContext.tsx   # User session, login, role detection
│   │   ├── CurrencyContext.tsx # Currency conversion (USD / INR)
│   │   └── TripContext.tsx   # Trip portfolio management & localStorage sync
│   │
│   ├── data/                 # Curated destination & activity catalog
│   │   ├── mockData.ts       # Destinations, activities, and initial trips
│   │   └── calendarUtils.ts  # Timeline & calendar date calculators
│   │
│   ├── pages/                # Screen view components
│   │   ├── AdminPage.tsx     # Screen 12: Admin Panel / Analytics Dashboard
│   │   ├── CalendarView.tsx  # Screen 9: Calendar Timeline
│   │   ├── CitySearch.tsx    # Screen 4: Explore Destinations & Activities
│   │   ├── CommunityPage.tsx # Screen 10: Community Feed & Shared Journeys
│   │   ├── CreateTrip.tsx    # Screen 5: Multi-Step Trip Creation Wizard
│   │   ├── Dashboard.tsx     # Screen 1: Traveler Portfolio Dashboard
│   │   ├── ItineraryBuilder.tsx # Screen 6: Itinerary & Activity Workspace
│   │   ├── Login.tsx         # Screen 2: Passport Authentication & Demo Switcher
│   │   ├── MyTrips.tsx       # Screen 3: My Journeys Portfolio Manager
│   │   ├── Profile.tsx       # Screen 7: Traveler Profile & Settings
│   │   └── TripBudget.tsx    # Screen 8: Trip Budget & Expense Calculator
│   │
│   ├── services/             # Frontend data & aggregation services
│   │   ├── adminAnalyticsService.ts # Real-time platform KPI calculation
│   │   └── communityService.ts      # Community querying & persistent saves
│   │
│   ├── types/                # TypeScript type definitions
│   │   ├── adminAnalytics.ts
│   │   ├── community.ts
│   │   └── index.ts          # Core domain models (Trip, CityStop, User, etc.)
│   │
│   ├── App.tsx               # Route definitions & top-level providers
│   ├── index.css             # Tailwind CSS tokens & editorial card styles
│   └── main.tsx              # DOM entrypoint
│
├── server.ts                 # Full-stack dev server (Express + Vite middleware)
├── vite.config.ts            # Vite configuration with Tailwind CSS plugin
├── tsconfig.json             # TypeScript configuration
├── package.json              # Project scripts & dependencies
└── README.md
```

---

## 🚦 Getting Started

### Prerequisites
- **Node.js**: v18+ (tested on Node.js v20 and v24)
- **npm**: v9+

### 1. Installation
Clone the repository and install dependencies:

```bash
git clone https://github.com/buildwithpriince/odoo-TEAM-MSU-.git
cd odoo-TEAM-MSU-
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root directory:

```env
PORT=3000
GEMINI_API_KEY=your_google_gemini_api_key_here
```

*(Note: The application functions offline with built-in realistic mock estimators even if no Gemini API key is provided).*

### 3. Running the Development Server
Start the development server:

```bash
npm run dev
```

Open your browser and navigate to:
👉 **[http://localhost:3000](http://localhost:3000)**

### 4. Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the full-stack Express + Vite development server on port 3000. |
| `npm run build` | Builds the production bundle (`vite build` + server bundle). |
| `npm run start` | Runs the compiled production server (`dist/server.cjs`). |
| `npm run lint` | Runs TypeScript type verification (`tsc --noEmit`). |
| `npm run preview`| Previews the Vite production build locally. |

---

## 👤 Demo Accounts

The application includes 1-click demo logins on the `/login` screen:

- **Demo Traveler**: `alex.morgan@globetrotter.io` (Explore itineraries, create trips, browse community)
- **Platform Administrator**: `admin@globetrotter.io` (Access protected `/admin` analytics console)

---

## 🎨 Visual Identity System

GlobeTrotter uses a warm, editorial travel aesthetic:
- **Background Base**: Warm cream `#F5F1E8`
- **Card Background**: Crisp warm white `#FCFAF6`
- **Primary Brand Accent**: Terracotta Rust `#964223`
- **Secondary Accents**: Sage Green `#3F6E54`, Desert Amber `#D97706`, Muted Teal `#4A6B70`
- **Typography**: Display serif headings in **Fraunces**, UI and body in **Plus Jakarta Sans**

---

Made with ☕, maps, itineraries, and too many travel ideas.
