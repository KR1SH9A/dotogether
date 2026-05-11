import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Heart } from 'lucide-react';

interface ServerDownScreenProps {
  onRetry?: () => void;
}

const sadCat = ` /\\_/\\
( T_T )
 > _ <`;

export const ServerDownScreen: React.FC<ServerDownScreenProps> = ({ onRetry }) => {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg-color)',
        color: 'var(--text-main)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '32px 24px',
      }}
    >
      <div style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: '14px',
        fontWeight: 600,
        letterSpacing: '0.05em',
        color: 'var(--text-muted)',
      }}>
        DoTogether
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: '20px',
          maxWidth: '560px',
        }}
      >
        <div
          className="ascii-font"
          style={{
            fontSize: '24px',
            lineHeight: 1.15,
            color: 'var(--text-main)',
          }}
        >
          {sadCat}
        </div>

        <h1 style={{ fontSize: '26px', margin: 0, color: 'var(--text-main)' }}>
          oh no, the server is napping…
        </h1>

        <p style={{
          color: 'var(--text-muted)',
          fontSize: '16px',
          lineHeight: 1.6,
          margin: 0,
        }}>
          Welcome to <strong style={{ color: 'var(--text-main)' }}>DoTogether</strong> — a
          cozy space where you set goals with friends. The backend is on a free tier and
          may be taking a quick nap. We'll bring you back the moment it wakes up.
        </p>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
            style={{ display: 'inline-flex' }}
          >
            <RefreshCw size={12} />
          </motion.span>
          Retrying every few seconds…
        </div>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="btn-primary"
            style={{ marginTop: '4px' }}
          >
            Try again now
          </button>
        )}
      </motion.div>

      <div style={{
        fontSize: '13px',
        color: 'var(--text-muted)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
      }}>
        Made with <Heart size={12} color="var(--error)" /> for accountability
      </div>
    </div>
  );
};
