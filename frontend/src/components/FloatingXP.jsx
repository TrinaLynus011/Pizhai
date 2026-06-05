// components/FloatingXP.jsx
// Floating "+XP" number animation that flies up and fades in Olive Green
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function FloatingXP({ xp, trigger }) {
  const [visible, setVisible] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (!trigger || !xp) return;
    setKey((k) => k + 1);
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 1600);
    return () => clearTimeout(t);
  }, [trigger, xp]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={key}
          initial={{ opacity: 1, y: 10, scale: 0.9 }}
          animate={{ opacity: 0, y: -60, scale: 1.15 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 50,
            fontWeight: 800,
            fontSize: '32px',
            color: 'var(--color-emerald)', // Olive Green
            fontFamily: 'var(--font-sans)',
            whiteSpace: 'nowrap',
          }}
        >
          +{xp} XP
        </motion.div>
      )}
    </AnimatePresence>
  );
}
