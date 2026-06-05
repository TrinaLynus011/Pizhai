// pages/PracticePage.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SkipForward, RotateCcw, ChevronRight, Info, 
  Volume2, WifiOff, RefreshCw, Sparkles, Award
} from 'lucide-react';
import { useUser } from '../context/UserContext.jsx';
import LeftSidebar from '../components/LeftSidebar.jsx';
import RightIntelligenceFeed from '../components/RightIntelligenceFeed.jsx';
import MicButton from '../components/MicButton.jsx';
import StarRating from '../components/StarRating.jsx';
import FloatingXP from '../components/FloatingXP.jsx';
import Confetti from '../components/Confetti.jsx';
import PageWrapper from '../components/PageWrapper.jsx';
import { speechToText, analyzePronunciation, generateTTS, getTestWords, checkHealth } from '../services/api.js';

// Local Dictionary for Difficult Words
const DICTIONARY = {
  'தமிழ்': {
    meaning: 'Tamil Language - The oldest surviving classical language in the world.',
    transliteration: 'Thamil',
    example: 'தமிழ் எனது தாய்மொழி (Tamil is my mother tongue).'
  },
  'வாழை': {
    meaning: 'Banana tree / plant, highly valued in Tamil culture.',
    transliteration: 'Vaazhai',
    example: 'தோட்டத்தில் வாழை மரம் உள்ளது (There is a banana tree in the garden).'
  },
  'கழுகு': {
    meaning: 'Eagle, representing sharp vision and strength.',
    transliteration: 'Kazhugu',
    example: 'கழுகு வானத்தில் உயரமாகப் பறக்கிறது (The eagle flies high in the sky).'
  },
  'பழம்': {
    meaning: 'Fruit, rich in sweetness and nutrition.',
    transliteration: 'Pazham',
    example: 'நான் தினமும் ஒரு பழம் சாப்பிடுவேன் (I eat a fruit every day).'
  },
  'பள்ளி': {
    meaning: 'School, a temple of education and learning.',
    transliteration: 'Palli',
    example: 'நான் பள்ளிக்குச் செல்கிறேன் (I am going to school).'
  },
  'வணக்கம்': {
    meaning: 'Greetings / Hello, a traditional Tamil gesture of respect.',
    transliteration: 'Vanakkam',
    example: 'பெரியவர்களைக் கண்டால் வணக்கம் கூற வேண்டும் (We should greet elders with respect).'
  },
  'அम्मा': {
    meaning: 'Mother, symbolizing love and care.',
    transliteration: 'Amma',
    example: 'அம்மா எனக்கு உணவு ஊட்டினார் (Mother fed me food).'
  },
  'அப்பா': {
    meaning: 'Father, representing guidance and support.',
    transliteration: 'Appa',
    example: 'என் அப்பா எனக்குப் பாடம் கற்றுக்கொடுத்தார் (My father taught me lessons).'
  },
  'நன்றி': {
    meaning: 'Thank you, expressing gratitude.',
    transliteration: 'Nandri',
    example: 'உதவி செய்தவருக்கு நன்றி கூறினேன் (I thanked the person who helped).'
  },
  'வாழைப்பழம்': {
    meaning: 'Banana fruit, a nutritious and common tropical fruit.',
    transliteration: 'Vaazhaippazham',
    example: 'வாழைப்பழம் உடலுக்கு நல்லது (Banana is good for health).'
  },
  'குழந்தை': {
    meaning: 'Child / Infant, representing innocence and joy.',
    transliteration: 'Kuzhanthai',
    example: 'குழந்தை சிரித்தது (The child laughed).'
  },
  'விழா': {
    meaning: 'Festival / Celebration, a gathering of joy and culture.',
    transliteration: 'Vizha',
    example: 'ஊரில் பொங்கல் விழா கொண்டாடப்பட்டது (Pongal festival was celebrated in the village).'
  },
  'ஊஞ்சல்': {
    meaning: 'Swing, a popular traditional play item.',
    transliteration: 'Oonchal',
    example: 'குழந்தைகள் ஊஞ்சலில் விளையாடினார்கள் (Children played on the swing).'
  }
};

const getWordDetails = (word) => {
  const cleanWord = word.trim().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"");
  if (DICTIONARY[cleanWord]) {
    return DICTIONARY[cleanWord];
  }
  return {
    meaning: `Tamil word: "${cleanWord}". Found in reading materials.`,
    transliteration: cleanWord,
    example: `நன்றாக வாசித்துப் பழகவும் (Practice reading carefully).`
  };
};

// ─── Score Ring ────────────────────────────────────────────────────────────
function ScoreRing({ score }) {
  const R = 72;
  const C = 2 * Math.PI * R;
  const color = 'var(--color-terracotta)';

  const [count, setCount] = useState(0);
  useEffect(() => {
    let frame;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / 1200, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setCount(Math.round(ease * score));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  return (
    <div style={{ position: 'relative', width: 150, height: 150 }}>
      <motion.div animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 4, repeat: Infinity }}
        style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: `radial-gradient(circle, ${color}10 0%, transparent 70%)` }} />
      <svg width={150} height={150}>
        <circle cx={75} cy={75} r={60} fill="none" stroke="var(--color-border)" strokeWidth={6} />
        <motion.circle cx={75} cy={75} r={60} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round"
          strokeDasharray={2 * Math.PI * 60} initial={{ strokeDashoffset: 2 * Math.PI * 60 }}
          animate={{ strokeDashoffset: (2 * Math.PI * 60) - (score / 100) * (2 * Math.PI * 60) }}
          transition={{ duration: 1.4, ease: 'easeOut', delay: 0.1 }}
          transform="rotate(-90 75 75)" />
      </svg>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }} className="font-tamil">
        <span className="text-3xl font-black text-text-primary block leading-none">{count}</span>
        <span className="block text-[8px] text-text-muted font-bold tracking-wider mt-1 uppercase">SCORE / மதிப்பெண்</span>
      </div>
    </div>
  );
}

