import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Home, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeToggle } from './ThemeToggle';
import { AsciiLogo } from './AsciiLogo';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <motion.nav 
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 32px',
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'color-mix(in srgb, var(--bg-color) 70%, transparent)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}
    >
      {/* Left Area: Dashboard & Friends */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flex: 1 }}>
        {user && (
          <>
            <Link to="/dashboard" className="hover-danger" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '16px', transition: 'color 0.2s' }}>
              <Home size={18} /> Dashboard
            </Link>
            <Link to="/friends" className="hover-danger" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '16px', transition: 'color 0.2s' }}>
              <Users size={18} /> Friends
            </Link>
          </>
        )}
      </div>

      {/* Center Area: Logo */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <AsciiLogo size="small" />
          </Link>
        </motion.div>
      </div>

      {/* Right Area: Controls & Profile */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px' }}>
        {user ? (
          <>
            <ThemeToggle />
            <span style={{ fontSize: '16px', color: 'var(--text-muted)' }}>
              Hi, {user.username}
            </span>
            <button onClick={handleLogout} className="hover-danger" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--error)', fontSize: '16px', transition: 'opacity 0.2s' }}>
              <LogOut size={18} /> Logout
            </button>
          </>
        ) : (
          <>
            <ThemeToggle />
            <Link to="/login" className="btn-secondary" style={{ padding: '8px 16px' }}>Login</Link>
            <Link to="/signup" className="btn-primary" style={{ padding: '8px 16px' }}>Sign Up</Link>
          </>
        )}
      </div>
    </motion.nav>
  );
};
