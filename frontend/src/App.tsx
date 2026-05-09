import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { FriendsPage } from './pages/FriendsPage';
import { AsciiLoader } from './components/AsciiLoader';
import './index.css';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><AsciiLoader /></div>;
  if (!user) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><AsciiLoader /></div>;
  if (user) return <Navigate to="/dashboard" replace />;
  
  return <>{children}</>;
};

import { BackgroundCats } from './components/BackgroundCats';

const AppRoutes = () => {
  return (
    <>
      <BackgroundCats />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/friends" element={<ProtectedRoute><FriendsPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
};

import { ThemeProvider } from './context/ThemeContext';
import { useBackendWarmup } from './hooks/useBackendWarmup';
import { ServerWakeLoader } from './components/ServerWakeLoader';

const AppContent: React.FC = () => {
  const { state } = useBackendWarmup();
  if (state === 'waking') return <ServerWakeLoader />;
  if (state === 'pending') return null;
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
};

const App: React.FC = () => (
  <ThemeProvider>
    <AppContent />
  </ThemeProvider>
);

export default App;
