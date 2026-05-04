import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Home, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeToggle } from './ThemeToggle';

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link to="/" style={{ fontWeight: 'bold', fontSize: '20px', color: 'var(--text-main)', fontFamily: "'Space Grotesk', sans-serif" }}>
            DoTogether
          </Link>
        </motion.div>
        {user && (
          <>
            <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
              <Home size={18} /> Dashboard
            </Link>
            <Link to="/friends" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
              <Users size={18} /> Friends
            </Link>
          </>
        )}
      </div>

      <div>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <ThemeToggle />
            <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              Hi, {user.username}
            </span>
            <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--error)' }}>
              <LogOut size={18} /> Logout
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <ThemeToggle />
            <Link to="/login" className="btn-secondary" style={{ padding: '8px 16px' }}>Login</Link>
            <Link to="/signup" className="btn-primary" style={{ padding: '8px 16px' }}>Sign Up</Link>
          </div>
        )}
      </div>
    </motion.nav>
  );
};
