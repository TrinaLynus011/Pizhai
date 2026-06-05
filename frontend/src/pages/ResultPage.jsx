// pages/ResultPage.jsx
// Score display with animated ring, stars, XP badge, mistake breakdown, TTS playback

import { useEffect, useState, useRef } from 'react';
import { RotateCcw, ChevronRight, BarChart2 } from 'lucide-react';
import StarRating from '../components/StarRating.jsx';
import MistakeCard from '../components/MistakeCard.jsx';
import AudioPlayer from '../components/AudioPlayer.jsx';
import LevelBadge from '../components/LevelBadge.jsx';
import Confetti from '../components/Confetti.jsx';

// Animated score counter
function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    setValue(0);
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(ease * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

function ScoreRing({ score }) {
  const displayScore = useCountUp(score);
  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(circumference - (score / 100) * circumference);
    }, 200);
    return () => clearTimeout(timer);
  }, [score, circumference]);

  const color =
    score === 100 ? '#FBBF24' : score >= 70 ? '#10B981' : score >= 40 ? '#F97316' : '#EF4444';

  return (
    <div className="relative flex items-center justify-center" style={{ width: '180px', height: '180px' }}>
      {/* Glow */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
          animation: 'float 3s ease-in-out infinite',
        }}
      />

      <svg width="180" height="180" viewBox="0 0 180 180">
        {/* Track */}
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="10"
        />
        {/* Progress */}
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="score-ring"
          style={{ filter: `drop-shadow(0 0 8px ${color}90)` }}
        />
      </svg>

      {/* Score number */}
      <div className="absolute flex flex-col items-center">
        <span className="font-black text-white animate-bounce-in" style={{ fontSize: '42px', lineHeight: 1 }}>
          {displayScore}
        </span>
        <span style={{ color: 'rgba(248,244,255,0.4)', fontSize: '13px', fontWeight: 500 }}>/100</span>
      </div>
    </div>
  );
}

function XPBadge({ xp, breakdown }) {
  return (
    <div
      className="animate-bounce-in glass flex flex-col items-center px-5 py-3 rounded-2xl"
      style={{
        background: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(249,115,22,0.1))',
        border: '1px solid rgba(251,191,36,0.25)',
        animationDelay: '0.5s',
      }}
    >
      <span className="font-black text-2xl" style={{ color: '#FBBF24' }}>
        +{xp} XP
      </span>
      {breakdown?.map((b, i) => (
        <span key={i} style={{ color: 'rgba(248,244,255,0.5)', fontSize: '11px' }}>
          {b.reason}: +{b.xp}
        </span>
      ))}
    </div>
  );
}

