// components/LevelBadge.jsx
// Level badge with clean border and emoji

const LEVEL_STYLES = {
  'Beginner':     { cls: 'level-beginner',     emoji: '🌱' },
  'Learner':      { cls: 'level-learner',      emoji: '📚' },
  'Fluent':       { cls: 'level-fluent',       emoji: '🗣️' },
  'Tamil Master': { cls: 'level-tamil-master', emoji: '🏆' },
};

export default function LevelBadge({ level = 'Beginner', size = 'md', showEmoji = true }) {
  const style = LEVEL_STYLES[level] || LEVEL_STYLES['Beginner'];

  const sizes = {
    sm: { px: '6px 12px', fontSize: '10px', borderRadius: '8px' },
    md: { px: '8px 16px', fontSize: '12px', borderRadius: '10px' },
    lg: { px: '10px 20px', fontSize: '14px', borderRadius: '12px' },
  };

  const s = sizes[size] || sizes.md;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider ${style.cls}`}
      style={{
        padding: s.px,
        fontSize: s.fontSize,
        borderRadius: s.borderRadius,
        boxShadow: '0 2px 8px rgba(59, 42, 31, 0.03)',
        whiteSpace: 'nowrap',
      }}
    >
      {showEmoji && <span>{style.emoji}</span>}
      {level}
    </span>
  );
}
