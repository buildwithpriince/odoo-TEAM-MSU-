# 🌍 GlobeTrotter

> **Personalized multi-city travel planning platform**  
> Plan your journey, organize destinations and activities, track your budget, and share your itinerary — all in one workspace.

GlobeTrotter is being developed for the **Odoo Hackathon** as an end-to-end travel planning experience built around a simple flow:

**Discover → Plan → Customize → Optimize → Visualize → Share**

---

## ✨ Overview

Traditional trip planning often spreads information across search tabs, notes, spreadsheets, messaging apps, and separate budget calculations.

GlobeTrotter brings the core planning workflow into a single visual workspace where travelers can:

- Create customized multi-city trips
- Assign travel dates
- Add and reorder destinations
- Discover destinations and activities
- Schedule activities day by day
- Track estimated trip costs
- View budget breakdowns
- Review a chronological itinerary
- Share completed itineraries publicly
- Optionally reuse/copy shared trips

The main goal is not to build a collection of disconnected screens. The application is designed around **one coherent trip-planning journey**.

---

## 🎯 Product Vision

> **Plan your entire journey in minutes, not hours.**

The application should make four questions immediately clear:

```text
Where am I going?
When am I going?
What am I doing?
How much will it cost?
```

---

## 🚀 Core User Journey

```text
Authentication
      ↓
Dashboard
      ↓
Create Trip
      ↓
Add Destinations
      ↓
Configure Dates
      ↓
Add Activities
      ↓
Day-by-Day Itinerary
      ↓
Budget Analysis
      ↓
Share Trip
```

Optional:

```text
Public Trip
      ↓
Copy Trip
```

---

## 🧩 Core Features

### P0 — Core

- Authentication and session handling
- Dashboard with user trips
- Trip creation
- Multi-city route planning
- Destination/stop ordering
- Stop dates
- Activity selection
- Activity scheduling
- Day-wise itinerary
- Budget calculation
- Budget summary
- Responsive UI

### P1 — Extended

- City search and filtering
- Activity search and filtering
- Public shareable itineraries
- Predictable loading, empty, and error states

### P2 — Optional

Exactly one should be selected after P0/P1 are stable:

- AI Day Planner
- Copy Trip
- Budget Alerts

The project follows a strict hackathon principle:

> **A working core journey is more valuable than a large set of unfinished features.**

---

## 🏗️ Architecture

The target hackathon architecture is based on Odoo:

```text
┌─────────────────────────────┐
│ React / TypeScript Frontend │
└──────────────┬──────────────┘
               │
        HTTP / JSON / JSON-RPC
               │
               ▼
┌─────────────────────────────┐
│     Odoo Controllers        │
├─────────────────────────────┤
│      Business Logic         │
├─────────────────────────────┤
│        Odoo ORM             │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│         PostgreSQL           │
└─────────────────────────────┘
```

The frontend should never communicate directly with PostgreSQL.

The frontend/backend boundary should remain stable so mock data can be replaced with the real backend without rewriting UI components.

---

## 🛠️ Technology Stack

### Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- Recharts
- Framer Motion

### Backend

- Odoo ORM
- Odoo Controllers / JSON-RPC
- PostgreSQL
- Odoo authentication/session system
- Odoo access rights and record rules

### Deployment

- Frontend: Vercel or equivalent frontend deployment
- Backend: Odoo deployment environment

> The exact deployment configuration depends on the team's final hackathon infrastructure.

---

## 🗂️ Backend Domain Model

The backend is organized around a small relational domain:

```text
User
 │
 ▼
Trip
 │
 ├──────────────► Trip Stops ──────────► City
 │                    │
 │                    ▼
 │              Trip Activities ───────► Activity
 │
 ├──────────────► Cost Items
 │
 └──────────────► Trip Share
```

### Main entities

| Entity | Purpose |
|---|---|
| User | Authentication and ownership |
| Trip | Main journey definition |
| Trip Stop | City inside a particular trip |
| City | Reusable destination master data |
| Activity | Reusable activity master data |
| Trip Activity | Scheduled activity instance inside a trip |
| Trip Cost Item | Optional non-activity cost |
| Trip Share | Public sharing information |

