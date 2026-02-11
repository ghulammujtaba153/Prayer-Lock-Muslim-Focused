'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { axiosInstance } from '@/config/url';

interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  streak: number;
  country?: string;
  marketType?: string;
  sentiment?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, country?: string, marketType?: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        setToken(savedToken);
        try {
          // Set token for axios instance before fetching user
          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
          const response = await axiosInstance.post('/auth/get-user', { token: savedToken });
          // Backend returns { id, email, streak, country, marketType, sentiment } directly or inside a user object
          // Looking at auth.service.ts getUser returns the object directly
          const userData = response.data;
          setUser(userData);
        } catch (error) {
          console.error('Failed to restore session:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });
      const { accessToken, user: userData } = response.data;
      
      setToken(accessToken);
      setUser(userData);
      localStorage.setItem('token', accessToken);
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    } catch (error) {
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, country?: string, marketType?: string) => {
    await axiosInstance.post('/auth/register', { name, email, password, country, marketType });
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const response = await axiosInstance.patch('/auth/profile', data);
      setUser(response.data);
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    delete axiosInstance.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        updateProfile,
        logout,
        isAuthenticated: !!token,
        loading,
      }}
    >
      {loading ? (
        <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center">
          <div className="flex flex-col items-center gap-6">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 border-4 border-accent/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-accent rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-4 bg-accent/10 rounded-full flex items-center justify-center">
                <span className="text-2xl animate-pulse">⚡</span>
              </div>
            </div>
            <div className="space-y-2 text-center">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">TradeAI</h2>
              <p className="text-sm text-slate-500 animate-pulse font-medium">Securing your session...</p>
            </div>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
