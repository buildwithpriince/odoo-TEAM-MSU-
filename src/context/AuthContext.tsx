import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, name?: string) => void;
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

const CURRENT_USER_KEY = 'globetrotter_user';
const REGISTERED_USERS_KEY = 'globetrotter_registered_users';

// --- Registered users registry (email -> User), backed by localStorage ---

const loadRegisteredUsers = (): Record<string, User> => {
  const saved = localStorage.getItem(REGISTERED_USERS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return {};
    }
  }
  return {};
};

const saveRegisteredUsers = (users: Record<string, User>) => {
  localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

// Seed the demo account into the registry so "sign in" with the demo email
// also resolves correctly through the same lookup path.
const ensureDemoUserSeeded = () => {
  const users = loadRegisteredUsers();
  const key = normalizeEmail(DEFAULT_USER.email);
  if (!users[key]) {
    users[key] = DEFAULT_USER;
    saveRegisteredUsers(users);
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    ensureDemoUserSeeded();
  }, []);

  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(CURRENT_USER_KEY);
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
        return DEFAULT_USER;
      }
    }
    return DEFAULT_USER; // Default logged in for smooth preview experience
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }, [user]);

  const login = (email: string, name?: string) => {
    const displayName = name || (email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1));
    setUser({
      id: 'usr-' + Date.now(),
      name: displayName,
      email,
      avatarUrl: DEFAULT_USER.avatarUrl,
      homeCity: 'New York, NY',
      currency: 'USD',
      bio: 'Ready for my next adventure!',
      savedDestinations: []
    });
  };

  const loginAsAdmin = () => {
    setUser(DEFAULT_ADMIN_USER);
  };

  const loginAsTraveler = () => {
    setUser(DEFAULT_TRAVELER_USER);
  };

  const signup = (email: string, name: string) => {
    login(email, name);
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (updatedData: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updatedData };

      // Keep the registered-users registry in sync so future logins reflect
      // the latest saved profile data too.
      const users = loadRegisteredUsers();
      const key = normalizeEmail(updated.email);
      users[key] = updated;
      saveRegisteredUsers(users);

      return updated;
    });
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