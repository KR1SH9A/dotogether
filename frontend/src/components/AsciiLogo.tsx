import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const AsciiLogo: React.FC<{ size?: 'small' | 'large' }> = ({ size = 'large' }) => {
  const isLarge = size === 'large';
  
  const textOnly = `   ____        _____                 __  __               
  / __ \\____  /_  __/___  ____ ____ / /_/ /_  ___  _____
 / / / / __ \\  / / / __ \\/ __ \`/ _ \\/ __/ __ \\/ _ \\/ ___/
/ /_/ / /_/ / / / / /_/ / /_/ /  __/ /_/ / / /  __/ /    
\\____/\\____/ /_/  \\____/\\__, /\\___/\\__/_/ /_/\\___/_/     
                       /____/                            `;

  const catIdle = ` /\\_/\\\n( o.o )\n > ^ <`;
  
  const catActions = [
    ` /\\_/\\\n( >.< )\n > ^ <`, // Squint
    ` /\\_/\\\n( @.@ )\n > ^ <`, // Dizzy
    ` /\\_/\\\n( -.- )\n > z Z`, // Sleep
    ` /\\_/\\\n( $.$ )\n > ^ <`, // Money
    ` /\\_/\\\n( ^.^ )\n > ^ <`  // Happy
  ];

  const [currentCat, setCurrentCat] = useState(catIdle);
  const [isCooldown, setIsCooldown] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  const handleCatClick = () => {
    if (isCooldown) return;
    
    setIsCooldown(true);
    const randomAction = catActions[Math.floor(Math.random() * catActions.length)];
    setCurrentCat(randomAction);
    setAnimationKey(prev => prev + 1);

    setTimeout(() => {
      setCurrentCat(catIdle);
      setIsCooldown(false);
    }, 3000);
  };

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="ascii-font"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: isLarge ? '16px' : '8px',
        fontSize: isLarge ? '14px' : '8px',
        color: 'var(--text-main)',
        marginBottom: isLarge ? '32px' : '0',
        lineHeight: 1.2,
        position: 'relative'
      }}
    >
      <motion.div
        key={animationKey}
        onClick={handleCatClick}
        whileHover={!isCooldown ? { scale: 1.1, rotate: 5 } : {}}
        animate={isCooldown ? { y: [0, -10, 0] } : {}}
        transition={isCooldown ? { type: "spring", stiffness: 300, damping: 10 } : {}}
        style={{
          cursor: isCooldown ? 'default' : 'pointer',
          whiteSpace: 'pre',
          color: isCooldown ? 'var(--accent)' : 'inherit',
          position: 'relative',
          zIndex: 2
        }}
        title={!isCooldown ? "Pet the cat!" : "The cat is resting..."}
      >
        {currentCat}
      </motion.div>
      <div style={{ whiteSpace: 'pre' }}>
        {textOnly}
      </div>
    </motion.div>
  );
};
