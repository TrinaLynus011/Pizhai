# -*- coding: utf-8 -*-
"""
Gamification engine for PIZHAI.
Handles XP, levels, stars, streaks, and leaderboard persistence.
"""

import os
import json
import logging
from pathlib import Path
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

LEADERBOARD_FILE = Path(os.getenv("LEADERBOARD_PATH", "leaderboard.json"))

# Level definitions (ordered by min XP ascending)
LEVELS = [
    {"name": "Beginner",     "min_xp": 0,   "max_xp": 100,  "emoji": "🌱", "color": "#6EE7B7"},
    {"name": "Learner",      "min_xp": 101,  "max_xp": 300,  "emoji": "📚", "color": "#60A5FA"},
    {"name": "Fluent",       "min_xp": 301,  "max_xp": 700,  "emoji": "🗣️", "color": "#C084FC"},
    {"name": "Tamil Master", "min_xp": 701,  "max_xp": 99999, "emoji": "🏆", "color": "#FBBF24"},
]


def get_level_info(xp: int) -> Dict[str, Any]:
    """Return the level info dict for a given XP total."""
    for level in reversed(LEVELS):
        if xp >= level["min_xp"]:
            return level
    return LEVELS[0]


def get_level_progress(xp: int) -> Dict[str, Any]:
    """Return progress info: current level, next level, percent to next."""
    current = get_level_info(xp)
    idx = LEVELS.index(current)
    if idx < len(LEVELS) - 1:
        next_level = LEVELS[idx + 1]
        range_size = next_level["min_xp"] - current["min_xp"]
        earned = xp - current["min_xp"]
        percent = min(100, int((earned / range_size) * 100))
        xp_to_next = next_level["min_xp"] - xp
    else:
        next_level = None
        percent = 100
        xp_to_next = 0

    return {
        "current_level": current,
        "next_level": next_level,
        "percent": percent,
        "xp_to_next": xp_to_next,
    }


def calculate_stars(score: int) -> int:
    """Map score to 0-3 stars."""
    if score == 100:
        return 3
    elif score >= 70:
        return 2
    elif score >= 40:
        return 1
    return 0


def calculate_reading_xp(accuracy: int, streak: int, is_perfect: bool = False, is_document: bool = False) -> Dict[str, Any]:
    """
    Calculate XP earned for an attempt based on accuracy and bonuses:
      - Accuracy > 90%: +100 XP
      - Accuracy 80-90%: +75 XP
      - Accuracy 70-80%: +50 XP
      - Accuracy < 70%: +25 XP
      
      Bonuses:
      - Daily streak (streak >= 3): +20 XP
      - Perfect Pronunciation (is_perfect): +50 XP
      - Document completion (is_document): +30 XP
    """
    breakdown = []
    
    if accuracy >= 90:
        base_xp = 100
        breakdown.append({"reason": "Excellent Accuracy (>90%)", "xp": 100})
    elif accuracy >= 80:
        base_xp = 75
        breakdown.append({"reason": "Good Accuracy (80-90%)", "xp": 75})
    elif accuracy >= 70:
        base_xp = 50
        breakdown.append({"reason": "Average Accuracy (70-80%)", "xp": 50})
    else:
        base_xp = 25
        breakdown.append({"reason": "Reading Attempted (<70%)", "xp": 25})
        
    bonus_xp = 0
    if streak >= 3:
        bonus_xp += 20
        breakdown.append({"reason": f"🔥 Active Streak Bonus (Day {streak})", "xp": 20})
        
    if is_perfect:
        bonus_xp += 50
        breakdown.append({"reason": "🏆 Perfect Pronunciation Bonus", "xp": 50})
        
    if is_document:
        bonus_xp += 30
        breakdown.append({"reason": "📄 Document Completion Bonus", "xp": 30})
        
    total = base_xp + bonus_xp
    return {"xp_earned": total, "breakdown": breakdown}


def get_feedback_message(score: int, stars: int, streak: int) -> str:
    """Return a motivational feedback string."""
    if score == 100:
        msgs = [
            "🎉 Flawless! You sound like a native Tamil speaker!",
            "🏆 Perfect pronunciation! Incredible Tamil mastery!",
            "✨ Outstanding! That was textbook Tamil!",
        ]
        import random
        return random.choice(msgs)
    elif score >= 70:
        if streak >= 3:
            return f"🔥 Great job! Keep that {streak}-day streak going!"
        return "✅ Well done! Your pronunciation is on point."
    elif score >= 40:
        return "⚠️ Getting there! Focus on the highlighted sounds and try again."
    else:
        return "❌ Don't give up! Listen to the correct pronunciation and retry."


# ─── Leaderboard ─────────────────────────────────────────────────────────────


def _load_leaderboard() -> List[Dict]:
    if LEADERBOARD_FILE.exists():
        try:
            with open(LEADERBOARD_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            pass
    return []


def _save_leaderboard(data: List[Dict]) -> None:
    try:
        with open(LEADERBOARD_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    except IOError as e:
        logger.error(f"Failed to save leaderboard: {e}")


def update_leaderboard(username: str, xp_earned: int) -> Dict[str, Any]:
    """Add XP to user on leaderboard and persist. Returns updated user record."""
    data = _load_leaderboard()
    user = next((u for u in data if u["username"] == username), None)

    if user is None:
        user = {"username": username, "xp": 0, "streak": 0, "attempts": 0}
        data.append(user)

    user["xp"] = user.get("xp", 0) + xp_earned
    user["attempts"] = user.get("attempts", 0) + 1

    level = get_level_info(user["xp"])
    user["level"] = level["name"]
    user["level_emoji"] = level["emoji"]
    user["level_color"] = level["color"]

    data.sort(key=lambda u: u["xp"], reverse=True)
    _save_leaderboard(data)
    return user


def get_leaderboard(limit: int = 10) -> List[Dict]:
    """Return top N users sorted by XP."""
    data = _load_leaderboard()
    # Add rank
    for idx, user in enumerate(data[:limit]):
        user["rank"] = idx + 1
    return data[:limit]
