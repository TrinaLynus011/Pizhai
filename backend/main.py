# -*- coding: utf-8 -*-
"""
PIZHAI — FastAPI Backend (v3)
All endpoints, CORS, JSON DB integration, referral system,
document extraction, reading fluency assessment, and live feeds.
"""

import logging
import uuid
from pathlib import Path
from typing import List, Dict, Any

from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from database import (
    LEVEL_META,
    create_user,
    get_leaderboard,
    get_user_by_id,
    get_user_by_name,
    get_level,
    update_after_attempt,
)
from gamification import calculate_stars, calculate_reading_xp, get_level_progress
from phonetic_engine import evaluate_reading_fluency, clean_and_split_words
from speech_to_text import get_stt_mode, transcribe_audio
from tts import generate_tts
from document_extractor import extract_text_from_file

# ─── Setup ────────────────────────────────────────────────────────────────────
load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("pizhai")

STATIC_DIR = Path("static")
AUDIO_DIR  = STATIC_DIR / "audio"
TEMP_DIR   = Path("temp")
AUDIO_DIR.mkdir(parents=True, exist_ok=True)
TEMP_DIR.mkdir(parents=True, exist_ok=True)

# ─── App ──────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="PIZHAI — Tamil Pronunciation & Reading Fluency System",
    description="AI-powered Tamil reading improvement ecosystem with pronunciation analysis, fluency tracking, document upload, and gamification.",
    version="3.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

# ─── Tamil reading exercises bank ──────────────────────────────────────────────
TAMIL_WORDS = [
    {"word": "தமிழ்", "transliteration": "Tamil", "difficulty": "beginner"},
    {"word": "வாழை", "transliteration": "Vaazhai", "difficulty": "beginner"},
    {"word": "கழுகு", "transliteration": "Kazhugu", "difficulty": "beginner"},
    {"word": "பழம்", "transliteration": "Pazham", "difficulty": "beginner"},
    {"word": "பள்ளி", "transliteration": "Palli", "difficulty": "intermediate"},
    {"word": "வணக்கம்", "transliteration": "Vanakkam", "difficulty": "beginner"},
    {"word": "அம்மா", "transliteration": "Amma", "difficulty": "beginner"},
    {"word": "அப்பா", "transliteration": "Appa", "difficulty": "beginner"},
    {"word": "நன்றி", "transliteration": "Nandri", "difficulty": "beginner"},
    {"word": "வாழைப்பழம்", "transliteration": "Vaazhaippazham", "difficulty": "advanced"},
    {"word": "குழந்தை", "transliteration": "Kuzhanthai", "difficulty": "intermediate"},
    {"word": "விழா", "transliteration": "Vizha", "difficulty": "intermediate"},
    {"word": "ஊஞ்சல்", "transliteration": "Oonchal", "difficulty": "intermediate"},
    {"word": "தமிழ் மொழி உலகின் மிக பழமையான மொழிகளில் ஒன்றாகும்.", "transliteration": "Tamil mozhi ulagin miga pazhamaiyaana mozhigalil ondraagum.", "difficulty": "intermediate"},
    {"word": "கல்வி கரையில கற்பவர் நாள்சில மெல்ல நினைக்கின் பிணிபல.", "transliteration": "Kalvi karaiyila karpavar naalsila mella ninaikkin pinibala.", "difficulty": "advanced"},
    {"word": "யாதும் ஊரே யாவரும் கேளிர் தீதும் நன்றும் பிறர்தர வாரா.", "transliteration": "Yaadhum oore yaavarum kelir theedhum nandrum pirardhara vaaraa.", "difficulty": "advanced"},
    {"word": "முயற்சி திருவினை ஆக்கும் முயற்றின்மை இன்மை புகுத்தி விடும்.", "transliteration": "Muyartchi thiruvinai aakkum muyarrinmai inmai puguthi vidum.", "difficulty": "advanced"}
]

