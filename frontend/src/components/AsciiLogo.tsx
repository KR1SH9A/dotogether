import React from 'react';
import { motion } from 'framer-motion';

export const AsciiLogo: React.FC<{ size?: 'small' | 'large' }> = ({ size = 'large' }) => {
  const isLarge = size === 'large';
  
  const logoText = `
   /\\_/\\    ____        _____                 __  __               
  ( o.o )  / __ \\____  /_  __/___  ____ ____ / /_/ /_  ___  _____
   > ^ <  / / / / __ \\  / / / __ \\/ __ \`/ _ \\/ __/ __ \\/ _ \\/ ___/
         / /_/ / /_/ / / / / /_/ / /_/ /  __/ /_/ / / /  __/ /    
         \\____/\\____/ /_/  \\____/\\__, /\\___/\\__/_/ /_/\\___/_/     
                                /____/                            
  `;

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="ascii-font"
      style={{
        fontSize: isLarge ? '14px' : '8px',
        color: 'var(--text-main)',
        marginBottom: isLarge ? '32px' : '16px',
        lineHeight: 1.2
      }}
    >
      {logoText}
    </motion.div>
  );
};
