// pages/AnalyticsPage.jsx
import { BookOpen, Award, TrendingUp, AlertCircle, Compass } from 'lucide-react';
import { useUser } from '../context/UserContext.jsx';
import LeftSidebar from '../components/LeftSidebar.jsx';
import RightIntelligenceFeed from '../components/RightIntelligenceFeed.jsx';
import PageWrapper from '../components/PageWrapper.jsx';

function ReadingTrendChart({ data, title, color = '#4DA3FF', suffix = '' }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-44 flex items-center justify-center text-text-subtle border border-border rounded-xl bg-bg-card/20 text-xs font-bold">
        No attempts recorded yet.
      </div>
    );
  }

  const width = 480;
  const height = 150;
  const padding = 20;
  const minVal = 0;
  const maxVal = Math.max(100, ...data);

  const points = data.map((val, idx) => {
    const x = padding + (idx / (data.length - 1 || 1)) * (width - 2 * padding);
    const y = height - padding - ((val - minVal) / (maxVal - minVal || 1)) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="glass p-4 rounded-xl border border-border bg-bg-card flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-black text-text-muted uppercase tracking-wider">{title}</span>
        <span className="text-xs font-black text-text-primary">{data[data.length - 1]}{suffix}</span>
      </div>
      <div className="relative w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[320px] h-[140px]">
          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />

          <polyline
            fill="none"
            stroke={color}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />
          {data.map((val, idx) => {
            const x = padding + (idx / (data.length - 1 || 1)) * (width - 2 * padding);
            const y = height - padding - ((val - minVal) / (maxVal - minVal || 1)) * (height - 2 * padding);
            return (
              <g key={idx}>
                <circle
                  cx={x}
                  cy={y}
                  r="4"
                  fill={color}
                  stroke="#162230"
                  strokeWidth="1.5"
                />
                <text x={x} y={y - 8} textAnchor="middle" fill="#B0BAC5" fontSize="8" fontWeight="bold">
                  {val}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { user } = useUser();

  const history = user?.attempts_history || [];
  const totalAttempts = user?.totalAttempts || 0;
  const averageAccuracy = user?.averageAccuracy || 0;
  const averageFluency = user?.averageFluency || 0;
  const averageWpm = user?.averageWpm || 0;
  const wordsPracticed = user?.wordsPracticed || 0;
  const documentsRead = user?.documentsRead || 0;
  const totalReadingTime = Math.round(user?.totalReadingTime || 0);

  // Extract last 10 attempts
  const recentAttempts = history.slice(-10);
  const scoreHistory = recentAttempts.map(h => h.score);
  const accuracyHistory = recentAttempts.map(h => h.accuracy);
  const fluencyHistory = recentAttempts.map(h => h.fluency);
  const wpmHistory = recentAttempts.map(h => h.wpm);

  // Improvement Insights
  const insights = [];
  if (accuracyHistory.length >= 2) {
    const diff = accuracyHistory[accuracyHistory.length - 1] - accuracyHistory[0];
    if (diff > 0) {
      insights.push(`Accuracy improved by ${diff}% over the last ${accuracyHistory.length} sessions.`);
    } else if (diff === 0) {
      insights.push(`Accuracy remained stable at ${accuracyHistory[0]}% over the last sessions.`);
    } else {
      insights.push('Pronunciation accuracy fluctuated. Slow down to gain stability.');
    }
  }

  if (wpmHistory.length >= 2) {
    const avgRecentWpm = Math.round(wpmHistory.reduce((a, b) => a + b, 0) / wpmHistory.length);
    if (avgRecentWpm >= 90 && avgRecentWpm <= 145) {
      insights.push(`Pacing tempo remains in the ideal fluent speaking range (${avgRecentWpm} WPM).`);
    } else if (avgRecentWpm < 90) {
      insights.push(`Reading speed is slightly low (${avgRecentWpm} WPM). Practice connected words.`);
    }
  }

  if (fluencyHistory.length >= 2) {
    const diffFlu = fluencyHistory[fluencyHistory.length - 1] - fluencyHistory[0];
    if (diffFlu > 0) {
      insights.push(`Fluency flow score increased by ${diffFlu} points due to fewer pause breaks.`);
    }
  }

  if (insights.length === 0) {
    insights.push('Record more exercises to unlock AI Improvement Insights.');
  }

  return (
    <PageWrapper>
      <div className="min-h-screen bg-bg-deep text-text-primary flex overflow-hidden">
        
        {/* Left Sidebar */}
        <LeftSidebar />

        {/* Workspace */}
        <main className="flex-1 p-5 md:p-7 overflow-y-auto h-screen space-y-6">
          <div className="border-b border-border pb-3">
            <h2 className="font-extrabold text-2xl tracking-tight text-text-primary">📈 LEARNING ANALYTICS & TRENDS</h2>
            <p className="text-xs text-text-secondary font-black tracking-wider uppercase mt-1">
              Visualize reading metrics, accuracy speed, and pronunciation diagnostics
            </p>
          </div>

          {/* Core Analytics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass p-4 rounded-xl border border-border bg-bg-card/40">
              <span className="text-[9px] font-black text-text-muted uppercase block">Words Practiced</span>
              <p className="text-xl font-black text-saffron mt-1">{wordsPracticed}</p>
            </div>
            <div className="glass p-4 rounded-xl border border-border bg-bg-card/40">
              <span className="text-[9px] font-black text-text-muted uppercase block">Reading Time</span>
              <p className="text-xl font-black text-sky mt-1">{totalReadingTime}s</p>
            </div>
            <div className="glass p-4 rounded-xl border border-border bg-bg-card/40">
              <span className="text-[9px] font-black text-text-muted uppercase block">Documents Completed</span>
              <p className="text-xl font-black text-emerald mt-1">{documentsRead}</p>
            </div>
            <div className="glass p-4 rounded-xl border border-border bg-bg-card/40">
              <span className="text-[9px] font-black text-text-muted uppercase block">Completed Tasks</span>
              <p className="text-xl font-black text-purple mt-1">{totalAttempts}</p>
            </div>
          </div>

          {/* Trend Charts */}
          <div className="space-y-4">
            <h3 className="font-sans font-black text-[11px] tracking-widest text-text-muted uppercase border-b border-border pb-1.5">
              📈 RECENT PERFORMANCE TRENDS
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
              <ReadingTrendChart data={scoreHistory} title="Reading Score (Last 10 attempts)" color="var(--color-sky)" suffix="/100" />
              <ReadingTrendChart data={accuracyHistory} title="Accuracy % (Last 10 attempts)" color="var(--color-emerald)" suffix="%" />
              <ReadingTrendChart data={fluencyHistory} title="Fluency Score (Last 10 attempts)" color="var(--color-purple)" suffix="/100" />
              <ReadingTrendChart data={wpmHistory} title="Reading Pacing (Last 10 attempts)" color="var(--color-saffron)" suffix=" WPM" />
            </div>
          </div>

          {/* AI Insights & Learning recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
            {/* Insights */}
            <div className="glass p-5 rounded-xl border border-border bg-bg-card/60 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-sky tracking-wider border-b border-border/50 pb-2">
                <TrendingUp size={16} />
                <span>AI IMPROVEMENT INSIGHTS</span>
              </div>
              <div className="space-y-2.5">
                {insights.map((ins, idx) => (
                  <div key={idx} className="flex gap-2.5 items-start text-xs text-text-secondary font-semibold leading-relaxed">
                    <span className="text-sky font-bold">•</span>
                    <span>{ins}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="glass p-5 rounded-xl border border-border bg-bg-card/60 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-saffron tracking-wider border-b border-border/50 pb-2">
                <Compass size={16} />
                <span>RECOMMENDED REMEDIAL DRILLS</span>
              </div>
              <div className="space-y-2.5">
                <div className="flex gap-2.5 items-start text-xs text-text-secondary font-semibold leading-relaxed">
                  <span className="text-saffron font-bold">→</span>
                  <span>Practice reading compound letter combinations like ழ (LLLA) vs ள (LLA) to raise accuracy.</span>
                </div>
                <div className="flex gap-2.5 items-start text-xs text-text-secondary font-semibold leading-relaxed">
                  <span className="text-saffron font-bold">→</span>
                  <span>Try the intermediate reading exercises to get comfortable with complete sentences.</span>
                </div>
                <div className="flex gap-2.5 items-start text-xs text-text-secondary font-semibold leading-relaxed">
                  <span className="text-saffron font-bold">→</span>
                  <span>Practice reading aloud without pauses at non-punctuation boundaries.</span>
                </div>
              </div>
            </div>
          </div>

        </main>

        {/* Right Intelligence Feed */}
        <RightIntelligenceFeed />

      </div>
    </PageWrapper>
  );
}
