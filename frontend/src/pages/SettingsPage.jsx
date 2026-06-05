// pages/SettingsPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User, Database, RefreshCw, Trash2 } from 'lucide-react';
import { useUser } from '../context/UserContext.jsx';
import LeftSidebar from '../components/LeftSidebar.jsx';
import RightIntelligenceFeed from '../components/RightIntelligenceFeed.jsx';
import PageWrapper from '../components/PageWrapper.jsx';
import { analyzePronunciation } from '../services/api.js';

export default function SettingsPage() {
  const { user, login } = useUser();
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [syncStatus, setSyncStatus] = useState('');
  const [syncing, setSyncing] = useState(false);
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    // Sync local queue
    const queue = JSON.parse(localStorage.getItem('pizhai_offline_attempts') || '[]');
    setOfflineQueue(queue);

    // V5 fix: Sync fresh user details from database on mount
    async function fetchFreshUser() {
      if (!user?.id) return;
      try {
        const res = await fetch(`${API_BASE}/user/${user.id}`);
        if (res.ok) {
          const freshData = await res.json();
          login(freshData); // Synchronize context and local storage with database
        }
      } catch (e) {
        console.error('Failed to sync user data in settings page:', e);
      }
    }
    fetchFreshUser();
  }, [user?.id, API_BASE, login]);

  async function handleSync() {
    if (offlineQueue.length === 0) return;
    setSyncing(true);
    setSyncStatus('ஒத்திசைக்கப்படுகிறது / Syncing attempts...');
    
    let successCount = 0;
    const errors = [];
    
    for (const att of offlineQueue) {
      try {
        await analyzePronunciation(
          att.expected_text, att.user_text, user?.id || '', user?.name || 'Guest', user?.streak || 0, att.duration, false
        );
        successCount++;
      } catch (e) {
        errors.push(e.message || 'Sync error');
      }
    }

    const remaining = offlineQueue.slice(successCount);
    setOfflineQueue(remaining);
    localStorage.setItem('pizhai_offline_attempts', JSON.stringify(remaining));
    setSyncing(false);
    
    if (successCount > 0) {
      setSyncStatus(`வெற்றிகரமாக ${successCount} வாசிப்புகள் ஒத்திசைக்கப்பட்டன! / Successfully synced ${successCount} attempts!`);
    } else {
      setSyncStatus(`ஒத்திசைவு தோல்வியடைந்தது / Sync failed. Error: ${errors.join(', ')}`);
    }

    setTimeout(() => setSyncStatus(''), 4000);
  }

  function handleClearQueue() {
    localStorage.removeItem('pizhai_offline_attempts');
    setOfflineQueue([]);
    setSyncStatus('உள்ளூர் நினைவகம் அழிக்கப்பட்டது. / Local queue cleared.');
    setTimeout(() => setSyncStatus(''), 3000);
  }

  const handleTagClick = (tag) => {
    navigate('/dashboard', { state: { filterTag: tag } });
  };

  const username = user?.name || user?.username || 'Guest';

  return (
    <PageWrapper>
      <div className="min-h-screen bg-bg-deep text-text-primary flex overflow-hidden font-sans">
        {/* Left Sidebar */}
        <LeftSidebar />

        {/* Workspace */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto h-screen space-y-6 max-w-5xl mx-auto">
          <div className="border-b border-border pb-3 font-tamil">
            <h2 className="font-extrabold text-2xl tracking-tight text-text-primary">⚙️ அமைப்புகள் / Settings</h2>
            <p className="text-xs text-text-secondary font-black tracking-wider uppercase mt-1">
              உங்கள் விவரங்கள், கோப்பு ஒத்திசைவு மற்றும் கணினி விவரங்களை நிர்வகிக்கவும் / Manage your profile, sync files, and system details
            </p>
          </div>

          {/* Profile Details Card (Level 2) */}
          <div className="glass p-5 rounded-xl border border-border bg-bg-card flex flex-col gap-4 font-tamil hover-lift shadow-sm">
            <div className="flex items-center gap-2 text-xs font-black uppercase text-terracotta tracking-wider border-b border-border/50 pb-2">
              <User size={16} />
              <span>மாணவர் விவரக்குறிப்பு / Student Profile</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-black text-text-muted uppercase">Student Name / மாணவர் பெயர்</span>
                <p className="text-sm font-extrabold text-text-primary mt-1">{username}</p>
              </div>
              <div>
                <span className="text-[10px] font-black text-text-muted uppercase">Unique ID / தனித்துவ ஐடி</span>
                <p className="text-sm font-mono text-text-secondary mt-1">{user?.id || 'Guest'}</p>
              </div>
              <div>
                <span className="text-[10px] font-black text-text-muted uppercase">Referral Code / பரிந்துரைக் குறியீடு</span>
                <p className="text-sm font-mono text-text-secondary mt-1">{user?.referralCode || '—'}</p>
              </div>
              <div>
                <span className="text-[10px] font-black text-text-muted uppercase">Date Created / உருவாக்கப்பட்ட தேதி</span>
                <p className="text-sm font-mono text-text-secondary mt-1">{user?.createdAt || '—'}</p>
              </div>
            </div>
          </div>

          {/* Sync Manager Card (Level 2) */}
          <div className="glass p-5 rounded-xl border border-border bg-bg-card flex flex-col gap-4 font-tamil hover-lift shadow-sm">
            <div className="flex items-center gap-2 text-xs font-black uppercase text-terracotta tracking-wider border-b border-border/50 pb-2">
              <Database size={16} />
              <span>ஒத்திசைவு மேலாளர் / Sync Manager</span>
            </div>
            
            <div className="space-y-2.5">
              <p className="text-xs text-text-secondary leading-relaxed font-semibold">
                இணையம் இல்லாதபோது நீங்கள் வாசித்தவை உங்கள் உலாவியில் தற்காலிகமாக சேமிக்கப்படும். / Offline-recorded attempts are temporarily saved in your browser storage.
              </p>
              <div className="flex items-center gap-4 bg-bg-deep/30 border border-border p-3.5 rounded-xl">
                <div>
                  <span className="text-[10px] font-black text-text-muted uppercase">Pending Sync / ஒத்திசைக்கப்பட வேண்டியவை</span>
                  <p className="text-base font-black text-text-primary mt-0.5">{offlineQueue.length} வாசிப்புகள் சேமிக்கப்பட்டுள்ளன / recorded attempts saved</p>
                </div>
              </div>
            </div>

            {syncStatus && (
              <div className="p-3 rounded-lg bg-terracotta/10 border border-terracotta/20 text-terracotta text-xs font-bold leading-normal">
                {syncStatus}
              </div>
            )}

            <div className="flex gap-3">
              <button 
                onClick={handleSync}
                disabled={offlineQueue.length === 0 || syncing}
                className="flex-1 px-4 py-2.5 rounded-xl border-none bg-terracotta text-[#FFFCF7] text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-terracotta-light transition-all shadow-sm hover-btn active-btn"
              >
                <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} /> இப்போது ஒத்திசை / Sync Now
              </button>
              <button 
                onClick={handleClearQueue}
                disabled={offlineQueue.length === 0 || syncing}
                className="px-4 py-2.5 rounded-xl border border-rose/25 bg-rose/5 text-rose text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:bg-rose/10 transition-all hover-btn active-btn"
              >
                <Trash2 size={14} /> நினைவகத்தை அழி / Clear Queue
              </button>
            </div>
          </div>

          {/* System info (Level 3 dashed style) */}
          <div className="p-5 rounded-xl border border-dashed border-border bg-bg-card/40 flex flex-col gap-4 text-xs font-tamil hover-lift">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-text-muted tracking-widest border-b border-border/50 pb-2">
              <Shield size={14} />
              <span>தளத்தின் விவரங்கள் / Platform Information</span>
            </div>
            <div className="space-y-1.5 font-bold text-text-secondary">
              <p>இயங்கும் இடம் / Environment: உள்ளூர் கணினி / Local Development</p>
              <p>தொழில்நுட்பங்கள் / Stack: React v18 + Vite + TailwindCSS v4</p>
              <p>பேச்சு பகுப்பாய்வி / Engine: Whisper AI (local_whisper)</p>
              <p>பதிப்பு / Version: 5.0.0 (production-ready)</p>
            </div>
          </div>
        </main>

        {/* Right Companion Panel */}
        <RightIntelligenceFeed onTagClick={handleTagClick} />
      </div>
    </PageWrapper>
  );
}
