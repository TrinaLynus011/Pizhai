// pages/LeaderboardPage.jsx
import { useEffect, useState } from 'react';
import { Trophy, RefreshCw, Star, Zap } from 'lucide-react';
import { useUser } from '../context/UserContext.jsx';
import LeftSidebar from '../components/LeftSidebar.jsx';
import RightIntelligenceFeed from '../components/RightIntelligenceFeed.jsx';
import PageWrapper from '../components/PageWrapper.jsx';
import { getLeaderboard } from '../services/api.js';

const RANK_STYLES = {
  1: { emoji: '🥇', color: 'var(--color-gold)' },
  2: { emoji: '🥈', color: 'var(--color-text-secondary)' },
  3: { emoji: '🥉', color: 'var(--color-saffron)' },
};

export default function LeaderboardPage() {
  const { user } = useUser();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchLeaderboard() {
    setLoading(true);
    try {
      const data = await getLeaderboard(10);
      setLeaderboard(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const username = user?.name || user?.username || 'Guest';

  return (
    <PageWrapper>
      <div className="min-h-screen bg-bg-deep text-text-primary flex overflow-hidden">
        {/* Left Sidebar */}
        <LeftSidebar />

        {/* Workspace */}
        <main className="flex-1 p-5 md:p-7 overflow-y-auto h-screen space-y-6">
          <div className="flex justify-between items-center border-b border-border pb-3">
            <div>
              <h2 className="font-extrabold text-2xl tracking-tight text-text-primary">🏆 GLOBAL LEADERBOARD</h2>
              <p className="text-xs text-text-secondary font-black tracking-wider uppercase mt-1">
                Compete with other learners and rise through the ranks
              </p>
            </div>
            <button 
              onClick={fetchLeaderboard}
              className="p-2.5 rounded-xl border border-border bg-bg-card hover:bg-bg-mid transition-all cursor-pointer text-text-muted hover:text-sky"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          {/* Leaderboard Table List */}
          <div className="glass rounded-xl border border-border bg-bg-card overflow-hidden">
            <div className="p-4 bg-bg-mid/30 border-b border-border/50 grid grid-cols-12 text-xs font-black text-text-muted uppercase tracking-wider">
              <span className="col-span-2 text-center">Rank</span>
              <span className="col-span-6">Learner</span>
              <span className="col-span-2 text-center">Streak</span>
              <span className="col-span-2 text-right">Total XP</span>
            </div>

            <div className="divide-y divide-border/30">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-4 h-14 bg-bg-card animate-pulse" />
                ))
              ) : leaderboard.length === 0 ? (
                <div className="p-8 text-center text-text-muted text-sm font-bold">
                  No registered users found.
                </div>
              ) : (
                leaderboard.map((u, i) => {
                  const isCurr = u.id === user?.id || u.name === username;
                  const rankStyle = RANK_STYLES[i + 1];
                  return (
                    <div 
                      key={u.id || i}
                      className={`p-4 grid grid-cols-12 items-center text-sm ${
                        isCurr ? 'bg-sky/5 text-sky' : 'bg-transparent text-text-secondary'
                      }`}
                    >
                      {/* Rank */}
                      <span className="col-span-2 text-center font-black">
                        {rankStyle ? (
                          <span className="text-xl">{rankStyle.emoji}</span>
                        ) : (
                          <span>#{i + 1}</span>
                        )}
                      </span>

                      {/* Name / Level */}
                      <div className="col-span-6 flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm text-white flex-shrink-0" style={{ background: isCurr ? 'linear-gradient(135deg, var(--color-sky), var(--color-purple))' : '#111823' }}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="truncate min-w-0">
                          <p className={`font-extrabold ${isCurr ? 'text-sky' : 'text-text-primary'}`}>{u.name}</p>
                          <span className="text-[10px] text-text-muted font-black uppercase tracking-wider">{u.level}</span>
                        </div>
                      </div>

                      {/* Streak */}
                      <span className="col-span-2 text-center font-bold text-text-primary">
                        🔥 {u.streak}
                      </span>

                      {/* XP */}
                      <span className="col-span-2 text-right font-black text-text-primary">
                        {u.xp} XP
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </main>

        {/* Right Intelligence Feed */}
        <RightIntelligenceFeed />
      </div>
    </PageWrapper>
  );
}