# ─── Mock News Feed ───────────────────────────────────────────────────────────
MOCK_NEWS = [
    {
        "id": "news_1",
        "title": "சென்னை ஐஐடி குழுவினர் தமிழ் மொழிக்கான புதிய AI தொழில்நுட்பத்தை உருவாக்கினர்",
        "category": "தொழில்நுட்பம்",
        "timestamp": "2 நிமிடங்கள் முன்பு",
        "summary": "தமிழ் மொழியின் துல்லியமான பேச்சு மற்றும் எழுத்து வடிவங்களை பகுப்பாய்வு செய்யும் புதிய செயற்கை நுண்ணறிவு மாதிரியை சென்னை ஐஐடி வெளியிட்டுள்ளது."
    },
    {
        "id": "news_2",
        "title": "கீழடி அகழ்வாராய்ச்சியில் 2600 ஆண்டுகள் பழமையான தமிழ் பிராமி எழுத்துக்கள் கண்டெடுப்பு",
        "category": "வரலாறு",
        "timestamp": "1 மணிநேரம் முன்பு",
        "summary": "சிவகங்கை மாவட்டம் கீழடியில் நடைபெற்று வரும் அகழ்வாராய்ச்சியில் பழங்கால பானை ஓடுகளில் தமிழ் பிராமி எழுத்துக்கள் கண்டெடுக்கப்பட்டுள்ளன."
    },
    {
        "id": "news_3",
        "title": "சென்னையில் உலகத் தமிழ் இலக்கிய மாநாடு அடுத்த மாதம் பிரம்மாண்டமாகத் தொடங்குகிறது",
        "category": "இலக்கியம்",
        "timestamp": "3 மணிநேரம் முன்பு",
        "summary": "உலகெங்கிலும் உள்ள தமிழ் அறிஞர்கள் பங்குபெறும் உலகத் தமிழ் இலக்கிய மாநாடு அடுத்த மாதம் சென்னையில் கோலாகலமாகத் தொடங்க உள்ளது."
    }
]

# ─── Mock Rotating Insights ───────────────────────────────────────────────────
ROTATING_FACTS = [
    {
        "type": "word",
        "title": "இன்றைய சொல் (Today's Word)",
        "content": "மரபு (Marabu) - Tradition, heritage, cultural inheritance. தமிழர்களின் மரபுகள் தொன்மையானவை."
    },
    {
        "type": "tip",
        "title": "வாசிப்பு உதவி (Reading Tip)",
        "content": "Pause naturally at punctuation marks. நிறுத்தற்குறிகள் உள்ள இடங்களில் இயற்கையாக நிறுத்தி வாசிப்பது வாசிப்பு ஓட்டத்தை மேம்படுத்தும்."
    },
    {
        "type": "insight",
        "title": "தனிப்பட்ட அறிவுரை (Last Session Insight)",
        "content": "7 unnecessary pauses detected. Focus on maintaining sentence flow. வாசிக்கும்போது சொற்களுக்கு இடையே தேவையற்ற நிறுத்தங்களைத் தவிர்க்கவும்."
    },
    {
        "type": "thirukkural",
        "title": "திருக்குறள் (Thirukkural)",
        "content": "அகர முதல எழுத்தெல்லாம் ஆதி / பகவன் முதற்றே உலகு. எழுத்துக்கள் எல்லாம் 'அ' கரத்தை அடிப்படையாகக் கொண்டிருக்கின்றன. அதுபோல உலகம் இறைவனை அடிப்படையாகக் கொண்டது."
    },
    {
        "type": "proverb",
        "title": "பழமொழி (Tamil Proverb)",
        "content": "சித்திரமும் கைப்பழக்கம் செந்தமிழும் நாப்பழக்கம். ஓவியம் வரைய வரைய கைக்கு வசப்படுவது போல, தூய தமிழ் பேசுவது தொடர் வாசிப்பால் நாவிற்குப் பழகும்."
    },
    {
        "type": "literature",
        "title": "இலக்கியக் குறிப்பு (Literature Insight)",
        "content": "யாமறிந்த மொழிகளிலே தமிழ்மொழி போல் / இனிதாவது எங்கும் காணோம் - என்று தமிழ் மொழியின் இனிமையைப் பாடியவர் பாரதியார்."
    }
]

TRENDING_HASHTAGS = [
    {"tag": "#தமிழ்", "count": "124K பகுப்புகள்"},
    {"tag": "#இலக்கியம்", "count": "45K பகுப்புகள்"},
    {"tag": "#கல்வி", "count": "89K பகுப்புகள்"},
    {"tag": "#வரலாறு", "count": "12K பகுப்புகள்"},
    {"tag": "#அறிவியல்", "count": "34K பகுப்புகள்"},
    {"tag": "#தொழில்நுட்பம்", "count": "56K பகுப்புகள்"}
]

