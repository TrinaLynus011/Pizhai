// components/XPBar.jsx — Framer Motion animated XP progress bar in Tamil
import { motion } from 'framer-motion';

const LEVELS = [
  { name: 'ஆரம்ப நிலை',     min: 0,   max: 100,  color: '#6E8E72' }, // sage
  { name: 'கற்பவர்',      min: 100, max: 300,  color: '#6A808C' }, // slate blue
  { name: 'திறமையாளர்',       min: 300, max: 700,  color: '#8A768F' }, // vintage mauve
  { name: 'தமிழ் மாஸ்டர்', min: 700, max: 99999, color: '#C5A880' }, // rich bronze/gold
];

function getLevelInfo(xp) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].min) return { ...LEVELS[i], index: i };
  }
  return { ...LEVELS[0], index: 0 };
}

function getProgress(xp) {
  const cur  = getLevelInfo(xp);
  const next = LEVELS[cur.index + 1];
  if (!next) return { pct: 100, xpToNext: 0, cur, next: null };
  const range  = next.min - cur.min;
  const earned = xp - cur.min;
  return { pct: Math.min(100, Math.round((earned / range) * 100)), xpToNext: next.min - xp, cur, next };
}

export default function XPBar({ xp = 0 }) {
  const { pct, xpToNext, cur, next } = getProgress(xp);

  return (
    <div style={{ width: '100%' }} className="font-tamil">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
        <span style={{ fontWeight: 800, color: cur.color, letterSpacing: '0.02em' }}>{cur.name}</span>
        {next && (
          <span style={{ color: 'var(--color-text-secondary)', fontWeight: 700 }}>
            அடுத்த நிலைக்கு {xpToNext} XP → {next.name}
          </span>
        )}
      </div>

      {/* Track */}
      <div style={{
        height: '12px',
        borderRadius: '12px',
        background: 'rgba(139, 115, 85, 0.12)',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: 'inset 0 1px 3px rgba(72,60,48,0.1)',
      }}>
        {/* Fill */}
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          style={{
            height: '100%',
            borderRadius: '12px',
            background: `linear-gradient(90deg, ${cur.color}77, ${cur.color})`,
            boxShadow: `0 0 10px ${cur.color}40`,
            position: 'relative',
          }}
        >
          {/* Shimmer */}
          <motion.div
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.5 }}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.4) 50%,transparent 100%)',
            }}
          />
        </motion.div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 700 }}>
        <span>மொத்தம் {xp} XP</span>
        <span>{pct}%</span>
      </div>
    </div>
  );
}
