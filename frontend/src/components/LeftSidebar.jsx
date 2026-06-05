// components/LeftSidebar.jsx
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, BookOpen, FileText, 
  Award, Settings, LogOut, ChevronLeft, Menu, Info 
} from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext.jsx';

const translateLevel = (lvl) => {
  const map = {
    'Beginner': 'ஆரம்ப நிலை',
    'Learner': 'கற்பவர்',
    'Fluent': 'திறமையாளர்',
    'Tamil Master': 'தமிழ் மாஸ்டர்'
  };
  return map[lvl] || lvl;
};

export default function LeftSidebar({ forceCollapsed = false }) {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [localCollapsed, setLocalCollapsed] = useState(false);

  const collapsed = localCollapsed || forceCollapsed;

  const MENU_ITEMS = [
    { name: 'முகப்பு', sub: 'Home', path: '/dashboard', icon: <Home size={20} /> },
    { name: 'வாசிப்பு பயிற்சி', sub: 'Reading Practice', path: '/practice', icon: <BookOpen size={20} /> },
    { name: 'ஆவணத்தை பதிவேற்று', sub: 'Document Upload', path: '/document-practice', icon: <FileText size={20} /> },
    { name: 'முன்னேற்றம்', sub: 'Progress', path: '/progress', icon: <Award size={20} /> },
    { name: 'அமைப்புகள்', sub: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  function handleLogout() {
    logout();
    navigate('/');
  }

  const username = user?.name || user?.username || 'Guest';
  const level = user?.level || 'Beginner';

  return (
    <aside 
      className="h-screen bg-bg-mid border-r border-border flex flex-col justify-between transition-all duration-300 sticky top-0 z-40 select-none flex-shrink-0"
      style={{ width: collapsed ? '72px' : '260px' }}
    >
      {/* Brand Header */}
      <div>
        <div className="flex items-center justify-between px-3 py-5 border-b border-border">
          {!collapsed && (
            <div className="flex items-center gap-2.5 min-w-0">
              <img 
                src="/images/logo1.png" 
                alt="பிழை சின்னம்" 
                className="w-12 h-12 object-contain flex-shrink-0"
                onError={(e) => { e.target.src = "/logo1.png"; }}
              />
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-tamil text-lg text-terracotta font-black tracking-wider leading-none">பிழை</span>
                  <div className="relative group cursor-pointer">
                    <Info size={11} className="text-text-muted hover:text-terracotta transition-colors" />
                    <div className="absolute left-6 top-0 w-48 p-2.5 rounded-lg bg-bg-card border border-border text-[10px] text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-md z-50 font-sans font-semibold leading-relaxed">
                      This platform uses a blend of Tamil and English to support both native speakers and Tamil learners.
                    </div>
                  </div>
                </div>
                <span className="text-[9px] text-text-muted font-tamil font-bold mt-1.5 leading-none truncate" title="பிழையின்றி தமிழ் பழகு">பிழையின்றி தமிழ் பழகு</span>
              </div>
            </div>
          )}
          {collapsed && (
            <img 
              src="/images/logo1.png" 
              alt="பி" 
              className="w-11 h-11 object-contain mx-auto cursor-pointer"
              onClick={() => setLocalCollapsed(false)}
              onError={(e) => { e.target.src = "/logo1.png"; }}
            />
          )}
          {!forceCollapsed && (
            <button 
              onClick={() => setLocalCollapsed(!localCollapsed)} 
              className="p-1.5 rounded-lg border border-border bg-bg-card hover:bg-border transition-all text-text-muted hover:text-text-primary cursor-pointer active-scale ml-auto"
            >
              {collapsed ? <Menu size={16} /> : <ChevronLeft size={16} />}
            </button>
          )}
        </div>
 
        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {MENU_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl transition-all font-semibold border relative cursor-pointer group active-scale ${
                  isActive 
                    ? 'bg-bg-deep border-border/60 text-saffron shadow-sm' 
                    : 'bg-transparent border-transparent text-text-secondary hover:bg-bg-card/60 hover:text-text-primary'
                }`}
              >
                {/* Active Indicator Bar */}
                {isActive && (
                  <motion.div 
                    layoutId="activeIndicator"
                    className="absolute left-0 top-2.5 bottom-2.5 w-1 rounded-r-md bg-saffron"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}

                <div className={`flex-shrink-0 transition-colors ${isActive ? 'text-saffron' : 'text-text-muted group-hover:text-text-primary'}`}>
                  {item.icon}
                </div>
                
                {!collapsed && (
                  <div className="flex flex-col text-left min-w-0">
                    <span className="truncate tracking-wide font-tamil font-bold text-xs leading-tight">{item.name}</span>
                    <span className="text-[10px] text-text-muted font-sans font-semibold tracking-normal mt-0.5 leading-none">{item.sub}</span>
                  </div>
                )}

                {/* Collapsed Tooltip */}
                {collapsed && (
                  <div className="absolute left-16 px-2.5 py-1.5 rounded-md bg-bg-card border border-border text-xs font-extrabold text-text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-md z-50">
                    {item.name} ({item.sub})
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-border bg-bg-deep/40">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg text-white flex-shrink-0 bg-saffron shadow-sm">
                {username.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-extrabold text-sm text-text-primary truncate leading-snug">{username}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[10px] font-black uppercase text-text-muted tracking-wider leading-none">{translateLevel(level)}</span>
                </div>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-base text-white bg-saffron cursor-pointer shadow-sm active-scale" title={username}>
              {username.charAt(0).toUpperCase()}
            </div>
          )}
          {!collapsed && (
            <button 
              onClick={handleLogout}
              className="p-2 rounded-lg border border-rose/15 bg-rose/5 text-rose hover:bg-rose/10 transition-all cursor-pointer active-scale"
              title="வெளியேறு"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
