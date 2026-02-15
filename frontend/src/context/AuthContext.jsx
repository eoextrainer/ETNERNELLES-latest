/**
 * Authentication Context for ETERNELLES Platform
 * Provides authentication state and methods throughout the application
 */

import { createContext, useState, useContext, useEffect } from 'react';
import { getApiBaseCandidates, isApiBaseLocked } from '../config/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user and token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const candidates = getApiBaseCandidates();
      let response;
      let data;
      let lastError;
      let selectedBase;

      for (const base of candidates) {
        try {
          response = await fetch(`${base}/v1/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });

          data = await response.json().catch(() => null);

          if (response.ok && data) {
            lastError = null;
            selectedBase = base;
            break;
          }

          lastError = new Error(data?.detail || 'Login failed');
        } catch (fetchError) {
          lastError = fetchError;
        }
      }

      if (lastError) {
        throw lastError;
      }
      
      if (selectedBase && !isApiBaseLocked()) {
        localStorage.setItem('api_base', selectedBase);
      }
      // Store token and user
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setToken(data.access_token);
      setUser(data.user);
      
      return data.user;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setError(null);
  };

  const isAuthenticated = !!token && !!user;

  const value = {
    user,
    token,
    loading,
    error,
    login,
    logout,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
