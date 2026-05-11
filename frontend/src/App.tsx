import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { FriendsPage } from './pages/FriendsPage';
import { AsciiLoader } from './components/AsciiLoader';
import { BackgroundCats } from './components/BackgroundCats';
import { ThemeProvider } from './context/ThemeContext';
import { BackendStatusProvider, useBackendStatus } from './context/BackendStatusContext';
import { ServerWakeLoader } from './components/ServerWakeLoader';
import { ServerDownScreen } from './components/ServerDownScreen';
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

const AppContent: React.FC = () => {
  const { status, retryNow } = useBackendStatus();
  const [showWakeLoader, setShowWakeLoader] = useState(false);

  useEffect(() => {
    if (status !== 'warming') {
      setShowWakeLoader(false);
      return;
    }
    const id = window.setTimeout(() => setShowWakeLoader(true), 1500);
    return () => window.clearTimeout(id);
  }, [status]);

  if (status === 'warming') return showWakeLoader ? <ServerWakeLoader /> : null;
  if (status === 'down') return <ServerDownScreen onRetry={retryNow} />;
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
    <BackendStatusProvider>
      <AppContent />
    </BackendStatusProvider>
  </ThemeProvider>
);

export default App;
