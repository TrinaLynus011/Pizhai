// components/MistakeCard.jsx
// Displays a single pronunciation mistake with type, graphemes, and tip

const TYPE_CONFIG = {
  phonetic_confusion: {
    label: 'Phonetic Confusion',
    icon: '🔄',
    cls: 'mistake-confusion',
    color: '#F97316',
  },
  deletion: {
    label: 'Missing Sound',
    icon: '❌',
    cls: 'mistake-deletion',
    color: '#EF4444',
  },
  insertion: {
    label: 'Extra Sound',
    icon: '➕',
    cls: 'mistake-insertion',
    color: '#A855F7',
  },
  mismatch: {
    label: 'Wrong Sound',
    icon: '⚠️',
    cls: 'mistake-mismatch',
    color: '#F43F5E',
  },
  no_speech: {
    label: 'No Speech Detected',
    icon: '🎙️',
    cls: 'mistake-no_speech',
    color: '#6B7280',
  },
};

export default function MistakeCard({ mistake, index }) {
  const config = TYPE_CONFIG[mistake.type] || TYPE_CONFIG.mismatch;

  return (
    <div
      className={`glass rounded-xl p-4 border-l-4 animate-slide-up ${config.cls}`}
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0 mt-0.5">{config.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span
              className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{ background: `${config.color}25`, color: config.color }}
            >
              {config.label}
            </span>
          </div>

          {/* Grapheme comparison */}
          {(mistake.expected || mistake.user) && (
            <div className="flex items-center gap-2 my-2 font-tamil">
              {mistake.user && (
                <span
                  className="text-2xl font-bold px-3 py-1 rounded-lg"
                  style={{ background: 'rgba(239,68,68,0.15)', color: '#FCA5A5' }}
                >
                  {mistake.user}
                </span>
              )}
              {mistake.user && mistake.expected && (
                <span style={{ color: 'rgba(248,244,255,0.4)', fontSize: '14px' }}>→</span>
              )}
              {mistake.expected && (
                <span
                  className="text-2xl font-bold px-3 py-1 rounded-lg"
                  style={{ background: 'rgba(16,185,129,0.15)', color: '#6EE7B7' }}
                >
                  {mistake.expected}
                </span>
              )}
            </div>
          )}

          <p style={{ color: 'rgba(248,244,255,0.8)', fontSize: '13px', lineHeight: '1.5' }}>
            {mistake.feedback}
          </p>

          {mistake.tip && (
            <p
              className="mt-2 text-xs rounded-lg p-2.5"
              style={{
                background: 'rgba(255,255,255,0.05)',
                color: 'rgba(248,244,255,0.55)',
                borderLeft: `2px solid ${config.color}60`,
                lineHeight: '1.6',
              }}
            >
              💡 {mistake.tip}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
