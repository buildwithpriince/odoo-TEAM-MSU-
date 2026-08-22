
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { apiFetch } from '../lib/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string, name?: string) => Promise<void>;
  signup: (email: string, name: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updatedData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('globetrotter_token');
    const loggedOut = localStorage.getItem('globetrotter_logged_out') === '1';

    const restore = async () => {
      try {
        if (token && !loggedOut) {
          const data = await apiFetch<{ user: User }>('/auth/me');
          setUser(data.user);
          return;
        }
        if (!token && !loggedOut) {
          const data = await apiFetch<{ token: string; user: User }>('/auth/demo', { method: 'POST' });
          localStorage.setItem('globetrotter_token', data.token);
          localStorage.setItem('globetrotter_user', JSON.stringify(data.user));
          setUser(data.user);
        }
      } catch {
        localStorage.removeItem('globetrotter_token');
        localStorage.removeItem('globetrotter_user');
      } finally {
        setIsLoading(false);
      }
    };
    restore();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('globetrotter_user', JSON.stringify(user));
      if (user.currency === 'USD' || user.currency === 'INR') localStorage.setItem('app_currency', user.currency);
    } else localStorage.removeItem('globetrotter_user');
  }, [user]);

  const login = async (email: string, password = 'traveler2026', _name?: string) => {
    const data = await apiFetch<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    localStorage.setItem('globetrotter_token', data.token);
    localStorage.removeItem('globetrotter_logged_out');
    setUser(data.user);
  };

  const signup = async (email: string, name: string, password = 'traveler2026') => {
    const data = await apiFetch<{ token: string; user: User }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, name, password })
    });
    localStorage.setItem('globetrotter_token', data.token);
    localStorage.removeItem('globetrotter_logged_out');
    setUser(data.user);
  };

  const logout = async () => {
    try { await apiFetch('/auth/logout', { method: 'POST' }); } catch { /* local logout still succeeds */ }
    localStorage.removeItem('globetrotter_token');
    localStorage.removeItem('globetrotter_user');
    localStorage.setItem('globetrotter_logged_out', '1');
    setUser(null);
  };

  const updateProfile = async (updatedData: Partial<User>) => {
    const data = await apiFetch<{ user: User }>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(updatedData)
    });
    setUser(data.user);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