### Important separation

Master data and trip-specific data remain separate.

For example:

```text
City
  └── Jaipur

Trip A
  └── Jaipur

Trip B
  └── Jaipur
```

The same city can therefore participate in many different trips.

---

## 💰 Budget Architecture

The backend is the source of truth for budget calculations.

The base calculation is:

```text
Trip Activity
      ↓
Activity Cost
      ↓
Activity Total
```

Optional additional costs can be represented through trip cost items:

```text
Activities
Transport
Stay
Meals
Other
```

The trip budget can expose:

```text
Target Budget
Total Estimated Cost
Remaining Budget
Average Cost / Day
Over Budget
```

Core formulas:

```text
activity_cost
    = SUM(trip_activity.activity.cost)

cost_item_total
    = SUM(trip.cost.item.amount)

total_estimated_cost
    = activity_cost + cost_item_total

remaining_budget
    = target_budget - total_estimated_cost

is_over_budget
    = total_estimated_cost > target_budget
```

If the implementation is time-constrained, the activity total can serve as the initial P0 budget source.

---

## 🗺️ Itinerary Model

An itinerary is derived from the trip's stops and scheduled activities.

Example:

```text
Trip
│
├── Day 1
│   ├── Check-in
│   ├── Amber Fort
│   └── Dinner
│
├── Day 2
│   ├── Hawa Mahal
│   └── City Palace
│
└── Day 3
    └── Transfer to Jodhpur
```

A separate timeline database model is unnecessary. The chronological itinerary can be derived from:

- Trip stops
- Activity dates
- Activity times
- Activity sequence/order

---

## 🔐 Security

The backend must enforce user ownership.

Core rule:

```text
trip.user_id == current_user.id
```

A normal user must only be able to modify their own:

- Trips
- Stops
- Trip activities
- Cost items
- Shares

Public trips are exposed only through an active share/public identifier rather than unrestricted access to private trip records.

The Odoo backend uses:

- Authentication/session handling
- Access rights
- Record rules
- Ownership validation
- Server-side validation

---

## 📡 API Responsibilities

The backend API is responsible for:

### Trips

```text
POST   /api/trips
GET    /api/trips
GET    /api/trips/{trip_id}
PUT    /api/trips/{trip_id}
DELETE /api/trips/{trip_id}
```

### Stops

```text
POST   /api/trips/{trip_id}/stops
PATCH  /api/trips/{trip_id}/stops/reorder
DELETE /api/trips/{trip_id}/stops/{stop_id}
```

### Activities

```text
POST   /api/trips/{trip_id}/activities
PUT    /api/trips/{trip_id}/activities/{trip_activity_id}
DELETE /api/trips/{trip_id}/activities/{trip_activity_id}
```

### Budget

```text
GET /api/trips/{trip_id}/budget
```

### Timeline

```text
GET /api/trips/{trip_id}/timeline
```

### Sharing

```text
Public share creation
Public shared-trip retrieval
```

The frontend should consume predictable JSON responses and should not implement business rules that belong to the backend.

---

## 🔎 Search

### City Search

The backend should support:

- City name
- Country
- Region
- Popularity
- Cost index

### Activity Search

Activities can be filtered by:

- City
- Category
- Cost
- Duration
- Active status

A key consistency rule is:

> Activities should be filtered by city on the backend so the frontend does not have to enforce city/activity consistency itself.

---

## 🖥️ Main Screens

### 1. Authentication

Purpose:

- Login
- Session handling
- Entry into the application

### 2. Dashboard

Shows:

- Active trips
- Upcoming journeys
- Trip summaries
- Budget progress
- Quick trip creation

### 3. Create Trip

Core fields:

- Journey name
- Description
- Start date
- End date
- Departure city
- Travel style
- Target budget

### 4. Itinerary Builder

The heart of the product.

Users can:

- Add cities
- Reorder stops
- Configure stop dates
- Add activities
- Schedule activities
- View daily planning

### 5. Itinerary View

Displays the journey chronologically:

```text
Day → Time → Activity → Duration → Cost
```

### 6. Budget Summary

