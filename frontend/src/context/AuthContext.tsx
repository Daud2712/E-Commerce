import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { UserRole } from '../types';
import socketService from '../services/socket';

interface AuthContextType {
  token: string | null;
  userId: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoggingIn: boolean;
  login: (token: string, userId: string, role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Update browser tab title based on auth state/role
  useEffect(() => {
    const baseTitle = 'Fresh EDTanzania - E-Commerce Platform';
    if (token && role) {
      const roleLabel = role === UserRole.ADMIN
        ? 'Admin'
        : role === UserRole.SELLER
        ? 'Seller'
        : role === UserRole.RIDER
        ? 'Rider'
        : 'Buyer';
      document.title = `${baseTitle} | ${roleLabel}`;
    } else {
      document.title = baseTitle;
    }
  }, [token, role]);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');
    const storedRole = localStorage.getItem('role') as UserRole;

    if (storedToken && storedUserId && storedRole) {
      setToken(storedToken);
      setUserId(storedUserId);
      setRole(storedRole);
      
      const socket = socketService.connect();
      if (socket) {
        switch (storedRole) {
          case UserRole.BUYER:
            socketService.joinUser(storedUserId);
            break;
          case UserRole.SELLER:
            socketService.joinSeller(storedUserId);
            break;
          case UserRole.RIDER:
            socketService.joinRider(storedUserId);
            break;
        }
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, newUserId: string, newRole: UserRole) => {
    setIsLoggingIn(true);
    setToken(newToken);
    setUserId(newUserId);
    setRole(newRole);
    localStorage.setItem('token', newToken);
    localStorage.setItem('userId', newUserId);
    localStorage.setItem('role', newRole);

    const socket = socketService.connect();
    if (socket) {
      switch (newRole) {
        case UserRole.BUYER:
          socketService.joinUser(newUserId);
          break;
        case UserRole.SELLER:
          socketService.joinSeller(newUserId);
          break;
        case UserRole.RIDER:
          socketService.joinRider(newUserId);
          break;
      }
    }
    setIsLoggingIn(false);
  };

  const logout = () => {
    setToken(null);
    setUserId(null);
    setRole(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    socketService.disconnect();
  };

  return (
    <AuthContext.Provider value={{ token, userId, role, isAuthenticated: !!token, isLoading, isLoggingIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  const user = useMemo(() => (context.userId && context.role ? { _id: context.userId, role: context.role } : undefined), [context.userId, context.role]);
  return { ...context, user };
};
