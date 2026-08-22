import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string) => { success: boolean; error?: string };
  signup: (email: string, name: string) => { success: boolean; error?: string };
  logout: () => void;
  updateProfile: (updatedData: Partial<User>) => void;
}

const DEFAULT_USER: User = {
  id: 'usr-101',
  name: 'Alex Morgan',
  email: 'alex.morgan@globetrotter.io',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  homeCity: 'San Francisco, CA',
  currency: 'USD',
  bio: 'Passionate wanderer, coffee enthusiast, seeking authentic food stalls and hidden mountain trails.',
  savedDestinations: ['Kyoto', 'Amalfi Coast', 'Cape Town']
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
        return JSON.parse(saved);
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

  const signup = (email: string, name: string): { success: boolean; error?: string } => {
    const key = normalizeEmail(email);
    const users = loadRegisteredUsers();

    if (users[key]) {
      return { success: false, error: 'An account with this email already exists. Please sign in instead.' };
    }

    const newUser: User = {
      id: 'usr-' + Date.now(),
      name: name.trim(),
      email: email.trim(),
      avatarUrl: DEFAULT_USER.avatarUrl,
      homeCity: '',
      currency: 'USD',
      bio: 'Ready for my next adventure!',
      savedDestinations: []
    };

    users[key] = newUser;
    saveRegisteredUsers(users);
    setUser(newUser);
    return { success: true };
  };

  const login = (email: string): { success: boolean; error?: string } => {
    const key = normalizeEmail(email);
    const users = loadRegisteredUsers();
    const found = users[key];

    if (!found) {
      return { success: false, error: 'No account found for this email. Please sign up first.' };
    }

    setUser(found);
    return { success: true };
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

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        updateProfile
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