import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TripProvider } from './context/TripContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { Layout } from './components/Layout';

import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { MyTrips } from './pages/MyTrips';
import { CreateTrip } from './pages/CreateTrip';
import { ItineraryBuilder } from './pages/ItineraryBuilder';
import { CitySearch } from './pages/CitySearch';
import { TripBudget } from './pages/TripBudget';
import { Profile } from './pages/Profile';
import { CalendarView } from './pages/CalendarView';
import { AdminPage } from './pages/AdminPage';
import { CommunityPage } from './pages/CommunityPage';

export default function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <TripProvider>
          <BrowserRouter>
            <Routes>
              {/* Standalone Authentication Route */}
              <Route path="/login" element={<Login />} />

              {/* Application Shared Layout Routes */}
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                
                {/* My Trips */}
                <Route path="/trips" element={<MyTrips />} />
                
                {/* Calendar View */}
                <Route path="/calendar" element={<CalendarView />} />
                
                {/* Create Trip */}
                <Route path="/trips/new" element={<CreateTrip />} />
                <Route path="/create-trip" element={<CreateTrip />} />
                
                {/* Itinerary Builder */}
                <Route path="/builder" element={<ItineraryBuilder />} />
                <Route path="/trips/:id/builder" element={<ItineraryBuilder />} />
                
                {/* City Search / Explore */}
                <Route path="/explore" element={<CitySearch />} />
                <Route path="/search" element={<CitySearch />} />

                {/* Community Feed / Shared Journeys */}
                <Route path="/community" element={<CommunityPage />} />
                
                {/* Trip Budget */}
                <Route path="/budget" element={<TripBudget />} />
                <Route path="/trips/:id/budget" element={<TripBudget />} />
                
                {/* Profile */}
                <Route path="/profile" element={<Profile />} />

                {/* Admin Panel / Analytics Dashboard */}
                <Route path="/admin" element={<AdminPage />} />
              </Route>

              {/* Fallback Redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </TripProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
}