# ─── Schemas ──────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=24)
    referralCode: str = Field(default="")


class LoginRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=24)


class PronunciationRequest(BaseModel):
    expected_word: str
    user_text: str
    user_id: str = Field(default="")
    username: str = Field(default="Guest")
    streak: int = Field(default=0, ge=0)
    duration: float = Field(default=5.0, ge=0.0)
    is_document: bool = Field(default=False)


class TTSRequest(BaseModel):
    text: str


# ─── Meta ─────────────────────────────────────────────────────────────────────

@app.get("/", tags=["Meta"])
async def root():
    return {
        "app": "PIZHAI — Tamil Pronunciation & Reading Fluency System",
        "version": "3.0.0",
        "stt_mode": get_stt_mode(),
        "status": "running",
    }


@app.get("/health", tags=["Meta"])
async def health():
    return {"status": "ok", "stt_mode": get_stt_mode()}


# ─── Auth ─────────────────────────────────────────────────────────────────────

@app.post("/register-user", tags=["Auth"])
async def register_user(req: RegisterRequest):
    result = create_user(req.name.strip(), req.referralCode.strip())

    if not result["success"]:
        raise HTTPException(status_code=409, detail=result["error"])

    user = result["user"]
    meta = LEVEL_META.get(user["level"], {})

    return {
        "success":       True,
        "user":          user,
        "bonus_xp":      result["bonus_xp"],
        "referrer_name": result["referrer_name"],
        "level_meta":    meta,
    }


@app.post("/login", tags=["Auth"])
async def login_endpoint(req: LoginRequest):
    user = get_user_by_name(req.name.strip())
    if not user:
        raise HTTPException(status_code=404, detail="User not found. Please register first.")

    meta = LEVEL_META.get(user["level"], {})
    level_progress = get_level_progress(user.get("xp", 0))

    return {
        "success":        True,
        "user":           user,
        "level_meta":     meta,
        "level_progress": level_progress,
    }


# ─── Words ────────────────────────────────────────────────────────────────────

@app.get("/test-words", tags=["Words"])
async def get_test_words(difficulty: str = "all"):
    if difficulty == "all":
        words = TAMIL_WORDS
    else:
        words = [w for w in TAMIL_WORDS if w["difficulty"] == difficulty]
    return {"words": [w["word"] for w in words], "details": words}


# ─── STT ──────────────────────────────────────────────────────────────────────

@app.post("/speech-to-text", tags=["STT"])
async def speech_to_text_endpoint(audio: UploadFile = File(...)):
    temp_path = TEMP_DIR / f"rec_{uuid.uuid4().hex}.webm"
    try:
        with open(temp_path, "wb") as f:
            f.write(await audio.read())
        text = transcribe_audio(str(temp_path))
        return {
            "text": text,
            "success": True,
            "stt_mode": get_stt_mode(),
            "use_frontend_fallback": get_stt_mode() == "frontend_fallback",
        }
    except Exception as exc:
        logger.error(f"STT error: {exc}")
        return {"text": "", "success": False, "use_frontend_fallback": True, "error": str(exc)}
    finally:
        if temp_path.exists():
            temp_path.unlink()


# ─── Document Extractor ───────────────────────────────────────────────────────

