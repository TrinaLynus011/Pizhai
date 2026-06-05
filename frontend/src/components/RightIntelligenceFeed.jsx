// components/RightIntelligenceFeed.jsx
import { useEffect, useState } from 'react';
import { Newspaper, BookOpen, Hash, RefreshCw, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext.jsx';

export default function RightIntelligenceFeed({ onTagClick, selectedTag }) {
  const { user } = useUser();
  const [news, setNews] = useState([]);
  const [facts, setFacts] = useState([]);
  const [factIndex, setFactIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // Fetch news and rotating facts on key change
  useEffect(() => {
    async function fetchData() {
      try {
        const [newsRes, insightsRes] = await Promise.all([
          fetch(`${API_BASE}/news-feed`).then(r => r.json()),
          fetch(`${API_BASE}/rotating-insights`).then(r => r.json())
        ]);
        if (newsRes.news) {
          setNews(newsRes.news.slice(0, 3));
        }
        if (insightsRes.facts) {
          setFacts(insightsRes.facts);
          setFactIndex(Math.floor(Math.random() * insightsRes.facts.length));
        }
      } catch (e) {
        console.error('Failed to fetch intelligence feed:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [refreshKey, API_BASE]);

  // V5 requirement: Refresh news feed automatically every 30 minutes (1,800,000ms)
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(k => k + 1);
    }, 1800000);
    return () => clearInterval(interval);
  }, []);

  // Rotate facts dynamically (every 25 seconds for smooth engagement)
  useEffect(() => {
    if (facts.length <= 1) return;
    const interval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % facts.length);
    }, 25000);
    return () => clearInterval(interval);
  }, [facts]);

  const activeFact = facts[factIndex] || null;

  const TAGS = [
    { label: '#தமிழ்' },
    { label: '#இலக்கியம்' },
    { label: '#கல்வி' },
    { label: '#வரலாறு' },
    { label: '#அறிவியல்' },
    { label: '#தொழில்நுட்பம்' },
  ];

  const handleTagClick = (tag) => {
    if (onTagClick) {
      onTagClick(tag);
    }
  };

  // Calculate Today's Progress dynamically
  const getTodayProgress = () => {
    const attempts = user?.attempts_history || [];
    
    // Get today's local date string YYYY-MM-DD
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    
    // Filter attempts recorded today
    const todayAttempts = attempts.filter(att => {
      if (!att.timestamp) return false;
      return att.timestamp.startsWith(todayStr);
    });

    const completedCount = todayAttempts.length;
    const avgAccuracy = completedCount > 0 
      ? Math.round(todayAttempts.reduce((sum, curr) => sum + (curr.accuracy || 0), 0) / completedCount) 
      : 0;
    
    const totalSeconds = todayAttempts.reduce((sum, curr) => sum + (curr.duration || 0), 0);
    const totalMinutes = Math.max(0, Math.round(totalSeconds / 60)) || (totalSeconds > 0 ? 1 : 0);
    const wordsPracticed = todayAttempts.reduce((sum, curr) => sum + (curr.words_count || 0), 0);

    return {
      completedCount,
      avgAccuracy,
      totalMinutes,
      wordsPracticed
    };
  };

  const todayProgress = getTodayProgress();

  return (
    <aside className="w-full md:w-[320px] bg-bg-mid border-l border-border p-6 flex flex-col gap-6 overflow-y-auto h-screen sticky top-0 flex-shrink-0 text-text-primary">
      
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-terracotta animate-pulse" />
          <span className="font-tamil font-black text-xs tracking-wider text-text-secondary">துணைவன் (Companion)</span>
        </div>
        <button 
          onClick={() => { setLoading(true); setRefreshKey(k => k + 1); }}
          className="p-1 rounded hover:bg-bg-card transition-all text-text-muted hover:text-terracotta cursor-pointer"
          title="புதுப்பி"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="h-28 rounded-xl border border-border bg-bg-card/40 animate-pulse" />
          <div className="h-36 rounded-xl border border-border bg-bg-card/40 animate-pulse" />
          <div className="h-32 rounded-xl border border-border bg-bg-card/40 animate-pulse" />
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          
          {/* Card 1: Today's Progress Card (இன்றைய முன்னேற்றம்) */}
          <div className="glass p-5 rounded-xl border border-border bg-bg-card">
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-text-muted tracking-wider mb-3 pb-1 border-b border-border/40 font-sans">
              <span>இன்றைய முன்னேற்றம்</span>
            </div>
            <div className="space-y-2.5 font-tamil font-bold text-xs text-text-secondary">
              <div className="flex items-center gap-2">
                <span className="text-olive text-sm">✓</span>
                <span>{todayProgress.completedCount} பயிற்சிகள் முடிந்தது</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-olive text-sm">✓</span>
                <span>{todayProgress.avgAccuracy}% சராசரி துல்லியம்</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-olive text-sm">✓</span>
                <span>{todayProgress.totalMinutes} நிமிட வாசிப்பு</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-olive text-sm">✓</span>
                <span>{todayProgress.wordsPracticed} புதிய சொற்கள்</span>
              </div>
            </div>
          </div>

          {/* Card 2: Rotating Knowledge Card (துணைவன்) */}
          {activeFact && (
            <div className="glass p-5 rounded-xl border border-border relative overflow-hidden bg-bg-card">
              <div className="flex items-center justify-between text-[10px] font-black uppercase text-terracotta tracking-wider mb-2.5 pb-1.5 border-b border-border/40 font-tamil">
                <span>{activeFact.title}</span>
                <button 
                  onClick={() => setFactIndex((prev) => (prev + 1) % facts.length)} 
                  className="text-text-muted hover:text-terracotta transition-all text-[10px] flex items-center gap-0.5 cursor-pointer font-tamil font-bold"
                >
                  அடுத்து <ChevronRight size={10} />
                </button>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={factIndex}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  transition={{ duration: 0.4 }}
                  className="min-h-[70px] flex flex-col justify-between"
                >
                  <p className="text-[13px] text-text-secondary leading-relaxed font-tamil font-bold">
                    {activeFact.content}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          )}

          {/* Card 3: Topic Tags (ஆராயும் தலைப்புகள்) */}
          <div className="glass p-5 rounded-xl border border-border bg-bg-card">
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-text-secondary tracking-wider mb-3 font-tamil">
              <Hash size={12} className="text-terracotta" />
              <span>ஆராயும் தலைப்புகள்</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((tag) => {
                const isActive = selectedTag === tag.label;
                return (
                  <button
                    key={tag.label}
                    onClick={() => handleTagClick(tag.label)}
                    className={`px-2.5 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer font-tamil hover-btn active-btn ${
                      isActive 
                        ? 'bg-terracotta border-terracotta text-white shadow-sm' 
                        : 'bg-bg-mid border-border/40 text-text-secondary hover:bg-terracotta hover:text-white hover:border-terracotta'
                    }`}
                  >
                    {tag.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 4: News Feed (தமிழ் அறிவுக் களம்) - Max 10-15% size, max 3 news articles */}
          {news.length > 0 && (
            <div className="flex flex-col gap-2 bg-transparent">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-text-muted tracking-wider border-b border-border/30 pb-1.5 font-tamil">
                <Newspaper size={12} className="text-terracotta" />
                <span>அறிவுக் களம் (News & Insights)</span>
              </div>
              <div className="flex flex-col gap-3">
                {news.map((item) => {
                  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(item.title)}`;
                  return (
                    <div 
                      key={item.id}
                      className="text-left group select-none border-b border-border/20 pb-2.5 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-2 text-[9px] font-bold text-text-muted font-tamil">
                        <span className="px-1 py-0.5 rounded bg-bg-deep text-text-secondary">
                          {item.category}
                        </span>
                        <span>{item.timestamp}</span>
                      </div>
                      <h4 className="font-tamil font-bold text-xs text-text-secondary mt-1 group-hover:text-terracotta leading-snug transition-colors">
                        <a 
                          href={searchUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="hover:underline focus:outline-none focus:ring-1 focus:ring-terracotta rounded"
                        >
                          {item.title}
                        </a>
                      </h4>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}
    </aside>
  );
}
