// pages/DocumentPracticePage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, ChevronRight, BookOpen, AlertCircle } from 'lucide-react';
import LeftSidebar from '../components/LeftSidebar.jsx';
import RightIntelligenceFeed from '../components/RightIntelligenceFeed.jsx';
import PageWrapper from '../components/PageWrapper.jsx';

export default function DocumentPracticePage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paragraphs, setParagraphs] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  function handleFileChange(e) {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) {
      setError('பதிவேற்ற ஒரு கோப்பைத் தேர்ந்தெடுக்கவும்.');
      return;
    }

    setLoading(true);
    setError('');
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
        throw new Error(data.detail || `பதிவேற்றம் தோல்வியடைந்தது: ${res.status}`);
      }

      const data = await res.json();
      
      const paras = data.text
        .split('\n\n')
        .map(p => p.trim())
        .filter(p => p.length > 5);
      
      setParagraphs(paras);
    } catch (err) {
      setError(err.message || 'உரையை மீட்டெடுக்க முடியவில்லை. மீண்டும் முயலவும்.');
    } finally {
      setLoading(false);
    }
  }

  function startParagraphPractice(paragraph) {
    navigate('/practice', { 
      state: { 
        selectedWord: paragraph,
        isDocument: true
      } 
    });
  }

  // Handle tag click inside DocumentPracticePage as well
  const handleTagClick = (tag) => {
    navigate('/dashboard', { state: { filterTag: tag } });
  };

  return (
    <PageWrapper>
      <div className="min-h-screen bg-bg-deep text-text-primary flex overflow-hidden font-sans">
        
        {/* Left Sidebar */}
        <LeftSidebar />

        {/* Workspace */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto h-screen space-y-6 max-w-5xl mx-auto">
          <div className="border-b border-border pb-3 font-tamil">
            <h2 className="font-extrabold text-2xl tracking-tight text-text-primary">📄 ஆவண வாசிப்புப் பயிற்சி</h2>
            <p className="text-xs text-text-secondary font-black tracking-wider uppercase mt-1">
              உங்களின் சொந்தத் தமிழ்க் கட்டுரைகளை அல்லது ஆவணங்களைப் பதிவேற்றி வாசித்துப் பழகவும்
            </p>
          </div>

          {/* Upload Form - LEVEL 3 dashed card style */}
          <div className="p-5 rounded-xl border border-dashed border-border bg-bg-card/45 hover:bg-bg-card/75 transition-all font-tamil">
            <form onSubmit={handleUpload} className="flex flex-col gap-4">
              <div className="border border-dashed border-border hover:border-terracotta/40 rounded-xl p-6 text-center transition-all relative cursor-pointer bg-bg-deep/45">
                <input 
                  type="file" 
                  accept=".txt,.pdf,.docx" 
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-2.5">
                  <Upload size={32} className="text-text-muted" />
                  <span className="text-sm font-extrabold text-text-primary">
                    {file ? file.name : 'PDF, Word (.docx), அல்லது Text (.txt) கோப்பைத் தேர்ந்தெடுக்கவும்'}
                  </span>
                  <span className="text-xs text-text-muted font-semibold">
                    தமிழ் மற்றும் பிற மொழிகள் அடங்கிய கோப்புகளைப் பதிவேற்றலாம் (அதிகபட்சம் 10MB)
                  </span>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-rose/10 border border-rose/20 text-rose text-xs font-bold flex items-center gap-2 leading-relaxed">
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !file}
                className="w-full py-3 rounded-xl font-sans font-black text-[#FFFCF7] bg-terracotta hover:bg-terracotta-light transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-sm hover-btn active-btn"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-[#FFFCF7] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <FileText size={16} />
                    உரையைக் கண்டறிந்து வாசிப்புப் பயிற்சியைத் தயார் செய்
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Extracted Paragraphs Display - LEVEL 2 card style */}
          {paragraphs.length > 0 && (
            <div className="space-y-4 animate-slide-up font-tamil">
              <h3 className="font-sans font-black text-[11px] tracking-widest text-text-muted uppercase border-b border-border pb-1.5">
                📝 கண்டறியப்பட்ட வாசிப்புப் பகுதிகள் ({paragraphs.length})
              </h3>
              <div className="space-y-3">
                {paragraphs.map((para, idx) => {
                  const wordsCount = para.split(' ').length;
                  const estTime = Math.max(2, Math.round(wordsCount * 0.45));
                  return (
                    <div 
                      key={idx} 
                      className="glass p-5 rounded-xl border border-border bg-bg-card flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover-lift transition-all active-btn cursor-pointer shadow-sm"
                    >
                      <div className="space-y-2 min-w-0 flex-grow flex-1">
                        <div className="flex items-center gap-3 text-[10px] text-text-muted font-bold">
                          <span className="px-2 py-0.5 rounded-lg bg-terracotta/10 text-terracotta border border-terracotta/15 uppercase font-black">
                            பகுதி {idx + 1}
                          </span>
                          <span className="flex items-center gap-1 font-semibold">
                            <BookOpen size={10} />
                            {wordsCount} சொற்கள்
                          </span>
                          <span className="font-semibold">
                            வாசிப்பு நேரம்: {estTime} விநாடிகள்
                          </span>
                        </div>
                        <p className="font-tamil font-bold text-sm text-text-secondary leading-relaxed line-clamp-3">
                          {para}
                        </p>
                      </div>
                      <button
                        onClick={() => startParagraphPractice(para)}
                        className="px-4 py-2.5 rounded-xl bg-terracotta text-[#FFFCF7] hover:bg-terracotta-light transition-all text-xs font-black flex items-center gap-1.5 cursor-pointer whitespace-nowrap hover-btn active-btn"
                      >
                        🎤 பத்தியை வாசி <ChevronRight size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </main>

        {/* Right Companion Panel */}
        <RightIntelligenceFeed onTagClick={handleTagClick} />

      </div>
    </PageWrapper>
  );
}
