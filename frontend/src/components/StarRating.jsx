// components/StarRating.jsx — Framer Motion star pop-in
import { motion } from 'framer-motion';

const starVariants = {
  initial: { scale: 0, rotate: -30, opacity: 0 },
  animate: (i) => ({
    scale: 1,
    rotate: 0,
    opacity: 1,
    transition: { delay: 0.2 + i * 0.18, type: 'spring', stiffness: 300, damping: 14 },
  }),
};

const StarSVG = ({ filled, size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"
    style={{ filter: filled ? 'drop-shadow(0 0 8px rgba(214,104,83,0.45))' : 'none' }}>
    <path
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      fill={filled ? 'var(--color-gold)' : 'rgba(139, 115, 85, 0.12)'}
      stroke={filled ? '#C5A880' : 'rgba(139, 115, 85, 0.25)'}
      strokeWidth={1.5}
    />
  </svg>
);

export default function StarRating({ stars, size = 48 }) {
  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'center' }}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          custom={i}
          variants={starVariants}
          initial="initial"
          animate="animate"
        >
          <StarSVG filled={i < stars} size={size} />
        </motion.div>
      ))}
    </div>
  );
}
