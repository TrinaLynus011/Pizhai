// pages/DashboardPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Play, Clock, Upload, FileText, Trophy, Flame, CheckCircle, BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext.jsx';
import LeftSidebar from '../components/LeftSidebar.jsx';
import RightIntelligenceFeed from '../components/RightIntelligenceFeed.jsx';
import { getTestWords, getLeaderboard } from '../services/api.js';

const translateLevel = (lvl) => {
  const map = {
    'Beginner': 'ஆரம்ப நிலை',
    'Learner': 'கற்பவர்',
    'Fluent': 'திறமையாளர்',
    'Tamil Master': 'தமிழ் மாஸ்டர்'
  };
  return map[lvl] || lvl;
};

const translateDifficulty = (diff) => {
  const map = {
    'beginner': 'தொடக்க நிலை',
    'intermediate': 'இடைநிலை',
    'advanced': 'உயர்நிலை'
  };
  return map[diff] || diff;
};

// Custom Hook for count-up animation
function useCountUp(target, duration = 1000) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseInt(target, 10) || 0;
    if (end <= 0) {
      setValue(0);
      return;
    }
    const startTime = performance.now();
    let frameId;
    const update = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(ease * end));
      if (progress < 1) {
        frameId = requestAnimationFrame(update);
      } else {
        setValue(end);
      }
    };
    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, [target, duration]);
  return value;
}

