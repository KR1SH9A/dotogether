import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const catFrames = [
  ` /\\_/\\\n( o.o )\n > ^ <`,
  ` /\\_/\\\n( -.- )\n > ^ <`,
  ` /\\_/\\\n( o.o )\n > ^ <`,
  ` /\\_/\\\n( ^.^ )\n > ^ <`
];

interface AsciiLoaderProps {
  size?: number;
  compact?: boolean;
}

export const AsciiLoader: React.FC<AsciiLoaderProps> = ({ size = 20, compact = false }) => {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % catFrames.length);
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="ascii-font"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: `${size}px`,
        lineHeight: 1.1,
        color: 'currentColor',
        minHeight: compact ? undefined : '100px',
      }}
    >
      {catFrames[frame]}
    </motion.div>
  );
};