// ─── Single Elegant Score Progression Curve ───────────────────────────────
function ScoreProgressionCurve({ history }) {
  if (!history || history.length === 0) return null;
  const scores = history.map(h => h.score || h.accuracy || 0).slice(-8);

  const width = 360;
  const height = 90;
  const padding = 15;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const xStep = scores.length > 1 ? chartWidth / (scores.length - 1) : chartWidth;
  const points = scores.map((val, idx) => {
    const x = padding + idx * xStep;
    const y = padding + chartHeight - (val / 100) * chartHeight;
    return { x, y, value: val };
  });

  let pathD = '';
  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      pathD += ` L ${points[i].x} ${points[i].y}`;
    }
  }

  let areaD = '';
  if (points.length > 0) {
    areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;
  }

  return (
    <div className="glass p-4 rounded-xl border border-border bg-bg-card w-full flex flex-col gap-3 font-tamil">
      <div className="flex justify-between items-center text-[10px] font-bold text-text-muted tracking-wider uppercase">
        <span>முன்னேற்ற வரைபடம் (Score Progression Curve)</span>
        <span className="text-olive font-black">Score Trend</span>
      </div>
      <div className="overflow-visible flex items-center justify-center">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-h-[85px] overflow-visible">
          <defs>
            <linearGradient id="curveAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-terracotta)" stopOpacity="0.12" />
              <stop offset="100%" stopColor="var(--color-terracotta)" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path d={areaD} fill="url(#curveAreaGrad)" />
          <path d={pathD} fill="none" stroke="var(--color-terracotta)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((pt, idx) => (
            <circle key={idx} cx={pt.x} cy={pt.y} r="3.5" fill="var(--color-bg-card)" stroke="var(--color-terracotta)" strokeWidth="1.8" />
          ))}
        </svg>
      </div>
    </div>
  );
}

