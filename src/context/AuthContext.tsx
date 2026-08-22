import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthResult {
  success: boolean;
  error?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string) => AuthResult;
  signup: (email: string, name: string) => AuthResult;
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

// Seed the demo traveler + demo admin into the registry so signing in with
// either demo email also resolves correctly through the same lookup path.
const ensureDemoUsersSeeded = () => {
  const users = loadRegisteredUsers();
  let changed = false;

  const travelerKey = normalizeEmail(DEFAULT_TRAVELER_USER.email);
  if (!users[travelerKey]) {
    users[travelerKey] = DEFAULT_TRAVELER_USER;
    changed = true;
  }

  const adminKey = normalizeEmail(DEFAULT_ADMIN_USER.email);
  if (!users[adminKey]) {
    users[adminKey] = DEFAULT_ADMIN_USER;
    changed = true;
  }

  if (changed) saveRegisteredUsers(users);
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    ensureDemoUsersSeeded();
  }, []);

  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(CURRENT_USER_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) {
          if (!parsed.role) {
            parsed.role = parsed.email.toLowerCase().includes('admin') ? 'admin' : 'traveler';
          }
          return parsed;
        }
        return null;
      } catch {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  }, [user]);

  const signup = (email: string, name: string): AuthResult => {
    const key = normalizeEmail(email);
    const users = loadRegisteredUsers();

    if (users[key]) {
      return { success: false, error: 'An account with this email already exists. Please sign in instead.' };
    }

    const newUser: User = {
      id: 'usr-' + Date.now(),
      name: name.trim(),
      email: email.trim(),
      avatarUrl: DEFAULT_TRAVELER_USER.avatarUrl,
      homeCity: '',
      currency: 'USD',
      bio: 'Ready for my next adventure!',
      savedDestinations: [],
      role: 'traveler'
    };

    users[key] = newUser;
    saveRegisteredUsers(users);
    setUser(newUser);
    return { success: true };
  };

  const login = (email: string): AuthResult => {
    const key = normalizeEmail(email);
    const users = loadRegisteredUsers();
    const found = users[key];

    if (!found) {
      return { success: false, error: 'No account found for this email. Please sign up first.' };
    }

    setUser(found);
    return { success: true };
  };

  const loginAsAdmin = () => {
    setUser(DEFAULT_ADMIN_USER);
  };

  const loginAsTraveler = () => {
    setUser(DEFAULT_TRAVELER_USER);
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (updatedData: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updatedData };

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