Shows:

- Total estimated cost
- Target budget
- Remaining budget
- Over-budget state
- Category breakdown
- Budget progress

### 7. Public / Shared Trip

Allows a completed itinerary to be shared through a public identifier.

---

## 🎨 Design Direction

The visual direction is intentionally editorial and travel-focused:

- Warm neutral backgrounds
- Terracotta/rust primary accents
- Deep charcoal typography
- Serif display headings
- Clean sans-serif interface text
- Large destination imagery
- Rounded cards
- Clear hierarchy
- Subtle motion
- Strong primary CTAs

The interface should feel like a **premium travel planning workspace**, rather than a generic dashboard.

---

## 📱 Responsive Design

The application should support:

### Desktop

- Full navigation
- Multi-column layouts
- Rich itinerary workspace
- Side panels for budget/intelligence

### Tablet

- Reduced multi-column layouts
- Responsive cards
- Condensed navigation

### Mobile

- Stacked content
- Touch-friendly controls
- Simplified navigation
- Full-width primary actions

---

## 🧪 Demo Data

The project includes destination/activity data for the travel discovery experience, including destinations such as:

- Jaipur
- Jodhpur
- Udaipur
- Shimla
- Manali
- Goa
- Delhi
- Mumbai
- Varanasi
- Rishikesh
- Agra
- Kochi
- Tokyo
- Kyoto
- Osaka
- Singapore
- Dubai
- Paris
- Bali
- Gokarna

Example activities include:

```text
Jaipur
├── Amber Fort Morning Exploration
├── City Palace Museum
└── Hawa Mahal Photo Walk

Jodhpur
├── Mehrangarh Fort Exploration
├── Blue City Heritage Walk
├── Jaswant Thada
├── Rajasthani Cooking Experience
└── Clock Tower Market Walk
```

---

## 🧭 Recommended Demo Trips

The UI is designed around multi-city examples such as:

### Royal Rajasthan

```text
Jaipur → Jodhpur → Udaipur
```

### Himalayan Ridge

```text
Shimla → Manali
```

### Autumn in Japan

```text
Tokyo → Kyoto
```

These demonstrate the core multi-city planning model.

---

## 🎬 Ideal Demo Flow

A judge should be able to understand the product through this sequence:

```text
1. Open Dashboard
       ↓
2. Create Trip
       ↓
3. Add 3 Cities
       ↓
4. Configure Dates
       ↓
5. Add Activities
       ↓
6. View Day-by-Day Itinerary
       ↓
7. Open Budget
       ↓
8. Add / Remove an Activity
       ↓
9. Show Budget Updating
       ↓
10. Share Trip
```

Target demo duration:

**~2–3 minutes**

---

## ⏱️ 8-Hour Hackathon Strategy

### Hour 0–1

Foundation:

- Repository setup
- Odoo module setup
- Frontend setup
- API contracts
- Initial ORM models
- Authentication/session path
- Mock API responses

### Hour 1–3

Core trip flow:

- Dashboard
- Create trip
- Trip model
- City search
- Stop creation
- Stop ordering

### Hour 3–4.5

Itinerary + budget:

- Activity selection
- Activity scheduling
- Timeline
- Budget calculation
- Budget UI

### Hour 4.5–5

P0 checkpoint:

- Integration
- Deployment
- Happy-path testing
- Fix blockers

### Hour 5–6.5

P1:

- Search filters
- Public sharing
- Loading/error/empty states

### Hour 6.5–7.5

Choose exactly one P2 feature:

- AI Day Planner
- Copy Trip
- Budget Alerts

### Hour 7.5–8

Freeze:

- Bug fixing
- Responsive checks
- Demo rehearsal
- Deployment verification

---

## 👥 Suggested Team Responsibilities

### Developer A — Core App

- Authentication
- Dashboard
- Trip creation
- Navigation
- Integration

### Developer B — Trip Builder

- City search
- Stops
- Stop ordering
- Activity selection
- Itinerary

### Developer C — Budget / Visualization

- Budget calculations
- Budget UI
- Charts
- Timeline
- Cost breakdown

### Developer D — Integration / Polish