// ─── Result View (inline) ──────────────────────────────────────────────────
function ResultView({ result, currentWord, onTryAgain, onNext, onWordClick }) {
  const { user } = useUser();
  const [showXP, setShowXP] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setShowXP(true), 600);
    if (result.ttsAudioUrl) setAudioUrl(result.ttsAudioUrl);
    return () => clearTimeout(t);
  }, [result]);

  const history = user?.attempts_history || [];

  const cardVariants = {
    initial: { opacity: 0, y: 15 },
    animate: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.15, ease: [0.22, 1, 0.36, 1], duration: 0.4 } }),
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
      className="w-full max-w-xl flex flex-col items-center gap-6 font-tamil">

      <Confetti active={result.score === 100} />

      {/* Card 1: Elegant Celebration Banner */}
      <motion.div custom={0} variants={cardVariants} initial="initial" animate="animate"
        className="glass w-full p-6 md:p-8 rounded-xl border border-border bg-bg-card flex flex-col items-center gap-4 relative overflow-hidden text-center"
      >
        <div className="absolute right-0 top-0 w-32 h-32 rounded-full bg-olive/5 blur-2xl pointer-events-none" />
        <span className="text-[28px] font-black text-text-primary font-tamil">🎉 சிறந்த முன்னேற்றம்</span>
        <span className="text-xs font-bold text-text-secondary tracking-widest uppercase font-sans">Great Progress</span>
        
        {/* XP gain floating up */}
        <div className="flex items-center gap-2 mt-2 relative">
          <span className="text-3xl font-black text-olive font-sans">+{result.xp_earned} XP</span>
          <span className="text-[10px] font-bold text-text-muted font-sans uppercase tracking-wider">Awarded</span>
          <FloatingXP xp={result.xp_earned} trigger={showXP} />
        </div>
        
        <div className="flex flex-wrap gap-2.5 justify-center text-xs font-bold text-text-secondary mt-2">
          <span className="px-3 py-1.5 rounded-lg bg-olive/10 text-olive border border-olive/15 font-tamil">
            ✓ Fluency Improved / வாசிப்பு ஓட்டம் சீரானது
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-terracotta/10 text-terracotta border border-terracotta/15 font-tamil">
            🔥 தொடர்ச்சி: {user?.streak || 1} நாட்கள் (Streak)
          </span>
        </div>
      </motion.div>

      {/* Card 2: Stats Summary + ScoreRing */}
      <motion.div custom={1} variants={cardVariants} initial="initial" animate="animate"
        className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full items-center"
      >
        {/* Score Ring Card */}
        <div className="glass p-5 rounded-xl border border-border bg-bg-card flex flex-col items-center justify-center min-h-[200px]">
          <ScoreRing score={result.score} />
          <StarRating stars={result.stars} size={28} className="mt-3" />
        </div>
        
        {/* Stats List */}
        <div className="flex flex-col gap-3 w-full h-full justify-between">
          <div className="glass p-4 rounded-xl border border-border bg-bg-card flex justify-between items-center flex-1 hover-lift">
            <span className="text-xs font-bold text-text-secondary">துல்லியம் (Accuracy)</span>
            <span className="text-lg font-black text-olive">{result.accuracy}%</span>
          </div>
          <div className="glass p-4 rounded-xl border border-border bg-bg-card flex justify-between items-center flex-1 hover-lift">
            <span className="text-xs font-bold text-text-secondary">வாசிப்பு ஓட்டம் (Fluency)</span>
            <span className="text-lg font-black text-terracotta">{result.fluency}%</span>
          </div>
          <div className="glass p-4 rounded-xl border border-border bg-bg-card flex justify-between items-center flex-1 hover-lift">
            <span className="text-xs font-bold text-text-secondary">வேகம் (Speed)</span>
            <span className="text-sm font-black text-text-primary">{result.wpm} சொற்கள்/நிமி</span>
          </div>
        </div>
      </motion.div>

      {/* Visual Speech Analysis (Word Highlights) */}
      {result.alignment && result.alignment.length > 0 && (
        <motion.div custom={2} variants={cardVariants} initial="initial" animate="animate"
          className="glass w-full p-5 rounded-xl border border-border bg-bg-card space-y-4">
          <span className="text-[10px] font-bold text-text-muted tracking-wider uppercase mb-1 block">உச்சரிப்பு பகுப்பாய்வு (Phonetic Analysis)</span>
          <div className="flex flex-wrap gap-x-2 gap-y-3 font-tamil font-bold text-lg leading-relaxed">
            {result.alignment.map((item, idx) => {
              const type = item.type;
              const exp = item.expected;
              const usr = item.user;

              if (type === 'ins') {
                return (
                  <span 
                    key={idx} 
                    className="inline-block px-1.5 py-0.5 rounded border border-dashed border-rose/30 bg-rose/5 text-rose text-base font-semibold"
                    title={`கூடுதல் சொல்: "${usr}"`}
                  >
                    +{usr}
                  </span>
                );
              }

              if (type === 'del') {
                return (
                  <span 
                    key={idx} 
                    className="inline-block px-1.5 py-0.5 rounded bg-bg-mid/40 border border-border text-text-muted line-through text-base font-normal cursor-pointer hover:text-terracotta transition-colors"
                    onClick={() => onWordClick(exp)}
                    title={`தவிர்க்கப்பட்ட சொல்: "${exp}". சொடுக்கி பயிற்சி செய்யவும்.`}
                  >
                    {exp}
                  </span>
                );
              }

              if (type === 'confusion' || type === 'mismatch') {
                return (
                  <span 
                    key={idx} 
                    className="inline-block px-1.5 py-0.5 rounded border border-terracotta/30 bg-gold/5 text-terracotta text-base underline decoration-wavy decoration-terracotta font-bold cursor-pointer hover:bg-gold/10 transition-all"
                    onClick={() => onWordClick(exp)}
                    title={`எதிர்பார்த்தது: "${exp}" | கேட்டது: "${usr}". சொடுக்கி பயிற்சி செய்யவும்.`}
                  >
                    {exp}
                  </span>
                );
              }

              return (
                <span 
                  key={idx} 
                  className="inline-block px-1 text-olive text-base font-bold cursor-pointer hover:underline"
                  onClick={() => onWordClick(exp)}
                >
                  {exp}
                </span>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Single Progression Chart */}
      {history.length > 1 && (
        <motion.div custom={3} variants={cardVariants} initial="initial" animate="animate" className="w-full">
          <ScoreProgressionCurve history={history} />
        </motion.div>
      )}

      {/* AI Coach Feedback Card */}
      <motion.div custom={4} variants={cardVariants} initial="initial" animate="animate"
        className="glass w-full p-5 rounded-xl border border-border bg-bg-card flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase text-terracotta tracking-wider">
          <Sparkles size={14} />
          <span>AI வாசிப்பு வழிகாட்டி (AI Reading Coach)</span>
        </div>
        <p className="text-sm text-text-secondary leading-relaxed font-semibold">
          {result.feedback}
        </p>
      </motion.div>

      {/* Strengths & Improvements */}
      <motion.div custom={5} variants={cardVariants} initial="initial" animate="animate"
        className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {/* Strengths */}
        {result.strengths?.length > 0 && (
          <div className="glass p-5 rounded-xl border border-border bg-bg-card flex flex-col gap-3">
            <span className="text-[10px] font-bold text-olive tracking-wider uppercase mb-1">✅ வலுவான பகுதிகள் (Strengths)</span>
            <div className="space-y-2.5">
              {result.strengths.map((str, idx) => (
                <div key={idx} className="flex gap-2 items-start text-xs text-text-secondary font-semibold">
                  <span className="text-olive text-sm">✔</span>
                  <span>{str}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Improvements */}
        {result.weaknesses?.length > 0 && (
          <div className="glass p-5 rounded-xl border border-border bg-bg-card flex flex-col gap-3">
            <span className="text-[10px] font-bold text-gold tracking-wider uppercase mb-1">⚠️ மேம்படுத்த வேண்டியவை (Improvements)</span>
            <div className="space-y-2.5">
              {result.weaknesses.map((weak, idx) => (
                <div key={idx} className="flex gap-2 items-start text-xs text-text-secondary font-semibold">
                  <span className="text-gold text-sm">✖</span>
                  <span>{weak}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Phonetic Grapheme Mistakes analysis */}
      {result.mistakes?.length > 0 && result.mistakes[0].type !== 'no_speech' && (
        <motion.div custom={6} variants={cardVariants} initial="initial" animate="animate" className="w-full">
          <span className="text-[10px] font-bold text-text-muted tracking-wider uppercase mb-2 block">ஒலி உச்சரிப்பு பகுப்பாய்வு (Phonetic Breakdown)</span>
          {result.mistakes.map((m, i) => (
            <div 
              key={i} 
              onClick={() => onWordClick(m.expected)}
              className={`glass p-4 rounded-xl border mb-2 border-border cursor-pointer hover:border-terracotta/30 hover-lift transition-all active-btn ${
                m.type === 'phonetic_confusion' ? 'mistake-confusion' : m.type === 'deletion' ? 'mistake-deletion' : m.type === 'insertion' ? 'mistake-insertion' : 'mistake-mismatch'
              }`}
            >
              <div className="flex items-center gap-2 text-sm font-tamil">
                <span className="font-bold text-xl text-rose">{m.expected}</span>
                {m.got && (
                  <>
                    <span className="text-text-muted font-bold">→</span>
                    <span className="font-bold text-xl text-terracotta">{m.got}</span>
                  </>
                )}
                <span className="ml-auto text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-bg-mid border border-border">
                  {m.type === 'phonetic_confusion' ? 'உச்சரிப்பு பிழை' : m.type === 'deletion' ? 'தவிர்க்கப்பட்டது' : m.type === 'insertion' ? 'கூடுதல் ஒலி' : 'பொருந்தாத ஒலி'}
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-2 font-semibold">{m.explanation}</p>
              {m.tip && <p className="text-[11px] text-text-muted mt-1 italic font-medium">💡 {m.tip}</p>}
            </div>
          ))}
        </motion.div>
      )}

      {/* TTS Playback */}
      {audioUrl && (
        <motion.button custom={7} variants={cardVariants} initial="initial" animate="animate"
          whileHover={{ scale: 1.005 }} whileTap={{ scale: 0.995 }}
          onClick={() => new Audio(audioUrl).play().catch(() => {})}
          className="flex items-center gap-2 p-3 rounded-xl border border-border bg-bg-card hover:bg-bg-mid transition-all text-terracotta font-bold text-xs w-full justify-center cursor-pointer shadow-sm active-btn hover-btn">
          <Volume2 size={14} /> சரியான உச்சரிப்பைக் கேள் (Hear Correct Pronunciation)
        </motion.button>
      )}

      {/* Action buttons */}
      <motion.div custom={8} variants={cardVariants} initial="initial" animate="animate"
        className="flex gap-4 w-full pb-8">
        <button id="try-again-btn" onClick={onTryAgain} className="flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border border-border bg-bg-card text-text-primary text-sm font-bold cursor-pointer hover:bg-bg-mid transition-all active-btn hover-btn">
          <RotateCcw size={15} /> மீண்டும் முயற்சி செய் (Try Again)
        </button>
        <button id="next-word-btn" onClick={onNext} className="flex-1 flex items-center justify-center gap-2 p-4 border-none bg-terracotta text-[#FFFCF7] text-sm font-bold cursor-pointer hover:bg-terracotta-light transition-all active-btn hover-btn">
          அடுத்த பயிற்சி (Next Exercise) <ChevronRight size={15} />
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── Continuous Web Speech Recognition Hook ───────────────────────────────
function useSpeechRecognition(onResult, onInterimResult) {
  const ref = useRef(null);

  const start = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return false;
    const r = new SR();
    r.lang = 'ta-IN';
    r.continuous = true;
    r.interimResults = true;

    r.onresult = (e) => {
      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = e.resultIndex; i < e.results.length; ++i) {
        if (e.results[i].isFinal) {
          finalTranscript += e.results[i][0].transcript;
        } else {
          interimTranscript += e.results[i][0].transcript;
        }
      }
      const full = (finalTranscript + ' ' + interimTranscript).trim();
      if (onInterimResult) onInterimResult(full);
    };

    r.onend = () => {
      // Completed recognition
    };

    r.onerror = (err) => {
      console.error("Speech Recognition error", err);
    };

    r.start();
    ref.current = r;
    return true;
  }, [onInterimResult]);

  const stop = useCallback(() => {
    if (ref.current) {
      ref.current.stop();
      ref.current = null;
    }
  }, []);

  return { start, stop };
}

// ─── Main PracticePage ─────────────────────────────────────────────────────
const FALLBACK_WORDS = ['தமிழ்','வாழை','கழுகு','பழம்','வணக்கம்','அம்மா','நன்றி','பூனை'];
const TRANSLITERATIONS = {
  'தமிழ்':'Tamil','வாழை':'Vaazhai','கழுகு':'Kazhugu','பழம்':'Pazham',
  'பள்ளி':'Palli','வணக்கம்':'Vanakkam','அம்மா':'Amma','அப்பா':'Appa',
  'நன்றி':'Nandri','பூனை':'Poonai','நாய்':'Naai','மீன்':'Meen',
  'மரம்':'Maram','வீடு':'Veedu','காடு':'Kaadu','ரயில்':'Rayil',
  'வாழைப்பழம்':'Vaazhaippazham','குழந்தை':'Kuzhanthai','விழா':'Vizha','ஊஞ்சல்':'Oonchal',
};

export default function PracticePage() {
  const { user, updateUser } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const [allWords, setAllWords] = useState(FALLBACK_WORDS);
  const [words, setWords] = useState(FALLBACK_WORDS);
  const [selectedTag, setSelectedTag] = useState(null);
  const [wordIndex, setWordIndex] = useState(0);
  const [micState, setMicState] = useState('idle');
  const [status, setStatus] = useState('');
  const [result, setResult] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [sttMode, setSttMode] = useState('unknown');

  // Focus Mode live transcript and details
  const [liveTranscript, setLiveTranscript] = useState('');
  const [processingStep, setProcessingStep] = useState(0);
  const [selectedDifficultWord, setSelectedDifficultWord] = useState(null);
  const [achievementToast, setAchievementToast] = useState(null);

  // Timer
  const [seconds, setSeconds] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const timerRef = useRef(null);

  // Offline Fallback Queue State
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState(() => {
    return JSON.parse(localStorage.getItem('pizhai_offline_attempts') || '[]');
  });

  const mediaRef  = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  const initialWord = location.state?.selectedWord || null;
  const currentWord = initialWord || words[wordIndex] || 'தமிழ்';
  const translit    = TRANSLITERATIONS[currentWord] || '';

  // Network Connectivity Triggers
  useEffect(() => {
    const handleOnline = () => { setIsOnline(true); syncOfflineQueue(); };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [offlineQueue]);

  // Sync Offline Queue
  const syncOfflineQueue = async () => {
    if (offlineQueue.length === 0 || !navigator.onLine) return;
    setStatus('உள்ளூர் வாசிப்புகள் ஒத்திசைக்கப்படுகின்றன...');
    let successCount = 0;
    
    for (const att of offlineQueue) {
      try {
        await analyzePronunciation(
          att.expected_text, att.user_text, user?.id || '', user?.name || 'Guest', user?.streak || 0, att.duration, false
        );
        successCount++;
      } catch (err) {
        console.error('Failed to sync offline record:', err);
      }
    }
    
    const remaining = offlineQueue.slice(successCount);
    setOfflineQueue(remaining);
    localStorage.setItem('pizhai_offline_attempts', JSON.stringify(remaining));
    setStatus(successCount > 0 ? `வெற்றிகரமாக ${successCount} வாசிப்புகள் ஒத்திசைக்கப்பட்டன!` : '');
    setTimeout(() => setStatus(''), 3000);
  };

  useEffect(() => {
    getTestWords().then(d => { 
      if (d.words?.length) {
        setAllWords(d.words);
        setWords(d.words);
      }
    }).catch(() => {});
    checkHealth().then(h => {
      if (h.stt_mode) setSttMode(h.stt_mode);
    }).catch(() => {
      setSttMode('frontend_fallback');
    });
  }, []);

  // Timer hook
  useEffect(() => {
    if (isReading) {
      timerRef.current = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isReading]);

  const handleSpeechResult = useCallback(async (userText) => {
    setMicState('processing');
    setIsReading(false);
    
    setProcessingStep(4); // 🔍 Analyzing Pronunciation
    setStatus('🔍 Analyzing Pronunciation / உச்சரிப்பு பகுப்பாய்வு செய்யப்படுகிறது');
    
    const durationVal = Math.max(1.0, seconds);

    // If offline, store attempt in offline queue and trigger browser simulation
    if (!navigator.onLine) {
      const offlineItem = {
        expected_text: currentWord,
        user_text: userText,
        duration: durationVal
      };
      const updatedQueue = [...offlineQueue, offlineItem];
      setOfflineQueue(updatedQueue);
      localStorage.setItem('pizhai_offline_attempts', JSON.stringify(updatedQueue));

      const localResult = {
        score: userText === currentWord ? 100 : 70,
        accuracy: userText === currentWord ? 100 : 80,
        fluency: 75,
        wpm: Math.round((userText.split(' ').length / durationVal) * 60),
        duration: durationVal,
        xp_earned: 25,
        stars: 2,
        mistakes: [],
        strengths: ["இணையம் இல்லாமல் உள்ளூர் முறையில் முடிக்கப்பட்டது."],
        weaknesses: ["இணைய இணைப்பு இல்லை: உள்ளூர் மதிப்பீடு கணக்கிடப்பட்டது."],
        feedback: "⚠️ நீங்கள் தற்போது ஆஃப்லைனில் உள்ளீர்கள். உங்கள் வாசிப்பு தற்காலிகமாக சேமிக்கப்பட்டது, இணையம் கிடைத்ததும் அது ஒத்திசைக்கப்படும்!",
        userText: userText
      };
      setResult(localResult);
      setMicState('idle');
      setStatus('');
      setProcessingStep(0);
      return;
    }

    try {
      const isDocumentMode = location.state?.isDocument || false;
      const analysis = await analyzePronunciation(
        currentWord, userText, user?.id || '', user?.name || 'Guest', user?.streak || 0, durationVal, isDocumentMode
      );
      
      setProcessingStep(5); // 📊 Building Report
      setStatus('📊 Generating Report / அறிக்கை தயாரிக்கப்படுகிறது');

      let ttsUrl = null;
      try {
        const tts = await generateTTS(currentWord);
        ttsUrl = tts.full_url;
      } catch {}

      if (analysis.user && user) {
        const newAttempt = {
          timestamp: new Date().toISOString().split('T')[0],
          expected_text: currentWord,
          user_text: userText,
          score: analysis.score,
          accuracy: analysis.accuracy,
          fluency: analysis.fluency,
          wpm: analysis.wpm,
          duration: durationVal,
          xp_earned: analysis.xp_earned,
          words_count: userText.split(' ').length,
          is_document: location.state?.isDocument || false
        };

        const updatedHistory = [...(user.attempts_history || []), newAttempt];

        updateUser({
          xp: analysis.user.total_xp,
          level: analysis.user.level,
          streak: analysis.user.streak,
          totalAttempts: analysis.user.totalAttempts,
          averageAccuracy: analysis.user.averageAccuracy,
          averageFluency: analysis.user.averageFluency,
          averageWpm: analysis.user.averageWpm,
          wordsPracticed: analysis.user.wordsPracticed,
          documentsRead: analysis.user.documentsRead,
          attempts_history: updatedHistory
        });
      }

      setProcessingStep(6); // ✅ Ready
      setStatus('✅ Report Ready / அறிக்கை தயாராக உள்ளது');
      
      await new Promise(r => setTimeout(r, 450));
      setResult({ ...analysis, userText, ttsAudioUrl: ttsUrl });
      
      // Trigger achievements toast if score is high
      if (analysis.accuracy >= 90) {
        setAchievementToast({
          title: '🏆 உச்சரிப்பு வீரர் (Pronunciation Champion)',
          desc: 'Completed Tamil reading with 90%+ Accuracy!'
        });
        setTimeout(() => setAchievementToast(null), 4000);
      }

      setMicState('idle');
      setStatus('');
      setProcessingStep(0);
    } catch (err) {
      setStatus('பகுப்பாய்வு தோல்வியடைந்தது. மீண்டும் முயலவும்.');
      setMicState('idle');
      setProcessingStep(0);
    }
  }, [currentWord, user, updateUser, seconds, offlineQueue, location.state]);

  const { start: startBrowserSTT, stop: stopBrowserSTT } = useSpeechRecognition(
    handleSpeechResult,
    (text) => setLiveTranscript(text)
  );

  const handleMicClick = useCallback(async () => {
    if (micState === 'recording') {
      if (mediaRef.current) {
        mediaRef.current.stop();
        stopBrowserSTT();
      } else {
        stopBrowserSTT();
      }
      return;
    }
    if (micState !== 'idle') return;

    setResult(null);
    setSeconds(0);
    setLiveTranscript('');
    setIsReading(true);

    if (sttMode === 'frontend_fallback' || !navigator.onLine) {
      setStatus('பேசலாம் (கேட்கிறது)...');
      setMicState('recording');
      mediaRef.current = null;
      if (!startBrowserSTT()) {
        setStatus('ஒலிவாங்கியை அணுக முடியவில்லை.');
        setMicState('idle');
        setIsReading(false);
      }
      return;
    }

    chunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg';
      
      // V4 requirement: 16kbps compressed audio bits per second
      const rec  = new MediaRecorder(stream, { mimeType: mime, audioBitsPerSecond: 16000 });
      mediaRef.current = rec;

      rec.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunksRef.current, { type: mime });
        setMicState('processing');
        
        setProcessingStep(1); // 🎙 Recording Complete
        setStatus('🎙 Recording Complete / ஒலிப்பதிவு முடிந்தது');
        
        try {
          await new Promise(r => setTimeout(r, 600));
          setProcessingStep(2); // 📤 Uploading Audio
          setStatus('📤 Uploading Audio / ஒலி பதிவேற்றப்படுகிறது');
          
          await new Promise(r => setTimeout(r, 600));
          setProcessingStep(3); // 🧠 Processing Tamil Speech
          setStatus('🧠 Processing Speech / பேச்சு பகுப்பாய்வு செய்யப்படுகிறது');

          const stt = await speechToText(blob);
          if (stt.use_frontend_fallback || !stt.text) {
            // fallback to browser-collected liveTranscript if backend fails/fallback requested
            if (liveTranscript.trim().length > 0) {
              await handleSpeechResult(liveTranscript);
            } else {
              setStatus('மீண்டும் பேசலாம் (கேட்கிறது)...');
              setMicState('recording');
              mediaRef.current = null;
              if (!startBrowserSTT()) { setStatus('ஒலிவாங்கி தடைபட்டுள்ளது.'); setMicState('idle'); }
            }
          } else {
            await handleSpeechResult(stt.text);
          }
        } catch {
          if (liveTranscript.trim().length > 0) {
            await handleSpeechResult(liveTranscript);
          } else {
            setStatus('மீண்டும் பேசலாம் (கேட்கிறது)...');
            setMicState('recording');
            mediaRef.current = null;
            if (!startBrowserSTT()) { setStatus('ஒலிவாங்கி தடைபட்டுள்ளது.'); setMicState('idle'); }
          }
        }
      };
      
      rec.start();
      startBrowserSTT();
      setMicState('recording');
      setStatus('பேசலாம்...');
    } catch {
      setStatus('ஒலிவாங்கியை அணுக முடியவில்லை.');
      setMicState('idle');
      setIsReading(false);
    }
  }, [micState, sttMode, startBrowserSTT, stopBrowserSTT, handleSpeechResult, liveTranscript]);

  const skip = useCallback(() => {
    setResult(null);
    setWordIndex((prev) => (prev + 1) % words.length);
    if (location.state) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [words.length, location, navigate]);

  const tryAgain = useCallback(() => {
    setResult(null);
  }, []);

  const nextWord = useCallback(() => {
    setResult(null);
    setWordIndex((prev) => (prev + 1) % words.length);
    if (location.state) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [words.length, location, navigate]);

  // Tag filter listener
  const handleTagFilter = (tag) => {
    const nextTag = tag === selectedTag ? null : tag;
    setSelectedTag(nextTag);
    
    let filtered = [];
    if (!nextTag) {
      filtered = allWords;
    } else if (nextTag === '#தமிழ்') {
      filtered = allWords.filter(w => w.includes('தமிழ்') || w.length < 5);
    } else if (nextTag === '#இலக்கியம்') {
      filtered = allWords.filter(w => w.includes('கல்வி') || w.includes('கரையில') || w.includes('யாதும்') || w.includes('முயற்சி'));
    } else if (nextTag === '#கல்வி') {
      filtered = allWords.filter(w => w.includes('பள்ளி') || w.includes('கல்வி'));
    } else if (nextTag === '#வரலாறு') {
      filtered = allWords.filter(w => w.includes('பழமையான') || w.includes('யாதும்'));
    } else if (nextTag === '#அறிவியல்') {
      filtered = allWords.filter(w => w.includes('அறிவியல்') || w.includes('AI') || w.length < 8);
    } else if (nextTag === '#தொழில்நுட்பம்') {
      filtered = allWords.filter(w => w.includes('தொழில்நுட்பம்') || w.includes('AI') || w.includes('பூங்கா'));
    } else {
      filtered = allWords;
    }
    
    setWords(filtered);
    setWordIndex(0);
    setResult(null);
  };

  const expectedWordsCount = currentWord.split(/\s+/).length;

  // Helper to resolve live alignment word-by-word status
  const getWordStatus = (word, index, spokenWords) => {
    if (!spokenWords || spokenWords.length === 0 || spokenWords[0] === '') return 'none';
    const clean = (w) => w.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g,"").toLowerCase();
    const cleanWord = clean(word);
    const cleanSpoken = spokenWords.map(w => clean(w));
    
    if (cleanSpoken.includes(cleanWord)) {
      return 'correct';
    }
    
    const lastSpoken = cleanSpoken[cleanSpoken.length - 1];
    if (lastSpoken && (cleanWord.startsWith(lastSpoken) || lastSpoken.startsWith(cleanWord)) && index <= cleanSpoken.length) {
      return 'uncertain';
    }
    return 'none';
  };

  // Render text word-by-word with live green/amber underlines
  const renderPassage = () => {
    if (!isReading) {
      return (
        <p
          className="font-tamil font-bold text-text-primary mb-6 text-center leading-relaxed"
          style={{ fontSize: '24px', lineHeight: '1.9', letterSpacing: '0.015em' }}
        >
          {currentWord}
        </p>
      );
    }

    const targetWords = currentWord.split(/\s+/);
    const spoken = liveTranscript.trim().toLowerCase().split(/\s+/);

    return (
      <p
        className="font-tamil font-bold text-text-primary mb-6 text-center flex flex-wrap justify-center gap-x-2 gap-y-3"
        style={{ fontSize: '24px', lineHeight: '1.9', letterSpacing: '0.015em' }}
      >
        {targetWords.map((word, idx) => {
          const status = getWordStatus(word, idx, spoken);
          let underlineClass = 'border-b-2 border-transparent';
          if (status === 'correct') {
            underlineClass = 'border-b-2 border-olive';
          } else if (status === 'uncertain') {
            underlineClass = 'border-b-2 border-gold';
          }
          return (
            <span key={idx} className={`${underlineClass} pb-0.5 transition-all duration-150`}>
              {word}
            </span>
          );
        })}
      </p>
    );
  };

  return (
    <PageWrapper>
      <div className="min-h-screen bg-bg-deep text-text-primary flex overflow-hidden">
        
        {/* Left Sidebar - collapses on Focus Mode */}
        <LeftSidebar forceCollapsed={isReading} />

        {/* Workspace */}
        <main className="flex-1 flex flex-col items-center justify-start p-5 md:p-7 overflow-y-auto h-screen relative">
          
          {/* Slide-in Achievements Toast */}
          <AnimatePresence>
            {achievementToast && (
              <motion.div 
                initial={{ opacity: 0, x: 100, y: -20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, x: 100 }}
                className="fixed top-6 right-6 glass p-4 rounded-xl border border-gold bg-bg-card shadow-lg z-50 flex items-center gap-3 max-w-sm font-tamil animate-slide-up"
              >
                <div className="w-9 h-9 rounded-lg bg-gold/15 flex items-center justify-center text-lg text-gold flex-shrink-0 animate-bounce">
                  🏆
                </div>
                <div>
                  <h4 className="font-bold text-xs text-text-primary">{achievementToast.title}</h4>
                  <p className="text-[10px] text-text-secondary mt-0.5 font-semibold">{achievementToast.desc}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Offline Sync Banner */}
          {(!isOnline || offlineQueue.length > 0) && (
            <div className={`w-full max-w-xl p-3 mb-4 rounded-xl border flex items-center justify-between gap-3 text-xs font-bold leading-normal font-tamil ${
              !isOnline 
                ? 'bg-rose/10 border-rose/20 text-rose' 
                : 'bg-terracotta/10 border-terracotta/20 text-terracotta'
            }`}>
              <div className="flex items-center gap-2">
                <WifiOff size={16} />
                <span>
                  {!isOnline 
                    ? 'ஆஃப்லைன் பயன்முறை. குரல் உரைமாற்றம் உள்ளூர் முறையில் நடைபெறுகிறது.' 
                    : `உங்களிடம் ஒத்திசைக்கப்படாத ${offlineQueue.length} வாசிப்புகள் உள்ளன.`
                  }
                </span>
              </div>
              {isOnline && (
                <button 
                  onClick={syncOfflineQueue} 
                  className="px-2.5 py-1 rounded bg-terracotta text-bg-deep flex items-center gap-1 cursor-pointer font-black active-btn"
                >
                  <RefreshCw size={10} /> ஒத்திசை
                </button>
              )}
            </div>
          )}

          {/* Interactive Word Card Modal */}
          {selectedDifficultWord && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-tamil">
              <div className="bg-bg-card border border-border rounded-xl p-6 max-w-sm w-full space-y-4 shadow-xl animate-slide-up relative">
                <button 
                  onClick={() => setSelectedDifficultWord(null)}
                  className="absolute top-4 right-4 text-text-muted hover:text-text-primary text-base cursor-pointer"
                >
                  ✕
                </button>
                
                <div className="text-center space-y-1">
                  <span className="text-[10px] font-black tracking-widest text-text-muted uppercase font-sans">DIFFICULT WORD / கடினமான சொல்</span>
                  <h3 className="text-3xl font-black text-terracotta">{selectedDifficultWord}</h3>
                  <p className="text-sm font-extrabold text-slate italic font-sans">{getWordDetails(selectedDifficultWord).transliteration}</p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-text-muted uppercase font-sans">Meaning / பொருள்</p>
                    <p className="text-xs text-text-secondary font-semibold leading-relaxed">
                      {getWordDetails(selectedDifficultWord).meaning}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-text-muted uppercase font-sans">Example / உதாரணம்</p>
                    <p className="text-xs text-text-secondary font-semibold leading-relaxed">
                      {getWordDetails(selectedDifficultWord).example}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-border/40">
                  <button
                    onClick={async () => {
                      try {
                        const tts = await generateTTS(selectedDifficultWord);
                        new Audio(tts.full_url).play().catch(() => {});
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="flex-1 py-2.5 rounded-lg border border-border hover:bg-bg-mid text-text-primary text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer hover-btn active-btn"
                  >
                    <Volume2 size={13} /> மீண்டும் கேள்
                  </button>
                  
                  <button
                    onClick={() => {
                      setWords([selectedDifficultWord]);
                      setWordIndex(0);
                      setResult(null);
                      setSelectedDifficultWord(null);
                    }}
                    className="flex-1 py-2.5 rounded-lg bg-terracotta text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer hover-btn active-btn"
                  >
                    வாசித்துப் பழகு
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Centered Column expands dynamically in Focus Mode */}
          <div 
            className="w-full flex flex-col items-center gap-6 transition-all duration-300"
            style={{ maxWidth: isReading ? '800px' : '640px' }}
          >
            <AnimatePresence mode="wait">
              {!result ? (
                <motion.div key="practice" initial={{ opacity:0, scale:0.96 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:1.03 }} transition={{ duration:0.3 }}
                   className="w-full flex flex-col items-center gap-6">

                  {/* Immersive Book Passage Column */}
                  <div className="w-full text-center px-4 py-8 select-none">
                    <p className="text-[10px] font-black text-text-muted tracking-widest uppercase mb-6 font-sans">
                      READ ALOUD THE TAMIL TEXT BELOW / கீழே உள்ள உரையை உரக்கப் படிக்கவும்
                    </p>
                    
                    {/* Rendered Tamil passage with live speech underlines */}
                    {renderPassage()}
                    
                    {translit && showHint && (
                      <p className="text-sm font-extrabold text-terracotta mb-4 font-sans tracking-wide">
                        {translit}
                      </p>
                    )}
                    
                    <button onClick={() => setShowHint(h => !h)}
                      className="text-xs text-text-muted hover:text-terracotta transition-colors bg-transparent border-none cursor-pointer flex items-center gap-1.5 mx-auto font-bold font-tamil mt-4 active-btn"
                    >
                      <Info size={13}/> {showHint ? 'உதவி ஒலியை மறை' : 'உதவி ஒலியைக் காட்டு'}
                    </button>
                  </div>

                  {/* Progressive processing stages indicator during analysis */}
                  {micState === 'processing' && (
                    <div className="w-full max-w-md glass p-5 rounded-xl border border-border bg-bg-card space-y-4 animate-slide-up font-tamil">
                      <h4 className="text-sm font-black text-text-secondary uppercase tracking-wider text-center font-sans">
                        Processing Speech / பகுப்பாய்வு செய்யப்படுகிறது
                      </h4>
                      
                      <div className="space-y-2.5">
                        {[
                          '🎙 Recording Complete / ஒலிப்பதிவு முடிந்தது',
                          '📤 Uploading Audio / ஒலி பதிவேற்றப்படுகிறது',
                          '🧠 Processing Tamil Speech / பேச்சு பகுப்பாய்வு செய்யப்படுகிறது',
                          '🔍 Analyzing Pronunciation / உச்சரிப்பு பகுப்பாய்வு செய்யப்படுகிறது',
                          '📊 Building Report / அறிக்கை தயாரிக்கப்படுகிறது',
                          '✅ Ready / அறிக்கை தயார்'
                        ].map((stepLabel, idx) => {
                          const stepNum = idx + 1;
                          const isDone = processingStep > stepNum;
                          const isActive = processingStep === stepNum;
                          return (
                            <div key={idx} className="flex items-center gap-3 text-xs">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] transition-all ${
                                isDone 
                                  ? 'bg-olive text-white' 
                                  : isActive 
                                  ? 'bg-terracotta text-white animate-pulse' 
                                  : 'bg-bg-mid text-text-muted'
                              }`}>
                                {isDone ? '✓' : stepNum}
                              </div>
                              <span className={`font-semibold ${
                                isDone ? 'text-text-muted line-through' : isActive ? 'text-terracotta font-bold' : 'text-text-muted'
                              }`}>
                                {stepLabel}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Reading Session Stats Display */}
                  <div className="flex gap-6 justify-center items-center text-[11px] font-bold text-text-muted font-tamil mt-1 select-none">
                    <span>⏱ {seconds} விநாடிகள் (Seconds)</span>
                    <span>•</span>
                    <span>✍ {expectedWordsCount} சொற்கள் (Words Count)</span>
                  </div>

                  {/* Mic Button */}
                  {micState !== 'processing' && (
                    <div className="my-2">
                      <MicButton state={micState} onClick={handleMicClick} />
                    </div>
                  )}

                  {status && micState !== 'processing' && (
                    <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }}
                      className="text-sm font-extrabold text-text-secondary text-center leading-normal font-tamil">
                      {status}
                    </motion.p>
                  )}

                  {/* Skip and Progress info */}
                  {micState !== 'processing' && (
                    <div className="flex items-center gap-4.5 font-tamil">
                      <button id="skip-btn" onClick={skip} disabled={micState !== 'idle'}
                        className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-border bg-bg-card hover:bg-bg-mid transition-all text-text-secondary disabled:opacity-40 disabled:cursor-not-allowed font-extrabold text-xs cursor-pointer active-btn"
                      >
                        <SkipForward size={14}/> தவிர் (Skip)
                      </button>
                      {!initialWord && (
                        <span className="text-xs font-black text-text-muted uppercase">
                          பகுதி {wordIndex+1} / {words.length}
                        </span>
                      )}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div key="result" initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:0.35 }}>
                  <ResultView 
                    result={result} 
                    currentWord={currentWord} 
                    onTryAgain={tryAgain} 
                    onNext={nextWord}
                    onWordClick={(word) => setSelectedDifficultWord(word)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* Right Intelligence Feed - hidden during reading */}
        {!isReading && <RightIntelligenceFeed selectedTag={selectedTag} onTagClick={handleTagFilter} />}

      </div>
    </PageWrapper>
  );
}
