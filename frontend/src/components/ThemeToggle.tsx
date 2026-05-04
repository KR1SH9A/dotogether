import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [isFiddling, setIsFiddling] = useState(false);

  const handleToggle = () => {
    setIsFiddling(true);
    toggleTheme();
    setTimeout(() => {
      setIsFiddling(false);
    }, 400); // Cat fiddles for 400ms
  };

  const catIdle = ` /\\_/\\\n( o.o )`;
  const catFiddle = ` /\\_/\\\n( >.< )/`;

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* The Fiddling Cat */}
      <motion.div
        className="ascii-font"
        initial={false}
        animate={{ 
          y: isFiddling ? 5 : 0, 
          rotate: isFiddling ? 10 : 0 
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        style={{
          position: 'absolute',
          top: '-24px',
          right: '-10px',
          fontSize: '10px',
          color: 'var(--text-muted)',
          lineHeight: 1.1,
          pointerEvents: 'none',
          whiteSpace: 'pre'
        }}
      >
        {isFiddling ? catFiddle : catIdle}
      </motion.div>

      {/* The Button */}
      <motion.button
        onClick={handleToggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          border: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-color)',
          color: 'var(--text-main)',
          cursor: 'pointer',
          zIndex: 1,
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}
        aria-label="Toggle theme"
      >
        <motion.div
          initial={false}
          animate={{ rotate: theme === 'dark' ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 10 }}
        >
          {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
        </motion.div>
      </motion.button>
    </div>
  );
};
