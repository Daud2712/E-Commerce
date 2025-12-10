import React, { createContext, useState, useContext, useEffect } from 'react';
import { UserRole } from '../types';

interface AuthContextType {
  token: string | null;
  userId: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoggingIn: boolean; // Add isLoggingIn to the interface
  login: (token: string, userId: string, role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false); // New isLoggingIn state

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');
    const storedRole = localStorage.getItem('role') as UserRole;

    console.log('AuthContext useEffect: storedToken', storedToken);
    console.log('AuthContext useEffect: storedUserId', storedUserId);
    console.log('AuthContext useEffect: storedRole', storedRole);

    if (storedToken && storedUserId && storedRole) {
      setToken(storedToken);
      setUserId(storedUserId);
      setRole(storedRole);
      console.log('AuthContext useEffect: Session restored.');
    } else {
      console.log('AuthContext useEffect: No session to restore or incomplete session data.');
    }
    setIsLoading(false); // Set isLoading to false after check
  }, []);

  const login = (newToken: string, newUserId: string, newRole: UserRole) => {
    setIsLoggingIn(true); // Set to true at the start of login
    console.log('AuthContext: Logging in with:', { newToken, newUserId, newRole });
    setToken(newToken);
    setUserId(newUserId);
    setRole(newRole);
    localStorage.setItem('token', newToken);
    localStorage.setItem('userId', newUserId);
    localStorage.setItem('role', newRole);
    setIsLoggingIn(false); // Set to false at the end of login
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
  // Construct the user object from the context state for convenience
  const user = context.userId && context.role ? { _id: context.userId, role: context.role } : undefined;
  return { ...context, user };
};
