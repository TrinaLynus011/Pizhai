# -*- coding: utf-8 -*-
"""
JSON file-based database for PIZHAI.
Handles all user CRUD, referral system, streaks, and leaderboard.
No SQL — pure JSON persistence.
"""

import json
import logging
import random
import string
from datetime import date, timedelta
from pathlib import Path
from typing import Optional, List, Dict, Any

logger = logging.getLogger(__name__)

DB_FILE = Path("database.json")

LEVEL_THRESHOLDS = [
    (700, "Tamil Master"),
    (300, "Fluent"),
    (100, "Learner"),
    (0,   "Beginner"),
]

LEVEL_META = {
    "Beginner":     {"emoji": "🌱", "color": "#6EE7B7", "next": 100},
    "Learner":      {"emoji": "📚", "color": "#60A5FA", "next": 300},
    "Fluent":       {"emoji": "🗣️",  "color": "#C084FC", "next": 700},
    "Tamil Master": {"emoji": "🏆", "color": "#FBBF24", "next": None},
}


# ─── Helpers ──────────────────────────────────────────────────────────────────

def get_level(xp: int) -> str:
    for threshold, lvl in LEVEL_THRESHOLDS:
        if xp >= threshold:
            return lvl
    return "Beginner"


def _init():
    if not DB_FILE.exists():
        _save({"users": []})


def _migrate_user_schema(user: dict) -> tuple:
    updated = False
    defaults = {
        "totalAccuracySum": user.get("totalAccuracySum", user.get("totalAttempts", 0) * user.get("averageAccuracy", 0)),
        "averageAccuracy": user.get("averageAccuracy", 0),
        "totalFluencySum": user.get("totalFluencySum", 0),
        "averageFluency": user.get("averageFluency", 0),
        "totalWpmSum": user.get("totalWpmSum", 0),
        "averageWpm": user.get("averageWpm", 0),
        "totalReadingTime": user.get("totalReadingTime", 0.0),
        "wordsPracticed": user.get("wordsPracticed", 0),
        "documentsRead": user.get("documentsRead", 0),
        "highestScore": user.get("highestScore", 0),
        "lowestScore": user.get("lowestScore", 0),
        "attempts_history": user.get("attempts_history", []),
    }
    for k, v in defaults.items():
        if k not in user:
            user[k] = v
            updated = True
    return user, updated


