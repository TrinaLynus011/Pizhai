// pages/RegisterPage.jsx
// Split-screen onboarding: Left Panel (Brand Story & Animations) | Right Panel (Focused Bilingual Form)
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, LogIn, Sparkles, Mic, Trophy, Zap, BookOpen } from 'lucide-react';
import { useUser } from '../context/UserContext.jsx';
import { registerUser, loginUser } from '../services/api.js';
import PageWrapper from '../components/PageWrapper.jsx';

const BG_LETTERS = ['ழ','ல','ள','ற','ர','ந','ன','ண','த','மி','க','ப','வ','ட','ஆ','இ','ஓ','ஔ'];

export default function RegisterPage() {
  const [tab, setTab] = useState('new'); // 'new' | 'returning'
  const [name, setName] = useState('');
  const [referralCode, setRefCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bonusMsg, setBonusMsg] = useState('');

  const { login } = useUser();
  const navigate   = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) { 
      setError(tab === 'new' ? 'Please enter your name. / தயவுசெய்து உங்கள் பெயரை உள்ளிடவும்.' : 'Please enter your name. / தயவுசெய்து உங்கள் பெயரை உள்ளிடவும்.'); 
      return; 
    }
    setLoading(true);
    setError('');
    setBonusMsg('');

    try {
      if (tab === 'new') {
        const res = await registerUser(name.trim(), referralCode.trim());
        if (res.bonus_xp > 0) {
          setBonusMsg(`🎉 Bonus XP! +${res.bonus_xp} XP has been awarded! / கூடுதல் போனஸ்! +${res.bonus_xp} XP உங்களுக்கு வழங்கப்பட்டது!`);
          await new Promise(r => setTimeout(r, 1400));
        }
        login(res.user);
        navigate('/dashboard');
      } else {
        const res = await loginUser(name.trim());
        login(res.user);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again. / ஏதோ தவறு நடந்துவிட்டது. மீண்டும் முயற்சிக்கவும்.');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '14px 18px',
    borderRadius: '12px',
    border: '1px solid var(--color-border)',
    background: '#FFFCF7', // Ivory card
    color: '#3B2A1F', // Deep cocoa
    fontSize: '15px',
    fontWeight: 600,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  return (
    <PageWrapper>
      <div className="min-h-screen bg-bg-deep text-text-primary grid grid-cols-12 overflow-hidden">
        
        {/* LEFT PANEL: Brand Story & Floating Glyphs (Hidden on mobile, flex on desktop) */}
        <div className="hidden lg:flex lg:col-span-7 bg-bg-mid border-r border-border flex-col justify-between p-16 relative overflow-hidden select-none">
          {/* Subtle Grid Pattern Overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-grid-pattern" style={{
            backgroundImage: 'linear-gradient(var(--color-terracotta) 1px, transparent 1px), linear-gradient(90deg, var(--color-terracotta) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />

          {/* Floating Tamil letters */}
          {BG_LETTERS.map((ch, i) => (
            <motion.span 
              key={i}
              animate={{ 
                y: [0, -12, 0], 
                x: [0, i % 2 ? 6 : -6, 0],
                rotate: [0, i % 2 ? 3 : -3, 0] 
              }}
              transition={{ 
                duration: 5.5 + i * 0.4, 
                repeat: Infinity, 
                ease: 'easeInOut', 
                delay: i * 0.15 
              }}
              className="absolute font-tamil pointer-events-none select-none font-bold"
              style={{
                fontSize: `${24 + (i * 7) % 36}px`,
                color: 'rgba(168, 93, 54, 0.04)',
                left: `${(i * 14 + 8) % 90}%`,
                top: `${(i * 19 + 6) % 86}%`,
              }}
            >
              {ch}
            </motion.span>
          ))}

          {/* Header Logo */}
          <div className="flex items-center gap-3.5 z-10">
            <img 
              src="/images/logo1.png" 
              alt="PIZHAI Logo" 
              className="w-20 h-20 object-contain" 
              onError={e => e.target.src = '/logo1.png'} 
            />
            <div className="flex flex-col">
              <span className="font-tamil text-xl text-terracotta font-black tracking-wider leading-none">பிழை (PIZHAI)</span>
              <span className="text-[9px] font-sans font-black text-text-muted uppercase tracking-widest mt-1">Read • Speak • Improve</span>
            </div>
          </div>

          {/* Story Content */}
          <div className="space-y-6 z-10 max-w-lg my-auto pr-8">
            <div className="space-y-2">
              <h2 className="text-4xl md:text-5xl font-black text-text-primary leading-tight font-tamil">
                பிழையின்றி தமிழ் பழகு
              </h2>
              <p className="text-lg font-bold text-terracotta font-sans tracking-wide">
                Learn Tamil with Confidence.
              </p>
            </div>
            
            <p className="text-sm text-text-secondary leading-relaxed font-semibold">
              Welcome to an intelligent Tamil reading sanctuary. PIZHAI is a modern learning companion designed to help you read aloud, practice pronunciation, track fluency, and reconnect with Tamil language and literature through personalized AI feedback.
            </p>

            {/* Benefit Bullets */}
            <div className="grid grid-cols-2 gap-4 pt-6">
              {[
                { icon: <Mic className="text-terracotta" size={18} />, title: 'AI Pronunciation', desc: 'உச்சரிப்பு பகுப்பாய்வு' },
                { icon: <Zap className="text-olive" size={18} />, title: 'Fluency Engine', desc: 'வாசிப்பு ஓட்ட கணக்கீடு' },
                { icon: <Trophy className="text-gold" size={18} />, title: 'Progress Badges', desc: 'கற்றல் முத்திரைகள்' },
                { icon: <BookOpen className="text-slate" size={18} />, title: 'Sanctuary Reading', desc: 'அமைதியான வாசிப்பு' }
              ].map((b, idx) => (
                <div key={idx} className="flex gap-2.5 items-start p-3 bg-bg-card/50 border border-border/40 rounded-xl hover-lift">
                  <div className="p-1.5 bg-bg-card rounded-lg border border-border/30">
                    {b.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-text-primary font-sans leading-none">{b.title}</h4>
                    <p className="text-[10px] font-bold text-text-muted font-tamil mt-1 leading-none">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer branding */}
          <div className="z-10 text-[9px] font-black text-text-muted uppercase tracking-widest">
            🌾 PIZHAI Tamil Reading Sanctuary • V5.0
          </div>
        </div>

        {/* RIGHT PANEL: Authentication Form */}
        <div className="col-span-12 lg:col-span-5 flex items-center justify-center p-6 md:p-12 bg-bg-deep relative">
          
          {/* Subtle background glow for mobile */}
          <div className="absolute w-72 h-72 rounded-full bg-terracotta/5 blur-3xl pointer-events-none lg:hidden" />

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-sm space-y-8 z-10"
          >
            {/* Header / Subtitle */}
            <div className="text-center lg:text-left space-y-3">
              {/* Mobile-only logo */}
              <div className="flex items-center gap-3.5 justify-center lg:hidden">
                <img 
                  src="/images/logo1.png" 
                  alt="PIZHAI Logo" 
                  className="w-12 h-12 object-contain" 
                  onError={e => e.target.src = '/logo1.png'} 
                />
                <div className="flex flex-col items-start">
                  <span className="font-tamil text-lg text-terracotta font-black tracking-wider leading-none">பிழை</span>
                  <span className="text-[8px] font-sans font-black text-text-muted uppercase tracking-widest mt-1">Read • Speak • Improve</span>
                </div>
              </div>
              
              <h3 className="text-2xl font-black text-text-primary leading-tight font-tamil">
                {tab === 'new' ? 'புதிய கணக்கு / Create Account' : 'உள்நுழை / Welcome Back'}
              </h3>
              <p className="text-xs text-text-secondary font-bold font-tamil leading-relaxed">
                {tab === 'new' 
                  ? 'Start your Tamil learning journey. / உங்கள் தமிழ் பயணத்தை தொடங்குங்கள்.'
                  : 'Continue your Tamil learning journey. / உங்கள் தமிழ் பயணத்தை தொடருங்கள்.'}
              </p>
            </div>

            {/* Bilingual Tab Switcher */}
            <div className="flex bg-bg-mid border border-border p-1 rounded-xl">
              <button 
                onClick={() => { setTab('new'); setError(''); }}
                className={`flex-1 py-2.5 rounded-lg border-none cursor-pointer font-bold text-xs flex items-center justify-center gap-1.5 transition-all active-btn ${
                  tab === 'new' 
                    ? 'bg-terracotta text-white shadow-sm' 
                    : 'bg-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                <UserPlus size={14} />
                <span>புதிய கணக்கு / Create</span>
              </button>
              
              <button 
                onClick={() => { setTab('returning'); setError(''); }}
                className={`flex-1 py-2.5 rounded-lg border-none cursor-pointer font-bold text-xs flex items-center justify-center gap-1.5 transition-all active-btn ${
                  tab === 'returning' 
                    ? 'bg-terracotta text-white shadow-sm' 
                    : 'bg-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                <LogIn size={14} />
                <span>உள்நுழை / Sign In</span>
              </button>
            </div>

            {/* Onboarding Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Name Field */}
              <div className="space-y-2">
                <div className="flex justify-between text-[11px] font-black text-text-secondary uppercase tracking-wider">
                  <span>Student Name / உங்கள் பெயர்</span>
                  <span className="text-terracotta font-sans">* required</span>
                </div>
                <input
                  id="username-input"
                  type="text"
                  placeholder="Enter name / உங்கள் பெயரை உள்ளிடவும்..."
                  value={name}
                  onChange={e => { setName(e.target.value); setError(''); }}
                  maxLength={24}
                  style={inputStyle}
                  autoFocus
                />
              </div>

              {/* Referral Code Field */}
              <AnimatePresence>
                {tab === 'new' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2 overflow-hidden"
                  >
                    <div className="flex justify-between text-[11px] font-black text-text-secondary uppercase tracking-wider mt-1">
                      <span>Referral Code / பரிந்துரை குறியீடு</span>
                      <span className="text-text-muted font-sans font-bold">optional</span>
                    </div>
                    <input
                      id="referral-input"
                      type="text"
                      placeholder="PIZHAI-XXXXX..."
                      value={referralCode}
                      onChange={e => setRefCode(e.target.value.toUpperCase())}
                      maxLength={20}
                      style={{ ...inputStyle, fontFamily: 'monospace', letterSpacing: '0.05em' }}
                    />
                    <p className="text-[10px] text-text-muted font-bold font-tamil leading-relaxed mt-1">
                      Enter code for +20 bonus XP! / கூடுதல் +20 XP பெற பரிந்துரைக் குறியீட்டை உள்ளிடவும்.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error messages */}
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -6 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0 }}
                    className="p-3.5 rounded-xl bg-rose/5 border border-rose/15 text-rose text-xs font-bold font-tamil leading-relaxed"
                  >
                    ⚠️ {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bonus notification */}
              <AnimatePresence>
                {bonusMsg && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    exit={{ opacity: 0 }}
                    className="p-3 rounded-xl bg-gold/5 border border-gold/15 text-gold text-xs font-bold text-center font-tamil"
                  >
                    {bonusMsg}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Action Button */}
              <motion.button
                id="auth-submit-btn"
                type="submit"
                disabled={loading}
                whileHover={!loading ? { scale: 1.01 } : {}}
                whileTap={!loading ? { scale: 0.99 } : {}}
                className={`w-full py-3.5 rounded-xl border-none font-bold text-sm text-white flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active-btn hover-btn ${
                  loading ? 'bg-border text-text-muted' : 'bg-terracotta hover:bg-terracotta-light'
                }`}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : tab === 'new' ? (
                  <>
                    <UserPlus size={16} />
                    <span>தொடங்கு / Get Started</span>
                  </>
                ) : (
                  <>
                    <LogIn size={16} />
                    <span>உள்நுழை / Sign In</span>
                  </>
                )}
              </motion.button>

            </form>

            <div className="text-center font-tamil text-[10px] text-text-muted font-bold tracking-wide">
              No passwords required • Demo Sandbox Mode / கடவுச்சொல் தேவையில்லை • டெமோ தளம்
            </div>

          </motion.div>

        </div>

      </div>
    </PageWrapper>
  );
}
