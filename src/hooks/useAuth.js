// Severa AI Security Platform - Custom useAuth Hook
import { useState, useCallback } from 'react';
import { storageService } from '../services/storageService';
import { authService } from '../services/authService';

export function useAuth() {
  const [user, setUser] = useState(() => storageService.getUserSession());

  const login = useCallback((userSession) => {
    storageService.setUserSession(userSession);
    setUser(userSession);
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    isDemoUser: user?.email === 'demo@severa.ai',
    login,
    logout
  };
}