def _load() -> dict:
    _init()
    try:
        with open(DB_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            dirty = False
            for u in data.get("users", []):
                _, updated = _migrate_user_schema(u)
                if updated:
                    dirty = True
            if dirty:
                _save(data)
            return data
    except (json.JSONDecodeError, IOError):
        return {"users": []}


def _save(data: dict):
    try:
        with open(DB_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    except IOError as e:
        logger.error(f"DB save failed: {e}")


def _new_user_id() -> str:
    return "user_" + "".join(random.choices(string.digits, k=6))


def _referral_code(name: str, uid: str) -> str:
    alpha = "".join(c for c in name.upper() if c.isalpha())[:5].ljust(5, "X")
    tail  = uid[-3:].upper()
    return f"PIZHAI-{alpha}{tail}"


# ─── Public API ───────────────────────────────────────────────────────────────

def create_user(name: str, referral_code: str = "") -> dict:
    """
    Register a new user.
    Returns {success, user, bonus_xp, referrer_name, error}
    """
    db = _load()

    # Username uniqueness
    if any(u["name"].lower() == name.lower() for u in db["users"]):
        return {"success": False, "error": "Username already taken", "user": None,
                "bonus_xp": 0, "referrer_name": None}

    uid = _new_user_id()
    while any(u["id"] == uid for u in db["users"]):
        uid = _new_user_id()

    today = date.today().isoformat()
    user = {
        "id":            uid,
        "name":          name,
        "xp":            0,
        "level":         "Beginner",
        "streak":        1,
        "referralCode":  _referral_code(name, uid),
        "referredBy":    "",
        "totalAttempts": 0,
        "totalAccuracySum": 0,
        "averageAccuracy": 0,
        "totalFluencySum": 0,
        "averageFluency": 0,
        "totalWpmSum": 0,
        "averageWpm": 0,
        "totalReadingTime": 0.0,
        "wordsPracticed": 0,
        "documentsRead": 0,
        "highestScore": 0,
        "lowestScore": 0,
        "attempts_history": [],
        "lastActiveDate": today,
        "createdAt":     today,
    }

    bonus_xp    = 0
    referrer_nm = None

    if referral_code.strip():
        ref_code = referral_code.strip()
        referrer = next(
            (u for u in db["users"] if u.get("referralCode") == ref_code),
            None
        )
        if referrer:
            user["referredBy"]  = ref_code
            user["xp"]          = 20      # new-user join bonus
            bonus_xp            = 20
            referrer["xp"]      = referrer.get("xp", 0) + 50  # referrer bonus
            referrer["level"]   = get_level(referrer["xp"])
            referrer_nm         = referrer["name"]

    user["level"] = get_level(user["xp"])
    db["users"].append(user)
    _save(db)

    return {
        "success":      True,
        "user":         user,
        "bonus_xp":     bonus_xp,
        "referrer_name": referrer_nm,
        "error":        None,
    }


def get_user_by_name(name: str) -> Optional[dict]:
    db = _load()
    user = next((u for u in db["users"] if u["name"].lower() == name.lower()), None)
    if user:
        _migrate_user_schema(user)
    return user


def get_user_by_id(uid: str) -> Optional[dict]:
    db = _load()
    user = next((u for u in db["users"] if u["id"] == uid), None)
    if user:
        _migrate_user_schema(user)
    return user


def update_after_attempt(
    uid: str,
    xp_earned: int,
    score: int = 0,
    accuracy: Optional[int] = None,
    fluency: Optional[int] = None,
    wpm: Optional[int] = None,
    duration: float = 0.0,
    words_count: int = 0,
    is_document: bool = False,
    expected_text: str = "",
    user_text: str = ""
) -> Optional[dict]:
    """Add XP, update streak/level/attempts/accuracy/fluency/WPM. Returns updated user."""
    db = _load()
    user = next((u for u in db["users"] if u["id"] == uid), None)
    if not user:
        return None

    _migrate_user_schema(user)

    today     = date.today()
    today_str = today.isoformat()
    last_str  = user.get("lastActiveDate", "")

    # Streak
    if last_str:
        try:
            last = date.fromisoformat(last_str)
            if last == today:
                pass                                                 # same day
            elif last == today - timedelta(days=1):
                user["streak"] = user.get("streak", 0) + 1          # consecutive
            else:
                user["streak"] = 1                                   # gap — reset
        except ValueError:
            user["streak"] = 1
    else:
        user["streak"] = 1

    # Apply defaults if none
    final_acc = accuracy if accuracy is not None else score
    final_flu = fluency if fluency is not None else score
    final_wpm = wpm if wpm is not None else 0

    # Record history
    history_entry = {
        "timestamp": today_str,
        "expected_text": expected_text,
        "user_text": user_text,
        "score": score,
        "accuracy": final_acc,
        "fluency": final_flu,
        "wpm": final_wpm,
        "duration": duration,
        "xp_earned": xp_earned,
        "words_count": words_count,
        "is_document": is_document
    }
    user["attempts_history"].append(history_entry)

    # Update counts
    user["totalAttempts"] = user.get("totalAttempts", 0) + 1
    user["xp"]            = user.get("xp", 0) + xp_earned
    user["level"]         = get_level(user["xp"])
    
    user["totalAccuracySum"] = user.get("totalAccuracySum", 0) + final_acc
    user["averageAccuracy"] = int(user["totalAccuracySum"] / user["totalAttempts"])

    user["totalFluencySum"] = user.get("totalFluencySum", 0) + final_flu
    user["averageFluency"] = int(user["totalFluencySum"] / user["totalAttempts"])

    user["totalWpmSum"] = user.get("totalWpmSum", 0) + final_wpm
    user["averageWpm"] = int(user["totalWpmSum"] / user["totalAttempts"])

    user["totalReadingTime"] = user.get("totalReadingTime", 0.0) + duration
    user["wordsPracticed"] = user.get("wordsPracticed", 0) + words_count
    
    if is_document:
        user["documentsRead"] = user.get("documentsRead", 0) + 1

    # High / Low
    user["highestScore"] = max(user.get("highestScore", 0), score)
    if user["totalAttempts"] == 1:
        user["lowestScore"] = score
    else:
        user["lowestScore"] = min(user.get("lowestScore", 100), score)

    user["lastActiveDate"] = today_str

    _save(db)
    return user


def get_leaderboard(limit: int = 10) -> list:
    db = _load()
    ranked = sorted(db["users"], key=lambda u: u.get("xp", 0), reverse=True)
    out = []
    for i, u in enumerate(ranked[:limit]):
        meta = LEVEL_META.get(u.get("level", "Beginner"), {})
        out.append({
            "rank":   i + 1,
            "id":     u["id"],
            "name":   u["name"],
            "xp":     u.get("xp", 0),
            "level":  u.get("level", "Beginner"),
            "emoji":  meta.get("emoji", "🌱"),
            "color":  meta.get("color", "#6EE7B7"),
            "streak": u.get("streak", 0),
        })
    return out
