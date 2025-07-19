'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from './api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'student';
  department?: { _id: string; name: string };
  departments?: { _id: string; name: string }[];
  isApproved: boolean;
  profilePicture?: string;
  avatar?: string;
  number?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (login: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  googleLogin: (token: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const setAuthTokenCookie = (token: string) => {
    if (typeof document !== 'undefined') {
      document.cookie = `authToken=${token}; path=/; max-age=604800; SameSite=Lax`; // max-age=7 days
    }
  };

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token && token.trim() !== '') {
        try {
          const response = await authAPI.getCurrentUser();
          setUser(response.data.data);
        } catch (apiError) {
          console.error('API call failed:', apiError);
          // Clear invalid tokens but don't redirect
          localStorage.removeItem('authToken');
          clearAuthTokenCookie();
        }
      } else {
        // Clear any stale tokens
        localStorage.removeItem('authToken');
        clearAuthTokenCookie();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear invalid tokens but don't redirect
      localStorage.removeItem('authToken');
      clearAuthTokenCookie();
    } finally {
      setLoading(false);
    }
  };

  const login = async (login: string, password: string) => {
    try {
      const response = await authAPI.login({ login, password });
      const { token, user } = response.data.data;
      localStorage.setItem('authToken', token);
      setAuthTokenCookie(token);
      setUser(user);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const clearAuthTokenCookie = () => {
    if (typeof document !== 'undefined') {
      document.cookie = 'authToken=; Max-Age=0; path=/;';
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await authAPI.register(userData);
      const { token, user } = response.data.data;
      localStorage.setItem('authToken', token);
      setAuthTokenCookie(token);
      setUser(user);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const googleLogin = async (token: string) => {
    try {
      const response = await authAPI.googleLogin(token);
      const { jwtToken, user } = response.data.data;
      localStorage.setItem('authToken', jwtToken);
      setAuthTokenCookie(jwtToken);
      setUser(user);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Google login failed');
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
    clearAuthTokenCookie();
  };

  const updateUser = (userData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    googleLogin,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 