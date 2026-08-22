import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, name?: string, role?: 'admin' | 'traveler') => void;
  signup: (email: string, name: string) => void;
  logout: () => void;
  updateProfile: (updatedData: Partial<User>) => void;
  loginAsAdmin: () => void;
  loginAsTraveler: () => void;
}

export const DEFAULT_TRAVELER_USER: User = {
  id: 'usr-101',
  name: 'Alex Morgan',
  email: 'alex.morgan@globetrotter.io',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  homeCity: 'San Francisco, CA',
  currency: 'USD',
  bio: 'Passionate wanderer, coffee enthusiast, seeking authentic food stalls and hidden mountain trails.',
  savedDestinations: ['Kyoto', 'Amalfi Coast', 'Cape Town'],
  role: 'traveler'
};

export const DEFAULT_ADMIN_USER: User = {
  id: 'usr-admin-01',
  name: 'Platform Administrator',
  email: 'admin@globetrotter.io',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  homeCity: 'Global Operations',
  currency: 'USD',
  bio: 'GlobeTrotter platform administrator managing destinations, itineraries, and travel intelligence.',
  savedDestinations: ['Jaipur', 'Tokyo', 'Paris'],
  role: 'admin'
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('globetrotter_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) {
          // Normalize role if not present
          if (!parsed.role) {
            parsed.role = parsed.email.toLowerCase().includes('admin') ? 'admin' : 'traveler';
          }
          return parsed;
        }
        return DEFAULT_TRAVELER_USER;
      } catch {
        return DEFAULT_TRAVELER_USER;
      }
    }
    return DEFAULT_TRAVELER_USER; // Default logged in for smooth preview experience
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('globetrotter_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('globetrotter_user');
    }
  }, [user]);

  const login = (email: string, name?: string, explicitRole?: 'admin' | 'traveler') => {
    const isEmailAdmin = email.toLowerCase().includes('admin') || email.toLowerCase() === 'admin@globetrotter.io';
    const role: 'admin' | 'traveler' = explicitRole || (isEmailAdmin ? 'admin' : 'traveler');
    const displayName = name || (email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1));
    
    setUser({
      id: 'usr-' + Date.now(),
      name: displayName,
      email,
      avatarUrl: DEFAULT_TRAVELER_USER.avatarUrl,
      homeCity: role === 'admin' ? 'Global HQ' : 'New York, NY',
      currency: 'USD',
      bio: role === 'admin' ? 'GlobeTrotter Platform Administrator' : 'Ready for my next adventure!',
      savedDestinations: [],
      role
    });
  };

  const loginAsAdmin = () => {
    setUser(DEFAULT_ADMIN_USER);
  };

  const loginAsTraveler = () => {
    setUser(DEFAULT_TRAVELER_USER);
  };

  const signup = (email: string, name: string) => {
    login(email, name, 'traveler');
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (updatedData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updatedData } : null);
  };

  const isAdmin = user?.role === 'admin' || user?.email?.toLowerCase().includes('admin') === true;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin,
        login,
        signup,
        logout,
        updateProfile,
        loginAsAdmin,
        loginAsTraveler
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
