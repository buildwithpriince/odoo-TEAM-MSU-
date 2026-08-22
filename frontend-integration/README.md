# Frontend integration

Your GitHub repository remains the source of truth for the UI.

These files are the minimal integration layer from the backend-compatible version:
- `src/lib/api.ts` — API base URL + JWT headers + error handling
- `src/context/AuthContext.tsx` — signup/login/logout/profile API integration
- `src/context/TripContext.tsx` — persistent trip CRUD/itinerary/budget API integration

Copy them into the same paths in the existing frontend repo if those files currently use mock/local-only data.

Add to the frontend `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

No visual/component redesign is required.
