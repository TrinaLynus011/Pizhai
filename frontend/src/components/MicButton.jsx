// components/MicButton.jsx — Framer Motion mic button
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square } from 'lucide-react';

export default function MicButton({ state, onClick }) {
  const isRecording  = state === 'recording';
  const isProcessing = state === 'processing';

  const bgColor = isRecording
    ? 'linear-gradient(135deg,#EF4444,#DC2626)'
    : isProcessing
    ? 'linear-gradient(135deg,#6B7280,#4B5563)'
    : 'linear-gradient(135deg,#6C63FF,#A855F7)';

  const shadow = isRecording
    ? '0 0 0 4px rgba(239,68,68,0.35), 0 12px 40px rgba(239,68,68,0.45)'
    : 'linear-gradient(135deg,#6C63FF,#A855F7)'
    ? '0 0 0 4px rgba(108,99,255,0.3), 0 12px 40px rgba(108,99,255,0.4)'
    : '0 8px 24px rgba(0,0,0,0.3)';

  return (
    <div className="relative flex items-center justify-center" style={{ width: '200px', height: '200px' }}>
      {/* Ripple rings while recording */}
      <AnimatePresence>
        {isRecording && [0, 1, 2].map((i) => (
          <motion.span
            key={i}
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 1.9, opacity: 0 }}
            transition={{ duration: 1.6, delay: i * 0.45, repeat: Infinity, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              width: '112px',
              height: '112px',
              borderRadius: '50%',
              border: '2px solid rgba(239,68,68,0.5)',
              pointerEvents: 'none',
            }}
          />
        ))}
      </AnimatePresence>

      {/* Glow halo on idle */}
      {!isRecording && !isProcessing && (
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(108,99,255,0.25) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Main button */}
      <motion.button
        onClick={onClick}
        disabled={isProcessing}
        whileHover={!isProcessing ? { scale: 1.06 } : {}}
        whileTap={!isProcessing ? { scale: 0.94 } : {}}
        animate={isRecording ? { scale: [1, 1.04, 1] } : { scale: 1 }}
        transition={isRecording ? { duration: 1.4, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        style={{
          position: 'relative',
          zIndex: 10,
          width: '112px',
          height: '112px',
          borderRadius: '50%',
          background: bgColor,
          boxShadow: shadow,
          border: 'none',
          cursor: isProcessing ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isProcessing ? 0.6 : 1,
        }}
      >
        {isProcessing ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{ width: 36, height: 36, border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }}
          />
        ) : isRecording ? (
          <Square size={36} color="white" fill="white" />
        ) : (
          <Mic size={36} color="white" strokeWidth={2} />
        )}
      </motion.button>

      {/* Status label */}
      <motion.p
        key={state}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          position: 'absolute',
          bottom: '-28px',
          fontSize: '13px',
          fontWeight: 600,
          color: isRecording ? '#EF4444' : isProcessing ? '#9CA3AF' : '#8B5CF6',
          whiteSpace: 'nowrap',
        }}
      >
        {isRecording ? '● Recording...' : isProcessing ? 'Analyzing...' : 'Tap to Speak'}
      </motion.p>
    </div>
  );
}
