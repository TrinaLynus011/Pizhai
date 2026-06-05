// pages/NewsPage.jsx
import { useEffect, useState } from 'react';
import { Newspaper, BookOpen, Clock, Calendar } from 'lucide-react';
import LeftSidebar from '../components/LeftSidebar.jsx';
import RightIntelligenceFeed from '../components/RightIntelligenceFeed.jsx';
import PageWrapper from '../components/PageWrapper.jsx';

export default function NewsPage() {
  const [news, setNews] = useState([]);
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetch(`${API_BASE}/news-feed`)
      .then(r => r.json())
      .then(d => { if (d.news) setNews(d.news); })
      .catch(e => console.error(e));
  }, [API_BASE]);

  return (
    <PageWrapper>
      <div className="min-h-screen bg-bg-deep text-text-primary flex overflow-hidden">
        {/* Left Sidebar */}
        <LeftSidebar />

        {/* Workspace */}
        <main className="flex-1 p-5 md:p-7 overflow-y-auto h-screen space-y-6">
          <div className="border-b border-border pb-3">
            <h2 className="font-extrabold text-2xl tracking-tight text-text-primary">📰 TAMIL NEWS & KNOWLEDGE</h2>
            <p className="text-xs text-text-secondary font-black tracking-wider uppercase mt-1">
              Stay updated with startups, science, and educational updates in Tamil Nadu
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5">
            {news.map((item) => (
              <div 
                key={item.id}
                className="glass p-5 rounded-xl border border-border bg-bg-card/75 flex flex-col gap-3.5 hover:border-sky/20 hover:bg-bg-card transition-all"
              >
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded bg-sky/10 text-sky border border-sky/20">
                    {item.category}
                  </span>
                  <div className="flex items-center gap-3 text-[10px] text-text-muted font-bold">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {item.timestamp}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      3 mins read
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-tamil font-black text-lg md:text-xl text-text-primary leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {item.summary}
                  </p>
                </div>

                <div className="flex justify-between items-center border-t border-border/10 pt-3">
                  <span className="text-xs text-text-muted font-bold">Source: Tamil IT Feed</span>
                  <button 
                    onClick={() => navigate('/practice', { state: { selectedWord: item.title } })}
                    className="text-xs font-black text-sky hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Practice reading this headline <BookOpen size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Right Intelligence Feed */}
        <RightIntelligenceFeed />
      </div>
    </PageWrapper>
  );
}
