import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { connectSocket, disconnectSocket } from '../realtime/socket';


interface User {
  id: number;
  email: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  sessionId: string | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(localStorage.getItem('sessionId'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, we might want a /me endpoint to fetch current user details using session
    // For now, if we have a sessionId, we'll assume logged in, but we'd need user data.
    // If we had a persistent store for user data, we'd load it here.
    const storedUser = localStorage.getItem('user');
    if (sessionId && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        logout();
      }
    } else {
      logout();
    }
    setIsLoading(false);
  }, []);

  const login = (token: string, userData: User) => {
    setSessionId(token);
    setUser(userData);
    localStorage.setItem('sessionId', token);
    localStorage.setItem('user', JSON.stringify(userData));
    connectSocket(token);
  };

  const logout = () => {
    apiClient.post('/auth/logout').catch(() => {});
    disconnectSocket();
    setSessionId(null);
    setUser(null);
    localStorage.removeItem('sessionId');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, sessionId, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