@app.post("/document/extract", tags=["Document"])
async def extract_document_text(file: UploadFile = File(...)):
    """Upload a document (.txt, .pdf, .docx) and extract raw text content."""
    temp_path = TEMP_DIR / f"doc_{uuid.uuid4().hex}_{file.filename}"
    try:
        with open(temp_path, "wb") as f:
            f.write(await file.read())
        
        extracted_text = extract_text_from_file(str(temp_path))
        return {
            "success": True,
            "filename": file.filename,
            "text": extracted_text
        }
    except Exception as e:
        logger.error(f"Document extraction error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        if temp_path.exists():
            temp_path.unlink()


# ─── Analysis ─────────────────────────────────────────────────────────────────

@app.post("/analyze-pronunciation", tags=["Analysis"])
async def analyze_pronunciation(req: PronunciationRequest):
    """
    Pronunciation and reading fluency evaluation pipeline:
    phonetic engine -> XP calc -> DB update -> level progress
    """
    result = evaluate_reading_fluency(
        req.expected_word, req.user_text, req.duration, req.is_document
    )

    score = result["score"]
    accuracy = result["accuracy"]
    fluency = result["fluency"]
    wpm = result["wpm"]

    # Calculate XP & bonuses
    is_perfect = (accuracy == 100)
    xp_data = calculate_reading_xp(
        accuracy=accuracy,
        streak=req.streak,
        is_perfect=is_perfect,
        is_document=req.is_document
    )
    stars = calculate_stars(score)
    feedback = result["coach_feedback"]

    # Save to user history
    updated_user = None
    if req.user_id:
        updated_user = update_after_attempt(
            uid=req.user_id,
            xp_earned=xp_data["xp_earned"],
            score=score,
            accuracy=accuracy,
            fluency=fluency,
            wpm=wpm,
            duration=req.duration,
            words_count=len(clean_and_split_words(req.user_text)),
            is_document=req.is_document,
            expected_text=req.expected_word,
            user_text=req.user_text
        )

    if updated_user:
        total_xp = updated_user["xp"]
        level    = updated_user["level"]
        streak   = updated_user.get("streak", req.streak)
    else:
        # Guest fallback
        total_xp = xp_data["xp_earned"]
        level    = get_level(total_xp)
        streak   = req.streak

    level_progress = get_level_progress(total_xp)
    meta           = LEVEL_META.get(level, {})

    return {
        "score":          score,
        "accuracy":       accuracy,
        "fluency":        fluency,
        "wpm":            wpm,
        "duration":       req.duration,
        "mistakes":       result["mistakes"],
        "alignment":      result["alignment"],
        "strengths":      result["strengths"],
        "weaknesses":      result["weaknesses"],
        "stars":          stars,
        "xp_earned":      xp_data["xp_earned"],
        "xp_breakdown":   xp_data["breakdown"],
        "feedback":       feedback,
        "user": {
            "id":              req.user_id,
            "username":        req.username,
            "total_xp":        total_xp,
            "level":           level,
            "level_meta":      meta,
            "streak":          streak,
            "totalAttempts":   updated_user.get("totalAttempts", 0) if updated_user else 1,
            "averageAccuracy": updated_user.get("averageAccuracy", 0) if updated_user else accuracy,
            "averageFluency":  updated_user.get("averageFluency", 0) if updated_user else fluency,
            "averageWpm":      updated_user.get("averageWpm", 0) if updated_user else wpm,
            "wordsPracticed":  updated_user.get("wordsPracticed", 0) if updated_user else len(clean_and_split_words(req.user_text)),
            "documentsRead":   updated_user.get("documentsRead", 0) if updated_user else (1 if req.is_document else 0)
        },
        "level_progress": level_progress,
    }


# ─── TTS ──────────────────────────────────────────────────────────────────────

@app.post("/tts", tags=["TTS"])
async def text_to_speech(req: TTSRequest):
    result = generate_tts(req.text)
    if result["success"]:
        return {"audio_url": result["audio_url"], "success": True}
    raise HTTPException(status_code=500, detail=result["error"] or "TTS failed")


# ─── Live Feed ────────────────────────────────────────────────────────────────

@app.get("/news-feed", tags=["Live Feed"])
async def get_news_feed():
    return {"news": MOCK_NEWS}


@app.get("/rotating-insights", tags=["Live Feed"])
async def get_rotating_insights():
    return {
        "facts": ROTATING_FACTS,
        "trending": TRENDING_HASHTAGS
    }


# ─── Leaderboard ──────────────────────────────────────────────────────────────

@app.get("/leaderboard", tags=["Gamification"])
async def leaderboard_endpoint(limit: int = 10):
    return {"leaderboard": get_leaderboard(limit=limit)}


@app.get("/user/{user_id}", tags=["Gamification"])
async def get_user_endpoint(user_id: str):
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    meta           = LEVEL_META.get(user.get("level", "Beginner"), {})
    level_progress = get_level_progress(user.get("xp", 0))
    return {**user, "level_meta": meta, "level_progress": level_progress}
