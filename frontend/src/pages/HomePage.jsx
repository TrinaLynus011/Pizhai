// pages/HomePage.jsx
// Landing page with animated Tamil-inspired background and start flow
import { useState, useEffect } from 'react';
import { ChevronRight, Zap, Mic, Trophy } from 'lucide-react';

const FLOATING_LETTERS = ['ழ', 'ல', 'ள', 'ற', 'ர', 'ந', 'ன', 'ண', 'த', 'மி', 'க', 'ப', 'வ', 'ட'];

function FloatingLetter({ char, style }) {
  return (
    <span
      className="absolute font-tamil font-bold select-none pointer-events-none"
      style={{
        color: 'rgba(249,115,22,0.08)',
        fontSize: style.size,
        left: style.left,
        top: style.top,
        animation: `float ${style.duration}s ease-in-out ${style.delay}s infinite`,
      }}
    >
      {char}
    </span>
  );
}

const FEATURES = [
  { icon: <Mic size={20} />, title: 'AI Speech Recognition', desc: 'Powered by OpenAI Whisper' },
  { icon: <Zap size={20} />, title: 'Instant Feedback', desc: 'Phonetic error detection' },
  { icon: <Trophy size={20} />, title: 'Gamified Learning', desc: 'XP, levels, and leaderboards' },
];

export default function HomePage({ onStart, username, onUsernameChange }) {
  const [floaters] = useState(() =>
    FLOATING_LETTERS.map((char, i) => ({
      char,
      style: {
        size: `${Math.random() * 60 + 30}px`,
        left: `${Math.random() * 90}%`,
        top: `${Math.random() * 85}%`,
        duration: Math.random() * 4 + 3,
        delay: Math.random() * 3,
      },
    }))
  );

  const [nameInput, setNameInput] = useState(username || '');

  function handleStart() {
    const name = nameInput.trim() || 'Guest';
    onUsernameChange(name);
    onStart();
  }

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, #0a0618 0%, #130a2e 50%, #1a0540 100%)',
      }}
    >
      {/* Background decorative grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(249,115,22,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.04) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Radial glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: '700px',
          height: '700px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Floating Tamil letters */}
      {floaters.map((f, i) => (
        <FloatingLetter key={i} char={f.char} style={f.style} />
      ))}

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg w-full">
        {/* Badge */}
        <div
          className="animate-slide-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8"
          style={{
            background: 'rgba(249,115,22,0.15)',
            border: '1px solid rgba(249,115,22,0.3)',
            color: '#FB923C',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse inline-block" />
          AI-Powered Tamil Learning
        </div>

        {/* Title */}
        <h1
          className="animate-slide-up-1 font-black leading-none mb-2"
          style={{ fontSize: 'clamp(64px, 12vw, 96px)' }}
        >
          <span className="gradient-text">PIZHAI</span>
        </h1>

        <p
          className="animate-slide-up-1 font-tamil font-bold mb-4"
          style={{ fontSize: 'clamp(28px, 5vw, 40px)', color: 'rgba(248,244,255,0.45)' }}
        >
          பிழை
        </p>

        <p
          className="animate-slide-up-2 font-medium mb-10 leading-relaxed"
          style={{ color: 'rgba(248,244,255,0.6)', fontSize: '16px', maxWidth: '360px' }}
        >
          Master Tamil pronunciation with real-time AI feedback,
          phonetic analysis, and gamified challenges.
        </p>

        {/* Feature pills */}
        <div className="animate-slide-up-2 flex flex-wrap justify-center gap-3 mb-10">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(248,244,255,0.7)',
              }}
            >
              <span style={{ color: '#F97316' }}>{f.icon}</span>
              {f.title}
            </div>
          ))}
        </div>

        {/* Username input */}
        <div className="animate-slide-up-3 w-full max-w-xs mb-4">
          <input
            type="text"
            id="username-input"
            placeholder="Enter your name (optional)"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleStart()}
            maxLength={20}
            className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all"
            style={{
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'white',
              '::placeholder': { color: 'rgba(248,244,255,0.3)' },
            }}
          />
        </div>

        {/* Start button */}
        <button
          id="start-learning-btn"
          onClick={handleStart}
          className="animate-slide-up-3 btn-glow flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg text-white transition-all duration-300"
          style={{
            background: 'linear-gradient(135deg, #F97316 0%, #EF4444 100%)',
            boxShadow: '0 4px 24px rgba(249,115,22,0.4)',
          }}
        >
          Start Learning
          <ChevronRight size={22} />
        </button>

        <p
          className="animate-slide-up-4 mt-5 text-xs"
          style={{ color: 'rgba(248,244,255,0.3)' }}
        >
          No signup required · Free to use · Works in browser
        </p>
      </div>

      {/* Bottom decorative wave */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: '120px', overflow: 'hidden' }}
      >
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
          <path
            d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,45 1440,60 L1440,120 L0,120 Z"
            fill="rgba(249,115,22,0.04)"
          />
        </svg>
      </div>
    </div>
  );
}