- Odoo integration
- API contracts
- Responsive design
- Error/loading states
- Deployment
- Demo preparation

---

## 📁 Recommended Odoo Module Structure

```text
globetrotter/
│
├── __init__.py
├── __manifest__.py
│
├── models/
│   ├── __init__.py
│   ├── trip.py
│   ├── trip_stop.py
│   ├── city.py
│   ├── activity.py
│   ├── trip_activity.py
│   ├── trip_cost_item.py
│   └── trip_share.py
│
├── controllers/
│   ├── __init__.py
│   ├── auth_controller.py
│   ├── trip_controller.py
│   ├── discovery_controller.py
│   ├── budget_controller.py
│   └── share_controller.py
│
├── services/
│   ├── __init__.py
│   ├── trip_service.py
│   ├── budget_service.py
│   └── share_service.py
│
└── views/
    ├── trip_views.xml
    ├── city_views.xml
    ├── activity_views.xml
    └── share_views.xml
```

---

## 🧱 Data Integrity Rules

The backend should validate:

### Trip ownership

```text
trip.user_id == current_user.id
```

### Trip dates

```text
start_date <= end_date
```

### Stop dates

```text
trip.start_date <= stop.start_date
stop.end_date <= trip.end_date
```

### Stop order

Each stop has a deterministic sequence/order.

### Activity city consistency

```text
trip_activity.activity.city_id
        ==
trip_activity.stop.city_id
```

### Activity date

The scheduled activity date must fall within its stop/trip date range.

### Activity cost

```text
activity.cost >= 0
```

### Budget

```text
target_budget >= 0
```

---

## 📌 Project Status

### Completed / In Progress

- [x] Core product specification
- [x] Frontend UX specification
- [x] Backend architecture specification
- [x] PostgreSQL/Supabase development database
- [x] City master data
- [x] Activity master data
- [x] Row Level Security on current development tables
- [ ] Demo authentication user
- [ ] Demo trip records
- [ ] Trip stop records
- [ ] Scheduled itinerary records
- [ ] Final frontend/backend integration
- [ ] Public sharing
- [ ] Deployment
- [ ] Final demo rehearsal

> **Note:** The final hackathon architecture is specified around Odoo ORM/controllers/PostgreSQL. The current development database work includes PostgreSQL/Supabase-style tables and RLS used while building/testing the data layer.

---

## 🔒 Development Notes

Never commit secrets to the repository.

Do not commit:

```text
.env
.env.local
API keys
database passwords
private credentials
service-role keys
```

Use environment variables for project-specific secrets.

---

## 📜 Scope Principle

GlobeTrotter is intentionally focused.

### Build deeply

- Trip creation
- Multi-city planning
- Activities
- Itinerary
- Budget
- Sharing

### Build simply

- Search
- Filters
- Profile
- Responsive states

### Build only if time remains

- One P2 feature

### Do not build

- Large external travel booking systems
- Complex payment infrastructure
- Full social networking
- Overly complex recommendation engines
- Features that do not strengthen the core demo

---

## 🏆 Definition of Done

The project is considered demo-ready when a user can:

- [x] Authenticate
- [ ] Create a trip
- [ ] Add multiple cities
- [ ] Reorder cities
- [ ] Assign dates
- [ ] Add activities
- [ ] Schedule activities
- [ ] View a day-wise itinerary
- [ ] See the budget
- [ ] Modify the itinerary and see budget changes
- [ ] Share the itinerary
- [ ] Use the application responsively

---

## 💡 Product Principle

> **GlobeTrotter is not just a destination browser. It is a workspace for turning a travel idea into a complete, budget-aware, shareable journey.**

---

## 📄 Project Documentation

The repository should keep the following documentation alongside the implementation:

- Frontend PRD
- Backend Engineering Specification
- API contracts
- Database/schema documentation
- Setup instructions
- Demo instructions

---

## 👨‍💻 Hackathon

**Odoo Hackathon**

**Product:** GlobeTrotter  
**Category:** Personalized Travel Planning Platform  
**Build Window:** 8 Hours

---

Made with ☕, maps, itineraries, and too many travel ideas.
