import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTrip } from '../context/TripContext';
import { useCurrency, Currency } from '../context/CurrencyContext';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { ProfilePreferences } from '../components/profile/ProfilePreferences';
import { ProfileTripSection } from '../components/profile/ProfileTripSection';

export const Profile: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const { trips } = useTrip();
  const { currency, setCurrency } = useCurrency();
  const navigate = useNavigate();

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form State
  const [name, setName] = useState(user?.name || 'Alex Morgan');
  const [homeCity, setHomeCity] = useState(user?.homeCity || 'San Francisco, CA');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [bio, setBio] = useState(user?.bio || 'Passionate wanderer, coffee enthusiast, seeking authentic food stalls and hidden mountain trails.');

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setHomeCity(user.homeCity || '');
      setAvatarUrl(user.avatarUrl || '');
      setBio(user.bio || '');
    }
  }, [user]);

  // Separate trips into Upcoming and Completed
  const { upcomingTrips, completedTrips } = useMemo(() => {
    const upcoming: typeof trips = [];
    const completed: typeof trips = [];

    const now = Date.now();

    trips.forEach((trip) => {
      const isExplicitCompleted = trip.status === 'completed';
      const isPastEndDate = trip.endDate ? new Date(trip.endDate).getTime() < now : false;

      if (isExplicitCompleted || isPastEndDate) {
        completed.push(trip);
      } else {
        upcoming.push(trip);
      }
    });

    return { upcomingTrips: upcoming, completedTrips: completed };
  }, [trips]);

  // Handle Save Preferences
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    setTimeout(() => {
      updateProfile({
        name: name.trim(),
        homeCity: homeCity.trim(),
        avatarUrl: avatarUrl.trim() || undefined,
        currency,
        bio: bio.trim()
      });
      setIsSaving(false);
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        setIsEditing(false);
      }, 1800);
    }, 350);
  };

  // Handle Cancel Edit
  const handleCancel = () => {
    if (user) {
      setName(user.name || '');
      setHomeCity(user.homeCity || '');
      setAvatarUrl(user.avatarUrl || '');
      setBio(user.bio || '');
    }
    setIsEditing(false);
  };

  // Handle Sign Out
  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-200 pb-16">
      
      {/* Profile Header Identity Card */}
      <ProfileHeader
        user={user}
        activeTripsCount={upcomingTrips.length}
        currency={currency}
        isEditing={isEditing}
        onToggleEdit={() => setIsEditing(!isEditing)}
        onSignOut={handleSignOut}
      />

      {/* Traveler Preferences & Settings (Form) */}
      {isEditing && (
        <ProfilePreferences
          name={name}
          setName={setName}
          homeCity={homeCity}
          setHomeCity={setHomeCity}
          currency={currency}
          setCurrency={setCurrency}
          avatarUrl={avatarUrl}
          setAvatarUrl={setAvatarUrl}
          bio={bio}
          setBio={setBio}
          isSaving={isSaving}
          savedSuccess={savedSuccess}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {/* Preplanned / Upcoming Journeys Section */}
      <ProfileTripSection
        title="Upcoming Journeys"
        subtitle="Your upcoming adventures and multi-city routes still in planning."
        type="upcoming"
        trips={upcomingTrips}
        maxDisplay={6}
      />

      {/* Previous / Completed Journeys Section */}
      <ProfileTripSection
        title="Completed Journeys"
        subtitle="Places you've already explored and completed expeditions."
        type="completed"
        trips={completedTrips}
        maxDisplay={6}
      />

    </div>
  );
};
