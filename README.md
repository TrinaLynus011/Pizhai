# PIZHAI (பிழை) — Tamil Pronunciation Intelligence System

> AI-powered Tamil pronunciation checker with gamified learning.

---

## 🚀 Quick Start

### Prerequisites
- **Python 3.10+**
- **Node.js 18+**

---

### 1. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux

# Install core dependencies (fast, no GPU needed)
pip install fastapi "uvicorn[standard]" python-multipart gTTS python-dotenv

# Optional: local Whisper model (downloads ~150MB, needs ffmpeg)
pip install openai-whisper torch

# Optional: OpenAI Whisper API (fastest, no local model)
copy .env.example .env        # then set OPENAI_API_KEY=sk-...

# Start the backend
uvicorn main:app --reload --port 8000
```

**Backend will be live at:** http://localhost:8000

> **STT Priority:** OpenAI API key → local `openai-whisper` model → browser Web Speech API fallback (works out of the box, no setup needed).

---

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

**Frontend will be live at:** http://localhost:5173

---

## 📁 Project Structure

```
ANtigravty/
├── backend/
│   ├── main.py              # FastAPI app — all API endpoints
│   ├── phonetic_engine.py   # Tamil phonetic alignment engine
│   ├── speech_to_text.py    # Whisper STT (API or local model)
│   ├── tts.py               # gTTS Tamil text-to-speech
│   ├── gamification.py      # XP, levels, stars, leaderboard
│   ├── requirements.txt
│   ├── .env.example
│   └── static/audio/        # Generated TTS audio files
│
└── frontend/
    ├── src/
    │   ├── App.jsx           # Main state manager + routing
    │   ├── pages/
    │   │   ├── HomePage.jsx      # Landing page
    │   │   ├── PracticePage.jsx  # Mic recording + word display
    │   │   ├── ResultPage.jsx    # Score + stars + feedback
    │   │   └── DashboardPage.jsx # XP + leaderboard
    │   ├── components/
    │   │   ├── MicButton.jsx     # Animated mic with pulse rings
    │   │   ├── StarRating.jsx    # 1–3 animated stars
    │   │   ├── XPBar.jsx         # Animated XP progress bar
    │   │   ├── LevelBadge.jsx    # Level gradient badge
    │   │   ├── MistakeCard.jsx   # Phonetic error card
    │   │   ├── AudioPlayer.jsx   # TTS playback button
    │   │   └── Confetti.jsx      # Canvas confetti for perfect score
    │   └── services/
    │       └── api.js            # All API calls to backend
    └── vite.config.js
```

---

## 🎯 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | App info + STT mode |
| GET | `/health` | Health check |
| GET | `/test-words` | Tamil practice words |
| POST | `/speech-to-text` | Audio → Tamil text (Whisper) |
| POST | `/analyze-pronunciation` | Score + mistake breakdown |
| POST | `/tts` | Tamil text → MP3 audio |
| GET | `/leaderboard` | Top users by XP |
| GET | `/user/{username}` | User XP + level |

---

## 🧠 Phonetic Error Detection

The engine detects these specific Tamil confusion pairs:

| Confused | With | Type |
|----------|------|------|
| ழ (zh)  | ல, ள | Retroflex confusion |
| ற (ṟ)  | ர    | Trill vs tap |
| ந (n)  | ன, ண | Nasal placement |

---

## 🎮 Gamification

| Score | Stars | XP Earned |
|-------|-------|-----------|
| 100   | ⭐⭐⭐ | +25 XP |
| 70–99 | ⭐⭐   | +10 XP |
| 40–69 | ⭐    | +5 XP  |
| 0–39  | —     | +2 XP  |
| Streak ≥ 3 + Good | — | +5 bonus |

**Level Tiers:** Beginner (0) → Learner (101) → Fluent (301) → Tamil Master (601+)