// Elegant Empty State Component using SVG (Level 3 style)
function EmptyState({ title, desc, actionText, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-6 md:p-8 bg-bg-card/40 border border-dashed border-border rounded-xl space-y-4 hover:border-terracotta/20 transition-all hover-lift">
      <svg className="w-16 h-16 text-text-muted/40 animate-float" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
      <div className="space-y-1">
        <h4 className="font-tamil font-bold text-base text-text-primary">{title}</h4>
        <p className="text-xs text-text-secondary max-w-xs">{desc}</p>
      </div>
      {actionText && (
        <button 
          onClick={onAction}
          className="px-4 py-2 bg-terracotta hover:bg-terracotta-light text-white text-xs font-bold font-tamil rounded-lg transition-all hover-btn active-btn cursor-pointer shadow-sm"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

// Leaderboard Panel Sub-component (Level 2 Card styling)
function LeaderboardPanel() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    async function load() {
      try {
        const data = await getLeaderboard(5);
        setLeaderboard(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const username = user?.name || user?.username || 'Guest';

  return (
    <div className="glass p-5 rounded-xl border border-border bg-gradient-to-br from-[#FFFCF7] to-[#FDFBF7] shadow-sm space-y-4">
      <div className="border-b border-border/50 pb-2 flex items-center justify-between font-tamil">
        <span className="text-[10px] font-black text-text-secondary uppercase tracking-wider">முன்னணி சாதனையாளர்கள் (Leaderboard)</span>
        <span className="text-[9px] text-olive font-bold font-tamil">TOP 5</span>
      </div>

      <div className="space-y-3 font-tamil">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 bg-bg-deep/40 rounded-lg animate-pulse" />
          ))
        ) : leaderboard.length === 0 ? (
          <p className="text-xs text-text-muted text-center py-4">தரவு எதுவும் இல்லை (No data)</p>
        ) : (
          leaderboard.map((u, i) => {
            const isCurr = u.name === username;
            return (
              <div 
                key={u.id || i}
                className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition-all ${
                  isCurr ? 'bg-terracotta/5 border border-terracotta/15' : 'bg-bg-deep/20'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="font-extrabold w-4 text-center">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                  </span>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-[11px] text-white flex-shrink-0" style={{ backgroundColor: isCurr ? 'var(--color-terracotta)' : 'var(--color-slate)' }}>
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <span className={`font-bold truncate ${isCurr ? 'text-terracotta' : 'text-text-primary'}`}>{u.name}</span>
                </div>
                <div className="flex items-center gap-2.5 flex-shrink-0 font-semibold">
                  <span className="text-text-muted">🔥 {u.streak}</span>
                  <span className="font-black text-text-primary">{u.xp} XP</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState(null);

  // Document upload state
  const [file, setFile] = useState(null);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [paragraphs, setParagraphs] = useState([]);

  useEffect(() => {
    if (location.state?.filterTag) {
      setSelectedTag(location.state.filterTag);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location, navigate]);

  const username = user?.name || user?.username || 'Guest';
  const xp = user?.xp || 0;
  const streak = user?.streak || 0;
  const level = user?.level || 'Beginner';
  const attempts = user?.totalAttempts || 0;
  const accuracy = user?.averageAccuracy || 0;

  // Calculate Today's XP from attempts history
  const getTodayXP = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayAttempts = user?.attempts_history?.filter(att => att.timestamp === todayStr) || [];
    return todayAttempts.reduce((sum, att) => sum + (att.xp_earned || 0), 0);
  };

  const todayXP = getTodayXP();
  const dailyGoalXP = 50;
  const dailyGoalPct = Math.min(100, Math.round((todayXP / dailyGoalXP) * 100));

  // Load count-up animated values
  const animatedXp = useCountUp(xp);
  const animatedStreak = useCountUp(streak);
  const animatedAttempts = useCountUp(attempts);
  const animatedAccuracy = useCountUp(accuracy);
  const animatedTodayXP = useCountUp(todayXP);
  const animatedDailyGoalPct = useCountUp(dailyGoalPct);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    async function loadData() {
      try {
        const wordsData = await getTestWords();
        if (wordsData.details) {
          setExercises(wordsData.details);
        }
      } catch (e) {
        console.error('Failed to load dashboard data:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getGreetingTime = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return 'காலை வணக்கம்';
    if (hrs < 17) return 'மதிய வணக்கம்';
    return 'மாலை வணக்கம்';
  };

  function handleFileChange(e) {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadError('');
    }
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return;

    setLoadingUpload(true);
    setUploadError('');
    setParagraphs([]);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_BASE}/document/extract`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || `உபதிவேற்றம் தோல்வியடைந்தது: ${res.status}`);
      }

      const data = await res.json();
      const paras = data.text
        .split('\n\n')
        .map(p => p.trim())
        .filter(p => p.length > 5);
      
      setParagraphs(paras);
    } catch (err) {
      setUploadError(err.message || 'உரையை மீட்டெடுக்க முடியவில்லை. மீண்டும் முயலவும்.');
    } finally {
      setLoadingUpload(false);
    }
  }

  const filteredExercises = exercises.filter(ex => {
    if (!selectedTag) return true;
    if (selectedTag === '#தமிழ்') return true;
    if (selectedTag === '#இலக்கியம்') return ex.difficulty === 'advanced';
    if (selectedTag === '#கல்வி') return ex.difficulty === 'intermediate' || ex.word.includes('பள்ளி') || ex.word.includes('கல்வி');
    if (selectedTag === '#வரலாறு') return ex.word.includes('பழமையான') || ex.word.includes('யாதும்') || ex.difficulty === 'advanced';
    if (selectedTag === '#அறிவியல்') return ex.difficulty === 'intermediate' || ex.word.includes('அறிவியல்');
    if (selectedTag === '#தொழில்நுட்பம்') return ex.difficulty === 'beginner' || ex.word.includes('AI');
    return true;
  });

  const showEmptyState = attempts === 0;

  return (
    <div className="min-h-screen bg-bg-deep text-text-primary flex overflow-hidden">
      
      {/* Left Sidebar */}
      <LeftSidebar />

      {/* Main Reading Workspace */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto h-screen space-y-6 max-w-5xl mx-auto">
        
        {/* LEVEL 1 CARD: HERO SECTION (Exactly 30% Screen Height, Staggered Load, 3% Opacity Grid Overlay) */}
        <div className="h-[30vh] min-h-[220px] p-6 md:p-8 rounded-2xl relative overflow-hidden flex flex-col md:flex-row gap-6 items-center justify-between stagger-0 border-2 border-terracotta/40 bg-[#FDFBF7] shadow-md shadow-terracotta/5">
          {/* V5: Subtle manuscript-inspired pattern Overlay (exactly 3% opacity) */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(var(--color-terracotta) 1.5px, transparent 1.5px), linear-gradient(90deg, var(--color-terracotta) 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px',
            opacity: 0.03
          }} />
          
          <div className="flex flex-col md:flex-row gap-5 items-center w-full md:w-auto z-10">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl text-[#FFFCF7] bg-terracotta shadow-md flex-shrink-0">
              {username.charAt(0).toUpperCase()}
            </div>
            
            <div className="text-center md:text-left space-y-1">
              <p className="text-[10px] font-black tracking-widest text-text-muted uppercase">வணக்கம், {username}.</p>
              <h2 className="font-tamil font-bold text-2xl md:text-3xl text-text-primary leading-tight">
                {getGreetingTime()}!
              </h2>
              <p className="text-sm text-text-secondary font-bold font-tamil">
                பிழையின்றி தமிழ் பழகு — Read • Speak • Improve
              </p>
            </div>
          </div>

          {/* Level, Streak, XP progress and Daily Goal */}
          <div className="flex flex-col gap-3 w-full md:w-96 flex-shrink-0 justify-end z-10">
            <div className="flex items-center justify-between gap-4">
              <span className="px-3 py-1 rounded-lg bg-bg-mid border border-border text-[10px] text-text-primary font-black uppercase tracking-wider font-tamil">
                நிலை: {translateLevel(level)}
              </span>
              
              <div className="flex items-center gap-1.5 text-xs font-black text-olive bg-bg-mid/30 px-3 py-1.5 rounded-lg border border-border/60 shadow-sm font-tamil">
                <span>🔥</span>
                <span>{animatedStreak} நாட்கள் தொடர்ச்சி</span>
              </div>
            </div>

            {/* Daily Goal XP progress bar */}
            <div className="w-full space-y-1">
              <div className="flex justify-between text-xs font-bold text-text-muted">
                <span>இன்றைய இலக்கு (Daily Goal)</span>
                <span>{animatedTodayXP} / {dailyGoalXP} XP</span>
              </div>
              <div className="h-2.5 w-full bg-bg-mid rounded-full overflow-hidden shadow-inner border border-border/20">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${animatedDailyGoalPct}%` }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full bg-olive rounded-full"
                />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-text-muted">
                <span>மொத்தம் {animatedXp} XP</span>
                <span>{animatedDailyGoalPct}% நிறைவு</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. MIDDLE SECTION (2 Column Grid System, Staggered Load) */}
        <div className="grid grid-cols-12 gap-6 stagger-1">
          
          {/* LEFT SIDE (8 columns on desktop) */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            
            {/* LEVEL 2 CARDS: Stats Grid (2x2 cards, Staggered Load) */}
            <div className="grid grid-cols-2 gap-4 stagger-2">
              
              {/* Total XP Card */}
              <div className="glass p-4 rounded-xl border border-border bg-bg-card flex flex-col justify-between min-h-[105px] hover-lift active-btn cursor-pointer shadow-sm">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-black text-text-secondary uppercase tracking-wider font-tamil">மொத்தப் புள்ளிகள்</span>
                  <Trophy size={14} className="text-gold animate-float" />
                </div>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="font-sans font-black text-2xl text-text-primary">{animatedXp}</span>
                  <span className="text-xs text-terracotta font-black">Total XP</span>
                </div>
              </div>

              {/* Streak Card */}
              <div className="glass p-4 rounded-xl border border-border bg-bg-card flex flex-col justify-between min-h-[105px] hover-lift active-btn cursor-pointer shadow-sm">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-black text-text-secondary uppercase tracking-wider font-tamil">வாசிப்புத் தொடர்ச்சி</span>
                  <Flame size={14} className="text-olive" />
                </div>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="font-sans font-black text-2xl text-text-primary">{animatedStreak}</span>
                  <span className="text-xs text-olive font-bold font-tamil">நாட்கள்</span>
                </div>
              </div>

              {/* Total Attempts Card */}
              <div className="glass p-4 rounded-xl border border-border bg-bg-card flex flex-col justify-between min-h-[105px] hover-lift active-btn cursor-pointer shadow-sm">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-black text-text-secondary uppercase tracking-wider font-tamil">வாசிப்பு முயற்சிகள்</span>
                  <CheckCircle size={14} className="text-slate" />
                </div>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="font-sans font-black text-2xl text-text-primary">{animatedAttempts}</span>
                  <span className="text-[10px] text-text-muted font-extrabold font-tamil">பயிற்சிகள்</span>
                </div>
              </div>

              {/* Average Accuracy Card */}
              <div className="glass p-4 rounded-xl border border-border bg-bg-card flex flex-col justify-between min-h-[105px] hover-lift active-btn cursor-pointer shadow-sm">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-black text-text-secondary uppercase tracking-wider font-tamil">சராசரித் துல்லியம்</span>
                  <BarChart2 size={14} className="text-terracotta" />
                </div>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="font-sans font-black text-2xl text-text-primary">{animatedAccuracy}%</span>
                  <span className="text-xs text-gold font-bold">Accuracy</span>
                </div>
              </div>

            </div>

            {/* Tag Filter Indicator */}
            {selectedTag && (
              <div className="flex items-center justify-between bg-bg-mid/45 p-3 rounded-xl border border-border text-xs animate-slide-up">
                <span className="font-bold text-text-secondary font-tamil">
                  வடிகட்டப்பட்ட தலைப்பு: <span className="text-terracotta font-black ml-1">{selectedTag}</span>
                </span>
                <button 
                  onClick={() => setSelectedTag(null)} 
                  className="text-rose font-bold hover:underline cursor-pointer font-tamil"
                >
                  வடிகட்டியைக் கலைக்கவும் (Clear)
                </button>
              </div>
            )}

            {/* LEVEL 2 CARD: Curated Readings */}
            <div className="space-y-4 pt-2 stagger-3">
              <div className="flex justify-between items-center border-b border-border pb-2 font-tamil">
                <h3 className="font-bold text-xs tracking-wider uppercase text-text-secondary">
                  தேர்ந்தெடுக்கப்பட்ட வாசிப்புப் பகுதிகள் (Curated Readings)
                </h3>
                <span className="text-xs text-text-muted font-medium">பயிற்சியைத் தேர்வுசெய்க</span>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-28 rounded-xl border border-border bg-bg-card/40 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredExercises.slice(0, 4).map((ex, idx) => {
                    const wordsCount = ex.word.split(' ').length;
                    const readingTime = Math.max(1, Math.round(wordsCount * 0.45));
                    return (
                      <div 
                        key={idx}
                        className="glass p-4 rounded-xl border border-border bg-[#FFFCF7] flex flex-col justify-between gap-3 hover-lift transition-all group active-btn cursor-pointer shadow-sm"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-[9px] font-bold text-text-muted font-tamil">
                            <span className="px-1.5 py-0.5 rounded bg-bg-mid text-text-secondary uppercase tracking-wider text-[9px] border border-border/40 font-bold">
                              {translateDifficulty(ex.difficulty)}
                            </span>
                            <span>•</span>
                            <span>{readingTime} விநாடி (Secs)</span>
                          </div>
                          <h4 className="font-tamil font-bold text-base text-text-primary group-hover:text-terracotta transition-colors leading-snug line-clamp-2">
                            {ex.word}
                          </h4>
                          <p className="text-[11px] text-text-muted leading-relaxed font-sans italic truncate">
                            {ex.transliteration}
                          </p>
                        </div>
                        
                        <button
                          onClick={() => navigate('/practice', { state: { selectedWord: ex.word } })}
                          className="w-full py-2.5 rounded-lg border border-border hover:border-terracotta hover:bg-terracotta hover:text-white transition-all text-xs font-bold text-text-secondary flex items-center justify-center gap-1.5 cursor-pointer font-tamil hover-btn active-btn"
                        >
                          <Play size={10} fill="currentColor" className="text-text-muted group-hover:text-white transition-colors" />
                          வாசிக்கத் தொடங்கு
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* LEVEL 3 CARD: Document Upload section (Dashed/Subtle support card style) */}
            <div className="space-y-4 pt-2 stagger-4">
              <div className="flex justify-between items-center border-b border-border pb-2 font-tamil">
                <h3 className="font-bold text-xs tracking-wider uppercase text-text-secondary">
                  சொந்த ஆவணப் பயிற்சி (Upload Document)
                </h3>
                <span className="text-xs text-text-muted font-medium">பல்வேறு கோப்பு வடிவங்கள்</span>
              </div>

              <div className="p-5 rounded-xl border border-dashed border-border bg-bg-card/45 hover:bg-bg-card/65 transition-all">
                <div className="flex flex-col md:flex-row gap-5 items-center">
                  <div className="w-full md:w-1/2 space-y-3">
                    <h4 className="font-bold text-base text-text-primary leading-snug font-tamil">
                      ஒரு அழகான மேசை உங்களுக்காகக் காத்திருக்கிறது.
                    </h4>
                    <p className="text-xs text-text-secondary leading-relaxed font-tamil">
                      உங்கள் சொந்த PDF, Word அல்லது எளிய உரைக்கோப்பை பதிவேற்றவும். நாங்கள் அதிலிருந்து உரையைக் கண்டறிந்து உங்களுக்கான வாசிப்புப் பயிற்சியைத் தயார் செய்வோம்.
                    </p>
                    <div className="flex flex-wrap gap-2 text-[10px] text-text-muted font-bold pt-1 font-sans">
                      <span className="px-2.5 py-0.5 rounded bg-bg-mid border border-border/40">PDF</span>
                      <span className="px-2.5 py-0.5 rounded bg-bg-mid border border-border/40">DOCX</span>
                      <span className="px-2.5 py-0.5 rounded bg-bg-mid border border-border/40">TXT</span>
                    </div>
                  </div>

                  <div className="w-full md:w-1/2">
                    <form onSubmit={handleUpload} className="flex flex-col gap-3">
                      <div className="border border-dashed border-border hover:border-terracotta/40 rounded-xl p-4 text-center transition-all relative cursor-pointer bg-bg-deep/45 min-h-[100px] flex items-center justify-center">
                        <input 
                          type="file" 
                          accept=".txt,.pdf,.docx" 
                          onChange={handleFileChange}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center gap-2 text-center font-tamil">
                          <Upload size={20} className="text-text-muted hover:text-terracotta transition-colors" />
                          <span className="text-xs font-bold text-text-primary line-clamp-1">
                            {file ? file.name : 'இங்கே கோப்பைத் தேர்ந்தெடுக்கவும்'}
                          </span>
                          <span className="text-[9px] text-text-muted font-medium font-sans">
                            அதிகபட்சம் 10MB
                          </span>
                        </div>
                      </div>

                      {uploadError && (
                        <div className="p-2 rounded bg-rose/5 border border-rose/15 text-rose text-[11px] font-bold font-tamil">
                          ⚠️ {uploadError}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={loadingUpload || !file}
                        className="w-full py-2.5 rounded-lg font-tamil font-bold text-[#FFFCF7] bg-terracotta hover:bg-terracotta-light transition-all text-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover-btn active-btn"
                      >
                        {loadingUpload ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <FileText size={14} />
                            பகுதியைத் தயார் செய்
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>

                {/* Paragraph extraction display */}
                {paragraphs.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border space-y-3 font-tamil animate-slide-up">
                    <p className="text-[10px] font-bold uppercase text-text-muted tracking-wider">
                      கண்டறியப்பட்ட வாசிப்புப் பகுதிகள் ({paragraphs.length})
                    </p>
                    <div className="space-y-3">
                      {paragraphs.slice(0, 3).map((para, idx) => {
                        const count = para.split(' ').length;
                        return (
                          <div key={idx} className="p-4 rounded-xl bg-bg-deep/40 border border-border/60 flex justify-between items-center gap-4 hover:border-terracotta/20 transition-all hover-lift">
                            <div className="min-w-0 flex-1">
                              <p className="text-[10px] font-bold text-terracotta uppercase">பகுதி {idx+1} ({count} சொற்கள்)</p>
                              <p className="font-tamil font-bold text-xs text-text-secondary truncate mt-1">
                                {para}
                              </p>
                            </div>
                            <button
                              onClick={() => navigate('/practice', { state: { selectedWord: para, isDocument: true } })}
                              className="px-3 py-1.5 rounded-lg bg-terracotta text-[#FFFCF7] text-[11px] font-bold hover:bg-terracotta-light transition-all cursor-pointer whitespace-nowrap hover-btn active-btn"
                            >
                              வாசித்துப் பழகு
                            </button>
                          </div>
                        );
                      })}
                      {paragraphs.length > 3 && (
                        <button 
                          onClick={() => navigate('/document-practice')} 
                          className="text-xs text-terracotta hover:underline font-bold mt-1 inline-block"
                        >
                          அனைத்து {paragraphs.length} பத்திகளையும் காண் →
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT SIDE (4 columns on desktop) */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            
            {/* LEVEL 2 CARD: Leaderboard Panel */}
            <div className="stagger-2">
              <LeaderboardPanel />
            </div>

            {/* LEVEL 2 CARD: Achievements/Milestones Panel (With empty states support) */}
            <div className="stagger-3">
              {showEmptyState ? (
                <EmptyState 
                  title="அடைவுகள் எதுவும் இல்லை" 
                  desc="உங்களின் முதல் வாசிப்புப் பயிற்சியைத் தொடங்கியதும் சாதனைகள் இங்கே திறக்கப்படும்!"
                  actionText="பயிற்சியைத் தொடங்கு"
                  onAction={() => navigate('/practice')}
                />
              ) : (
                <div className="glass p-5 rounded-xl border border-border bg-[#FFFCF7] shadow-sm space-y-4">
                  <div className="border-b border-border/50 pb-2 flex items-center justify-between font-tamil">
                    <span className="text-[10px] font-black text-text-secondary uppercase tracking-wider">எனது சாதனைகள் (Milestones)</span>
                    <span className="text-[9px] text-olive font-bold font-tamil">முன்னேற்றம்</span>
                  </div>
                  
                  <div className="space-y-3.5 font-tamil">
                    {/* Milestone 1 */}
                    <div className="flex gap-3 items-start text-xs border-b border-border/20 pb-3 last:border-b-0 last:pb-0">
                      <span className="text-xl">📚</span>
                      <div className="space-y-0.5">
                        <p className="font-bold text-text-primary text-[13px]">முதல் 1000 சொற்கள்</p>
                        <p className="text-[10px] text-text-muted leading-relaxed font-semibold">1000 சொற்கள் வரை வாசித்தல்</p>
                        <p className={`text-[9px] font-black uppercase mt-1 tracking-wider ${user?.wordsPracticed >= 1000 ? 'text-olive font-black' : 'text-text-muted'}`}>
                          {user?.wordsPracticed || 0} / 1000 சொற்கள்
                        </p>
                      </div>
                    </div>

                    {/* Milestone 2 */}
                    <div className="flex gap-3 items-start text-xs border-b border-border/20 pb-3 last:border-b-0 last:pb-0">
                      <span className="text-xl">🔥</span>
                      <div className="space-y-0.5">
                        <p className="font-bold text-text-primary text-[13px]">7 நாட்கள் தொடர்ச்சி</p>
                        <p className="text-[10px] text-text-muted leading-relaxed font-semibold">தொடர்ந்து 7 நாட்கள் வாசித்தல்</p>
                        <p className={`text-[9px] font-black uppercase mt-1 tracking-wider ${streak >= 7 ? 'text-olive font-black' : 'text-text-muted'}`}>
                          {streak} / 7 நாட்கள்
                        </p>
                      </div>
                    </div>

                    {/* Milestone 3 */}
                    <div className="flex gap-3 items-start text-xs border-b border-border/20 pb-3 last:border-b-0 last:pb-0">
                      <span className="text-xl">🏆</span>
                      <div className="space-y-0.5">
                        <p className="font-bold text-text-primary text-[13px]">உச்சரிப்பு வல்லுநர்</p>
                        <p className="text-[10px] text-text-muted leading-relaxed font-semibold">90%+ துல்லியத்துடன் 10 முறை</p>
                        <p className={`text-[9px] font-black uppercase mt-1 tracking-wider ${(user?.averageAccuracy || 0) >= 90 && (user?.totalAttempts || 0) >= 10 ? 'text-olive font-black' : 'text-text-muted'}`}>
                          {user?.averageAccuracy || 0}% Accuracy
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* 3. BOTTOM SECTION (Full Width CTA, Staggered Load) */}
        <div className="pt-4 stagger-5">
          <motion.button
            whileHover={{ scale: 1.008, y: -2 }}
            whileTap={{ scale: 0.992 }}
            onClick={() => navigate('/practice')}
            className="w-full py-5 rounded-xl font-tamil font-bold text-[#FFFCF7] text-lg cursor-pointer flex items-center justify-center gap-3 transition-all relative overflow-hidden btn-glow hover-btn shadow-md active-btn"
            style={{
              background: 'linear-gradient(135deg, var(--color-terracotta) 0%, var(--color-gold) 100%)',
            }}
          >
            <motion.span 
              animate={{ scale: [1, 1.02, 1] }} 
              transition={{ repeat: Infinity, duration: 2.2 }}
              className="flex items-center gap-2.5"
            >
              🎤 வாசிப்புப் பயிற்சியைத் தொடர்க (Continue Practice)
            </motion.span>
          </motion.button>
        </div>

      </main>

      {/* Right Intelligence Feed */}
      <RightIntelligenceFeed selectedTag={selectedTag} onTagClick={(tag) => setSelectedTag(tag === selectedTag ? null : tag)} />

    </div>
  );
}
