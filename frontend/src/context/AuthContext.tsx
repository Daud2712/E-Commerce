import React, { createContext, useState, useContext, useEffect } from 'react';
import { UserRole } from '../types';

interface AuthContextType {
  token: string | null;
  userId: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (token: string, userId: string, role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');
    const storedRole = localStorage.getItem('role') as UserRole;
    if (storedToken && storedUserId && storedRole) {
      setToken(storedToken);
      setUserId(storedUserId);
      setRole(storedRole);
    }
  }, []);

  const login = (newToken: string, newUserId: string, newRole: UserRole) => {
    setToken(newToken);
    setUserId(newUserId);
    setRole(newRole);
    localStorage.setItem('token', newToken);
    localStorage.setItem('userId', newUserId);
    localStorage.setItem('role', newRole);
  };

  const logout = () => {
    setToken(null);
    setUserId(null);
    setRole(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
  };

  return (
    <AuthContext.Provider value={{ token, userId, role, isAuthenticated: !!token, login, logout }}>
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
