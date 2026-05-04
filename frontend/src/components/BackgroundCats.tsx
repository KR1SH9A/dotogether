import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const catFrames = [
  ` /\\_/\\\n( o.o )\n > ^ <`,
  ` /\\_/\\\n( -.- )\n > ^ <`,
  ` /\\_/\\\n( o.o )\n > ^ <`,
  ` /\\_/\\\n( ^.^ )\n > ^ <`
];

const sleepFrames = [
  ` /\\_/\\\n( -.- ) Z\n > ^ <`,
  ` /\\_/\\\n( -.- ) z\n > ^ <`
];

export const BackgroundCats: React.FC = () => {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1));
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      
      {/* Bottom Left Peeking Cat */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', delay: 1 }}
        className="ascii-font"
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '40px',
          color: 'var(--text-muted)',
          opacity: 0.3,
          fontSize: '14px',
          lineHeight: 1.2
        }}
      >
        {catFrames[frame % catFrames.length]}
      </motion.div>

      {/* Top Right Sleeping Cat */}
      <motion.div
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', delay: 1.5 }}
        className="ascii-font"
        style={{
          position: 'absolute',
          top: '80px',
          right: '40px',
          color: 'var(--text-muted)',
          opacity: 0.2,
          fontSize: '14px',
          lineHeight: 1.2,
          transform: 'scaleX(-1)' // flip horizontal
        }}
      >
        {sleepFrames[frame % sleepFrames.length]}
      </motion.div>

      {/* Bottom Right Floating Cat */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: [0, -10, 0], opacity: 1 }}
        transition={{ y: { repeat: Infinity, duration: 4, ease: "easeInOut" }, opacity: { delay: 2 } }}
        className="ascii-font"
        style={{
          position: 'absolute',
          bottom: '100px',
          right: '80px',
          color: 'var(--accent)',
          opacity: 0.3,
          fontSize: '12px',
          lineHeight: 1.2
        }}
      >
        {catFrames[(frame + 1) % catFrames.length]}
      </motion.div>

    </div>
  );
};
