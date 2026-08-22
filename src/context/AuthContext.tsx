import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, name?: string) => void;
  signup: (email: string, name: string) => void;
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('globetrotter_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null; // Not logged in until the user signs in via /login
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('globetrotter_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('globetrotter_user');
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

  const signup = (email: string, name: string) => {
    login(email, name);
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (updatedData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updatedData } : null);
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
