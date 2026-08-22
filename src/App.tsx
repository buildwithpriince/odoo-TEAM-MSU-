import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TripProvider } from './context/TripContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';

import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { MyTrips } from './pages/MyTrips';
import { CreateTrip } from './pages/CreateTrip';
import { ItineraryBuilder } from './pages/ItineraryBuilder';
import { CitySearch } from './pages/CitySearch';
import { TripBudget } from './pages/TripBudget';
import { Profile } from './pages/Profile';

export default function App() {
  return (
    <AuthProvider>
      <TripProvider>
        <BrowserRouter>
          <Routes>
            {/* Standalone Authentication Route */}
            <Route path="/login" element={<Login />} />

            {/* Application Shared Layout Routes — requires auth */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />

                {/* My Trips */}
                <Route path="/trips" element={<MyTrips />} />

                {/* Create Trip */}
                <Route path="/trips/new" element={<CreateTrip />} />
                <Route path="/create-trip" element={<CreateTrip />} />

                {/* Itinerary Builder */}
                <Route path="/builder" element={<ItineraryBuilder />} />
                <Route path="/trips/:id/builder" element={<ItineraryBuilder />} />

                {/* City Search / Explore */}
                <Route path="/explore" element={<CitySearch />} />
                <Route path="/search" element={<CitySearch />} />

                {/* Trip Budget */}
                <Route path="/budget" element={<TripBudget />} />
                <Route path="/trips/:id/budget" element={<TripBudget />} />

                {/* Profile */}
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Route>

            {/* Fallback Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </TripProvider>
    </AuthProvider>
  );
}
