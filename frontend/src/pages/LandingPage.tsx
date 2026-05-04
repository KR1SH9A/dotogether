import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AsciiLogo } from '../components/AsciiLogo';
import { Heart } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: 'calc(100vh - 70px)', // minus navbar
      justifyContent: 'space-between'
    }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', textAlign: 'center' }}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            backgroundColor: 'rgba(210, 168, 134, 0.2)',
            color: 'var(--accent-hover)',
            padding: '8px 16px',
            borderRadius: '24px',
            fontSize: '12px',
            fontWeight: 'bold',
            marginBottom: '32px',
            letterSpacing: '1px'
          }}
        >
          APP IS IN EARLY DEVELOPMENT (WIP)
        </motion.div>

        <AsciiLogo size="large" />

        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 100, damping: 12 }}
          style={{ fontSize: '32px', marginBottom: '16px', color: 'var(--text-main)' }}
        >
          A space where you can set goals and tasks with your friends.
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 80, damping: 15 }}
          style={{ fontSize: '18px', color: 'var(--text-muted)', maxWidth: '600px', marginBottom: '48px', lineHeight: 1.6 }}
        >
          Welcome to DoTogether. I believe that tackling your to-do lists and achieving your dreams is better when you're not alone. This cozy little corner of the internet helps you stay accountable with the people you care about.
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 100, damping: 15 }}
          style={{ display: 'flex', gap: '24px' }}
        >
          <Link to="/signup" className="btn-primary" style={{ fontSize: '18px', padding: '16px 32px' }}>
            Get Started
          </Link>
          <Link to="/login" className="btn-secondary" style={{ fontSize: '18px', padding: '16px 32px' }}>
            Login
          </Link>
        </motion.div>
      </div>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        style={{
          padding: '24px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '14px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          Made with <Heart size={14} color="var(--error)" /> for accountability
        </div>
        <div>
          Thank you visitors for checking my project — <strong>KRI5HNA</strong>
        </div>
      </motion.footer>
    </div>
  );
};
