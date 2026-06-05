// components/ReferralCard.jsx — referral code display + copy functionality
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Share2 } from 'lucide-react';

export default function ReferralCard({ referralCode, referredBy }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const el = document.createElement('textarea');
      el.value = referralCode;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: 'linear-gradient(135deg, rgba(214, 104, 83, 0.08), rgba(197, 168, 128, 0.05))',
        border: '1px solid var(--color-border)',
        borderRadius: '18px',
        padding: '22px',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <Share2 size={18} color="var(--color-saffron)" />
        <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-text-secondary)', letterSpacing: '0.08em' }}>
          YOUR REFERRAL CODE
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Code display */}
        <div style={{
          flex: 1,
          background: 'var(--color-bg-mid)',
          border: '1px solid var(--color-border)',
          borderRadius: '12px',
          padding: '12px 16px',
          fontFamily: 'monospace',
          fontSize: '18px',
          fontWeight: 800,
          color: 'var(--color-saffron)',
          letterSpacing: '0.06em',
          textAlign: 'center',
        }}>
          {referralCode}
        </div>

        {/* Copy button */}
        <motion.button
          onClick={handleCopy}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            padding: '12px 18px',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            background: copied
              ? 'linear-gradient(135deg, var(--color-emerald), var(--color-emerald))'
              : 'linear-gradient(135deg, var(--color-saffron), var(--color-saffron-light))',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '14px',
            fontWeight: 800,
            transition: 'background 0.3s',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(214, 104, 83, 0.15)',
          }}
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                <Check size={18} />
              </motion.span>
            ) : (
              <motion.span key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                <Copy size={18} />
              </motion.span>
            )}
          </AnimatePresence>
          {copied ? 'Copied!' : 'Copy'}
        </motion.button>
      </div>

      <p style={{ marginTop: '12px', fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.5', fontWeight: 600 }}>
        Share this code with friends. They get <span style={{ color: 'var(--color-saffron)', fontWeight: 800 }}>+20 XP</span> on joining,
        and you earn <span style={{ color: 'var(--color-saffron)', fontWeight: 800 }}>+50 XP</span> per referral!
      </p>

      {referredBy && (
        <div style={{
          marginTop: '12px',
          padding: '10px 14px',
          borderRadius: '10px',
          background: 'rgba(110, 142, 114, 0.08)',
          border: '1px solid rgba(110, 142, 114, 0.2)',
          fontSize: '13px',
          color: 'var(--color-emerald)',
          fontWeight: 700,
        }}>
          ✅ You joined via a referral and received a <strong>+20 XP</strong> bonus!
        </div>
      )}
    </motion.div>
  );
}