export default function ResultPage({ result, currentWord, onTryAgain, onNext, onDashboard }) {
  const { score, stars, mistakes, xp_earned, xp_breakdown, feedback, user, ttsAudioUrl } = result;
  const isPerfect = score === 100;
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isPerfect) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isPerfect]);

  const scoreLabel =
    score === 100 ? 'Perfect!' : score >= 70 ? 'Well Done!' : score >= 40 ? 'Keep Trying!' : 'Needs Practice';

  const scoreLabelColor =
    score === 100 ? '#FBBF24' : score >= 70 ? '#10B981' : score >= 40 ? '#F97316' : '#EF4444';

  return (
    <>
      <Confetti active={showConfetti} />

      <div
        className="min-h-screen overflow-y-auto"
        style={{
          background: 'linear-gradient(145deg, #0a0618 0%, #130a2e 60%, #0f0a24 100%)',
        }}
      >
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 sticky top-0 z-10"
          style={{ background: 'rgba(10,6,24,0.8)', backdropFilter: 'blur(12px)' }}>
          <span className="gradient-text font-black text-xl">PIZHAI</span>
          <div className="flex items-center gap-3">
            <LevelBadge level={user?.level || 'Beginner'} size="sm" />
            <div className="text-sm font-semibold" style={{ color: '#FBBF24' }}>
              ⚡ {user?.total_xp || 0} XP
            </div>
            <button
              id="result-dashboard-btn"
              onClick={onDashboard}
              className="p-2 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(248,244,255,0.6)' }}
            >
              <BarChart2 size={18} />
            </button>
          </div>
        </header>

        <main className="flex flex-col items-center px-4 py-8 gap-6 max-w-lg mx-auto">

          {/* Score ring + label */}
          <div className="flex flex-col items-center gap-3 animate-fade-in">
            <ScoreRing score={score} />
            <h2 className="text-2xl font-black" style={{ color: scoreLabelColor }}>
              {scoreLabel}
            </h2>
          </div>

          {/* Star rating */}
          <div className="animate-fade-in">
            <StarRating stars={stars} size={44} />
          </div>

          {/* Feedback message */}
          <div
            className="glass w-full text-center px-5 py-3 rounded-xl animate-slide-up"
            style={{ fontSize: '15px', color: 'rgba(248,244,255,0.8)', lineHeight: '1.5' }}
          >
            {feedback}
          </div>

          {/* XP badge */}
          <XPBadge xp={xp_earned} breakdown={xp_breakdown} />

          {/* Word comparison */}
          <div className="glass w-full p-4 rounded-xl animate-slide-up-1">
            <p style={{ color: 'rgba(248,244,255,0.4)', fontSize: '11px', marginBottom: '10px', letterSpacing: '0.08em' }}>
              PRONUNCIATION COMPARISON
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex flex-col items-center">
                <span style={{ color: 'rgba(248,244,255,0.35)', fontSize: '11px', marginBottom: '4px' }}>Expected</span>
                <span className="font-tamil font-bold text-3xl" style={{ color: '#10B981' }}>{currentWord}</span>
              </div>
              <span style={{ color: 'rgba(248,244,255,0.2)', fontSize: '20px' }}>→</span>
              <div className="flex flex-col items-center">
                <span style={{ color: 'rgba(248,244,255,0.35)', fontSize: '11px', marginBottom: '4px' }}>You said</span>
                <span className="font-tamil font-bold text-3xl" style={{ color: result.userText ? '#60A5FA' : 'rgba(248,244,255,0.2)' }}>
                  {result.userText || '—'}
                </span>
              </div>
            </div>
          </div>

          {/* TTS playback */}
          {ttsAudioUrl && (
            <div className="animate-slide-up-1">
              <AudioPlayer audioUrl={ttsAudioUrl} label="🔊 Hear correct pronunciation" />
            </div>
          )}

          {/* Mistake breakdown */}
          {mistakes && mistakes.length > 0 && (
            <div className="w-full space-y-3 animate-slide-up-2">
              <h3 className="font-bold text-sm" style={{ color: 'rgba(248,244,255,0.5)', letterSpacing: '0.08em' }}>
                PRONUNCIATION ANALYSIS
              </h3>
              {mistakes.map((m, i) => (
                <MistakeCard key={i} mistake={m} index={i} />
              ))}
            </div>
          )}

          {mistakes && mistakes.length === 0 && score === 100 && (
            <div
              className="glass w-full text-center py-5 rounded-xl animate-slide-up"
              style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}
            >
              <p className="text-2xl mb-1">🎉</p>
              <p className="font-bold" style={{ color: '#6EE7B7' }}>Flawless pronunciation!</p>
              <p style={{ color: 'rgba(248,244,255,0.5)', fontSize: '13px' }}>No mistakes detected</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 w-full animate-slide-up-3">
            <button
              id="try-again-btn"
              onClick={onTryAgain}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold transition-all btn-glow"
              style={{
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'white',
              }}
            >
              <RotateCcw size={16} />
              Try Again
            </button>
            <button
              id="next-word-btn"
              onClick={onNext}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold transition-all btn-glow"
              style={{
                background: 'linear-gradient(135deg, #F97316, #EF4444)',
                boxShadow: '0 4px 16px rgba(249,115,22,0.3)',
                color: 'white',
              }}
            >
              Next Word
              <ChevronRight size={16} />
            </button>
          </div>

          <div style={{ height: '24px' }} />
        </main>
      </div>
    </>
  );
}
