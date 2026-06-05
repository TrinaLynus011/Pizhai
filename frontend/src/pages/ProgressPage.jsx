// pages/ProgressPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Zap, CheckCircle, Lock, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext.jsx';
import LeftSidebar from '../components/LeftSidebar.jsx';
import RightIntelligenceFeed from '../components/RightIntelligenceFeed.jsx';
import PageWrapper from '../components/PageWrapper.jsx';

export default function ProgressPage() {
  const { user, login } = useUser();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const xp = user?.xp || 0;
  const streak = user?.streak || 0;
  const totalAttempts = user?.totalAttempts || 0;
  const averageAccuracy = user?.averageAccuracy || 0;
  const wordsPracticed = user?.wordsPracticed || 0;
  const documentsRead = user?.documentsRead || 0;

  useEffect(() => {
    async function fetchFreshUser() {
      if (!user?.id) return;
      try {
        const res = await fetch(`${API_BASE}/user/${user.id}`);
        if (res.ok) {
          const freshData = await res.json();
          login(freshData);
          if (freshData.attempts_history) {
            setHistory(freshData.attempts_history);
          }
        }
      } catch (e) {
        console.error('Failed to sync progress data:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchFreshUser();
  }, [user?.id, API_BASE, login]);

  const ACHIEVEMENTS = [
    {
      id: 'words_1000',
      title: 'முதல் 1000 சொற்கள் / First 1000 Words',
      desc: '1000 சொற்கள் வரை வாசித்துப் பயிற்சி செய்யுங்கள். / Practice reading up to 1000 words.',
      condition: wordsPracticed >= 1000,
      progress: `${wordsPracticed} / 1000 சொற்கள் (Words)`,
      icon: '📚'
    },
    {
      id: 'streak_7',
      title: '7 நாட்கள் தொடர்ச்சி / 7-Day Streak',
      desc: 'தொடர்ந்து 7 நாட்கள் வாசித்துப் பயிற்சி செய்யுங்கள். / Read daily for 7 consecutive days.',
      condition: streak >= 7,
      progress: `${streak} / 7 நாட்கள் (Days)`,
      icon: '🔥'
    },
    {
      id: 'master_pronounce',
      title: 'உச்சரிப்பு வல்லுநர் / Pronunciation Expert',
      desc: '90%க்கும் மேல் துல்லியமாக 10 முறை வாசியுங்கள். / Read with 90%+ accuracy 10 times.',
      condition: averageAccuracy >= 90 && totalAttempts >= 10,
      progress: `${averageAccuracy}% துல்லியம் (${totalAttempts}/10 முறைகள்) / Accuracy`,
      icon: '🏆'
    },
    {
      id: 'lit_explorer',
      title: 'தமிழ் இலக்கியத் தேடல் / Tamil Literary Explorer',
      desc: 'நீங்கள் பதிவேற்றிய 3 ஆவணங்களை வாசித்து முடியுங்கள். / Complete reading 3 uploaded documents.',
      condition: documentsRead >= 3,
      progress: `${documentsRead} / 3 ஆவணங்கள் (Documents)`,
      icon: '⛵'
    }
  ];

  const handleTagClick = (tag) => {
    navigate('/dashboard', { state: { filterTag: tag } });
  };

  // Render elegant SVG trend line (V5: Animated path drawing)
  const renderTrendLine = () => {
    const dataPoints = history.map(h => h.accuracy || h.score || 0);
    
    if (dataPoints.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-border rounded-xl bg-bg-deep/40 min-h-[200px] font-tamil">
          <TrendingUp size={24} className="text-text-muted mb-2 animate-float" />
          <p className="text-xs text-text-secondary font-bold">இன்னும் எந்த வாசிப்பு விவரங்களும் பதிவு செய்யப்படவில்லை / No attempts recorded yet</p>
          <p className="text-[11px] text-text-muted mt-1 max-w-xs">உங்களின் வாசிப்புத் துல்லிய வரைபடத்தைக் காண முதல் வாசிப்புப் பயிற்சியை முடியுங்கள். / Complete your first exercise to see your score trend graph.</p>
        </div>
      );
    }

    const width = 600;
    const height = 200;
    const padding = 30;

    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const pointsCount = dataPoints.length;
    const xStep = pointsCount > 1 ? chartWidth / (pointsCount - 1) : chartWidth;

    const points = dataPoints.map((val, idx) => {
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
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[500px] select-none overflow-visible">
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-terracotta)" stopOpacity="0.15" />
              <stop offset="100%" stopColor="var(--color-terracotta)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((gridVal) => {
            const y = padding + chartHeight - (gridVal / 100) * chartHeight;
            return (
              <g key={gridVal}>
                <line 
                  x1={padding} 
                  y1={y} 
                  x2={width - padding} 
                  y2={y} 
                  stroke="var(--color-border)" 
                  strokeWidth="1" 
                  strokeDasharray="4 4"
                />
                <text 
                  x={padding - 8} 
                  y={y + 4} 
                  fill="var(--color-text-muted)" 
                  fontSize="9px" 
                  fontWeight="bold" 
                  textAnchor="end"
                >
                  {gridVal}%
                </text>
              </g>
            );
          })}

          {/* Shaded Area */}
          {points.length > 0 && (
            <motion.path 
              d={areaD} 
              fill="url(#areaGrad)" 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
            />
          )}

          {/* Core trend line path - V5 Drawing Animation */}
          {points.length > 0 && (
            <motion.path 
              d={pathD} 
              fill="none" 
              stroke="var(--color-terracotta)" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            />
          )}

          {/* Data Points with stagger appearance */}
          {points.map((pt, idx) => (
            <motion.g 
              key={idx}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, delay: 0.9 + idx * 0.1, ease: 'easeOut' }}
            >
              <circle 
                cx={pt.x} 
                cy={pt.y} 
                r="4.5" 
                fill="var(--color-bg-card)" 
                stroke="var(--color-terracotta)" 
                strokeWidth="2.5" 
              />
              <text 
                x={pt.x} 
                y={pt.y - 10} 
                fill="var(--color-text-primary)" 
                fontSize="10px" 
                fontWeight="800" 
                textAnchor="middle"
              >
                {pt.value}%
              </text>
            </motion.g>
          ))}
        </svg>
      </div>
    );
  };

  return (
    <PageWrapper>
      <div className="min-h-screen bg-bg-deep text-text-primary flex overflow-hidden font-sans">
        {/* Left Sidebar */}
        <LeftSidebar />

        {/* Workspace */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto h-screen space-y-8 max-w-5xl mx-auto">
          <div className="border-b border-border pb-3 font-tamil">
            <h2 className="font-extrabold text-2xl tracking-tight text-text-primary">🏆 முன்னேற்றம் & சாதனைகள் / Progress & Achievements</h2>
            <p className="text-xs text-text-secondary font-black tracking-wider uppercase mt-1">
              உங்கள் வாசிப்பு முன்னேற்றத்தை வரைபடம் மூலம் கண்டறியவும் / Track your reading improvement and score progress history
            </p>
          </div>

          {/* Reading Trend Graph (Level 2) */}
          <div className="glass p-6 rounded-xl border border-border bg-bg-card space-y-4 font-tamil hover-lift shadow-sm">
            <div>
              <h3 className="font-bold text-base text-text-primary leading-tight">வாசிப்புத் துல்லிய வரைபடம் / Reading Accuracy Graph</h3>
              <p className="text-xs text-text-secondary mt-1">நாட்குறிப்பு வாரியாக உங்கள் வாசிப்புத் திறன் முன்னேற்றம். / Historical overview of your reading accuracy trend.</p>
            </div>
            {renderTrendLine()}
          </div>

          {/* Streak Section (Level 2) */}
          <div className="glass p-5 rounded-xl border border-border bg-bg-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden font-tamil hover-lift shadow-sm">
            <div className="absolute right-0 top-0 w-32 h-32 rounded-full bg-terracotta/5 blur-2xl pointer-events-none animate-float" />
            <div className="space-y-1.5 z-10">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-terracotta tracking-wider animate-pulse">
                <Zap size={14} />
                <span>தினசரி வாசிப்புத் தொடர்ச்சி / Daily Reading Streak</span>
              </div>
              <h3 className="font-sans font-black text-2xl text-text-primary">{streak} நாட்கள் தொடர்ச்சி / Streak Days</h3>
              <p className="text-xs text-text-secondary font-semibold">
                தினமும் ஒரு தமிழ் பகுதியை வாசித்து உங்கள் தொடர்ச்சியைத் தக்க வைத்துக் கொள்ளுங்கள்! / Read a Tamil passage daily to keep your learning streak active!
              </p>
            </div>
            <div className="w-14 h-14 rounded-full border border-terracotta/20 bg-terracotta/10 flex items-center justify-center font-black text-2xl text-terracotta shadow-sm flex-shrink-0 animate-bounce">
              🔥
            </div>
          </div>

          {/* Achievements Grid */}
          <div className="space-y-3 font-tamil">
            <h3 className="font-sans font-black text-[11px] tracking-widest text-text-muted uppercase border-b border-border pb-1.5">
              🏆 கற்றல் முத்திரைகள் & சாதனைகள் / Learning Badges & Achievements
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ACHIEVEMENTS.map((ach) => (
                <div 
                  key={ach.id} 
                  className={`glass p-4 rounded-xl border flex gap-4 transition-all relative overflow-hidden hover-lift active-btn cursor-pointer ${
                    ach.condition 
                      ? 'border-olive/20 bg-bg-card shadow-sm' 
                      : 'border-border bg-bg-card/40 opacity-75'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center text-2xl shadow-sm flex-shrink-0 ${
                    ach.condition 
                      ? 'bg-olive/10 border-olive/20 text-olive' 
                      : 'bg-bg-deep/40 border-border text-text-muted'
                  }`}>
                    {ach.icon}
                  </div>

                  <div className="space-y-1 min-w-0 flex-grow">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-extrabold text-sm text-text-primary truncate">{ach.title}</h4>
                      {ach.condition ? (
                        <CheckCircle size={14} className="text-olive flex-shrink-0" />
                      ) : (
                        <Lock size={12} className="text-text-muted flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed font-semibold">{ach.desc}</p>
                    <p className={`text-[10px] font-black uppercase mt-1.5 tracking-wider ${
                      ach.condition ? 'text-olive' : 'text-text-muted'
                    }`}>
                      முன்னேற்றம் / Progress: {ach.progress}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </main>

        {/* Right Companion Panel */}
        <RightIntelligenceFeed onTagClick={handleTagClick} />
      </div>
    </PageWrapper>
  );
}
