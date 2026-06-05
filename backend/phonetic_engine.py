# -*- coding: utf-8 -*-
"""
Tamil Phonetic & Fluency Alignment Engine for PIZHAI
Implements grapheme-aware alignment, word-level dynamic programming alignment,
fluency analysis (WPM, pacing, pause distribution), and AI coach feedback.
"""

import re
import logging
import random
from typing import List, Optional, Dict, Any

logger = logging.getLogger(__name__)

# Tamil Unicode combining vowel sign range: U+0BBE to U+0BD7
_COMBINING_MARKS = {chr(c) for c in range(0x0BBE, 0x0BD8)}

# Phonetic confusion groups (characters that are commonly confused)
PHONETIC_GROUPS = [
    # ழ (LLLA) vs ல (LA) vs ள (LLA) — retroflex vs lateral confusion
    {"\u0BB4", "\u0BB2", "\u0BB3"},
    # ற (RRA) vs ர (RA) — retroflex r vs tap r
    {"\u0BB1", "\u0BB0"},
    # ந (NA) vs ன (NNNA) vs ண (NNA) — dental vs alveolar vs retroflex nasal
    {"\u0BA8", "\u0BA9", "\u0BA3"},
]

# Human-readable names for Tamil letters
LETTER_NAMES: Dict[str, str] = {
    "\u0BB4": "ழ (zh — retroflex lateral)",
    "\u0BB2": "ல (l — lateral)",
    "\u0BB3": "ள (ḷ — retroflex lateral)",
    "\u0BB1": "ற (ṟ — retroflex trill)",
    "\u0BB0": "ர (r — tap)",
    "\u0BA8": "ந (n — dental nasal)",
    "\u0BA9": "ன (ṉ — alveolar nasal)",
    "\u0BA3": "ண (ṇ — retroflex nasal)",
}

CONFUSION_TIPS: Dict[frozenset, str] = {
    frozenset({"\u0BB4", "\u0BB2"}): (
        "ழ is a unique Tamil retroflex sound — curl the tongue back and press the tip to the upper palate."
    ),
    frozenset({"\u0BB3", "\u0BB2"}): (
        "ள requires the tongue to touch the ridge behind the upper teeth, heavier than ல."
    ),
    frozenset({"\u0BB4", "\u0BB3"}): (
        "ழ and ள are both retroflex but ழ is more extreme — tongue curls further back."
    ),
    frozenset({"\u0BB1", "\u0BB0"}): (
        "ற is a stronger, trilled version of ர. Vibrate the tongue tip more forcefully."
    ),
    frozenset({"\u0BA8", "\u0BA9"}): (
        "ந is dental (tongue behind upper teeth); ன is alveolar (tongue at ridge)."
    ),
    frozenset({"\u0BA9", "\u0BA3"}): (
        "ன is alveolar; ண is retroflex — tongue curls back for ண."
    ),
    frozenset({"\u0BA8", "\u0BA3"}): (
        "ந is dental; ண is retroflex — significantly different tongue positions."
    ),
}

TAMIL_FILLERS = {"வந்து", "ஆ", "ம்", "உம்", "ஏ", "ஏன்"}


def split_tamil_graphemes(text: str) -> List[str]:
    """Split a Tamil string into grapheme clusters."""
    graphemes: List[str] = []
    for char in text.strip():
        if char in _COMBINING_MARKS and graphemes:
            graphemes[-1] += char
        else:
            graphemes.append(char)
    return [g for g in graphemes if g.strip()]


def _get_phonetic_group(base_char: str) -> Optional[frozenset]:
    for group in PHONETIC_GROUPS:
        if base_char in group:
            return frozenset(group)
    return None


def _classify_grapheme_pair(g_exp: str, g_usr: str) -> str:
    if g_exp == g_usr:
        return "match"

    base_exp = g_exp[0]
    base_usr = g_usr[0]
    vowel_exp = g_exp[1:]
    vowel_usr = g_usr[1:]

    group_exp = _get_phonetic_group(base_exp)
    group_usr = _get_phonetic_group(base_usr)

    if group_exp and group_usr and group_exp == group_usr and vowel_exp == vowel_usr:
        return "confusion"

    return "mismatch"


def _align_graphemes(expected: List[str], user: List[str]):
    m, n = len(expected), len(user)
    INS_COST = 0.8
    DEL_COST = 1.0

    dp = [[0.0] * (n + 1) for _ in range(m + 1)]
    parent = [[(0, 0, "init")] * (n + 1) for _ in range(m + 1)]

    for i in range(1, m + 1):
        dp[i][0] = dp[i - 1][0] + DEL_COST
        parent[i][0] = (i - 1, 0, "del")
    for j in range(1, n + 1):
        dp[0][j] = dp[0][j - 1] + INS_COST
        parent[0][j] = (0, j - 1, "ins")

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            status = _classify_grapheme_pair(expected[i - 1], user[j - 1])
            sub_cost = {"match": 0.0, "confusion": 0.35, "mismatch": 1.0}[status]

            choices = [
                (dp[i - 1][j - 1] + sub_cost, i - 1, j - 1, "sub"),
                (dp[i - 1][j] + DEL_COST, i - 1, j, "del"),
                (dp[i][j - 1] + INS_COST, i, j - 1, "ins"),
            ]
            best = min(choices, key=lambda x: x[0])
            dp[i][j] = best[0]
            parent[i][j] = (best[1], best[2], best[3])

    aligned_exp = []
    aligned_usr = []
    i, j = m, n

    while i > 0 or j > 0:
        pi, pj, op = parent[i][j]
        if op == "sub":
            aligned_exp.append(expected[i - 1])
            aligned_usr.append(user[j - 1])
        elif op == "del":
            aligned_exp.append(expected[i - 1])
            aligned_usr.append(None)
        else:  # ins
            aligned_exp.append(None)
            aligned_usr.append(user[j - 1])
        i, j = pi, pj

    aligned_exp.reverse()
    aligned_usr.reverse()
    return aligned_exp, aligned_usr, dp[m][n]


def _compute_score(cost: float, expected_len: int) -> int:
    if expected_len == 0:
        return 100
    ratio = cost / max(expected_len, 1)
    score = max(0, int((1 - ratio) * 100))
    return score


def evaluate_pronunciation(expected_text: str, user_text: str) -> Dict[str, Any]:
    """Single-word pronunciation checker using graphemic edit distance."""
    exp_g = split_tamil_graphemes(expected_text)
    usr_g = split_tamil_graphemes(user_text) if user_text.strip() else []

    if not exp_g:
        return {"score": 0, "mistakes": [], "alignment": []}

    if not usr_g:
        return {
            "score": 0,
            "mistakes": [
                {
                    "type": "no_speech",
                    "expected": expected_text,
                    "user": "",
                    "feedback": "No speech detected. Please speak clearly into the microphone.",
                    "tip": "",
                }
            ],
            "alignment": [],
        }

    aligned_exp, aligned_usr, cost = _align_graphemes(exp_g, usr_g)
    score = _compute_score(cost, len(exp_g))

    mistakes = []
    for g_exp, g_usr in zip(aligned_exp, aligned_usr):
        if g_exp is None:
            mistakes.append({
                "type": "insertion",
                "expected": "",
                "user": g_usr,
                "feedback": f"Extra sound '{g_usr}' was spoken.",
                "tip": "",
            })
        elif g_usr is None:
            mistakes.append({
                "type": "deletion",
                "expected": g_exp,
                "user": "",
                "feedback": f"Sound '{g_exp}' was omitted.",
                "tip": f"Make sure to pronounce '{g_exp}' fully.",
            })
        else:
            status = _classify_grapheme_pair(g_exp, g_usr)
            if status == "confusion":
                base_exp = g_exp[0]
                base_usr = g_usr[0]
                pair_key = frozenset({base_exp, base_usr})
                tip = CONFUSION_TIPS.get(pair_key, "Focus on correct tongue position.")
                mistakes.append({
                    "type": "phonetic_confusion",
                    "expected": g_exp,
                    "user": g_usr,
                    "feedback": f"Confused '{base_usr}' for '{base_exp}'. Expected {LETTER_NAMES.get(base_exp, base_exp)}.",
                    "tip": tip,
                })
            elif status == "mismatch":
                mistakes.append({
                    "type": "mismatch",
                    "expected": g_exp,
                    "user": g_usr,
                    "feedback": f"Expected '{g_exp}', heard '{g_usr}'.",
                    "tip": "Listen to corrected audio and try again.",
                })

    return {
        "score": score,
        "mistakes": mistakes,
        "alignment": [{"expected": e, "user": u} for e, u in zip(aligned_exp, aligned_usr)],
    }


# ─── Word-Level Reading & Fluency Engine ─────────────────────────────────────

def clean_and_split_words(text: str) -> List[str]:
    """Clean punctuation and return individual words."""
    cleaned = re.sub(r"[^\w\s\u0B80-\u0BFF]", "", text.strip())  # Preserve Tamil range
    return [w.strip() for w in cleaned.split() if w.strip()]


def _align_words(expected_words: List[str], user_words: List[str]):
    """Dynamic programming to align words in sentences."""
    m, n = len(expected_words), len(user_words)
    INS_COST = 0.8
    DEL_COST = 1.0

    dp = [[0.0] * (n + 1) for _ in range(m + 1)]
    parent = [[(0, 0, "init")] * (n + 1) for _ in range(m + 1)]

    for i in range(1, m + 1):
        dp[i][0] = dp[i - 1][0] + DEL_COST
        parent[i][0] = (i - 1, 0, "del")
    for j in range(1, n + 1):
        dp[0][j] = dp[0][j - 1] + INS_COST
        parent[0][j] = (0, j - 1, "ins")

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            w_exp = expected_words[i - 1]
            w_usr = user_words[j - 1]

            if w_exp == w_usr:
                sub_cost = 0.0
                op = "match"
            else:
                eval_res = evaluate_pronunciation(w_exp, w_usr)
                g_score = eval_res["score"]
                if g_score >= 70:
                    sub_cost = 0.35
                    op = "confusion"
                else:
                    sub_cost = 1.0
                    op = "mismatch"

            choices = [
                (dp[i - 1][j - 1] + sub_cost, i - 1, j - 1, op),
                (dp[i - 1][j] + DEL_COST, i - 1, j, "del"),
                (dp[i][j - 1] + INS_COST, i, j - 1, "ins"),
            ]
            best = min(choices, key=lambda x: x[0])
            dp[i][j] = best[0]
            parent[i][j] = (best[1], best[2], best[3])

    aligned_exp = []
    aligned_usr = []
    ops = []
    i, j = m, n
    while i > 0 or j > 0:
        pi, pj, op = parent[i][j]
        if op in ("match", "confusion", "mismatch"):
            aligned_exp.append(expected_words[i - 1])
            aligned_usr.append(user_words[j - 1])
            ops.append(op)
        elif op == "del":
            aligned_exp.append(expected_words[i - 1])
            aligned_usr.append(None)
            ops.append("del")
        else:  # ins
            aligned_exp.append(None)
            aligned_usr.append(user_words[j - 1])
            ops.append("ins")
        i, j = pi, pj

    aligned_exp.reverse()
    aligned_usr.reverse()
    ops.reverse()
    return aligned_exp, aligned_usr, ops


def evaluate_reading_fluency(
    expected_text: str,
    user_text: str,
    duration_seconds: float,
    is_document: bool = False
) -> Dict[str, Any]:
    """
    Perform a complete reading assessment: word alignment, WPM speed,
    fluency breaks, skipped/inserted words, and AI coach recommendation.
    """
    expected_words = clean_and_split_words(expected_text)
    user_words = clean_and_split_words(user_text) if user_text.strip() else []

    if not expected_words:
        return {
            "score": 0, "accuracy": 0, "fluency": 0, "wpm": 0,
            "duration": duration_seconds, "mistakes": [], "alignment": [],
            "strengths": [], "weaknesses": [], "coach_feedback": "Empty text provided."
        }

    # Safe duration
    if duration_seconds <= 0.0:
        duration_seconds = max(1.0, len(expected_words) * 0.45)

    # Calculate WPM
    wpm = int((len(user_words) / duration_seconds) * 60)

    if not user_words:
        return {
            "score": 0,
            "accuracy": 0,
            "fluency": 10,
            "wpm": 0,
            "duration": duration_seconds,
            "mistakes": [{
                "type": "no_speech",
                "expected": expected_text,
                "got": "",
                "explanation": "No spoken words were recorded.",
                "type_label": "No Speech"
            }],
            "alignment": [{"expected": w, "user": None, "type": "del"} for w in expected_words],
            "strengths": [],
            "weaknesses": ["No speech detected. Make sure your microphone is enabled."],
            "coach_feedback": "It looks like your microphone didn't record any sound. Please verify your permissions and try speaking again."
        }

    aligned_exp, aligned_usr, ops = _align_words(expected_words, user_words)

    correct_count = 0
    confusion_count = 0
    mismatch_count = 0
    skipped_count = 0
    inserted_count = 0

    mistakes = []
    alignment_details = []
    weaknesses = []

    hesitation_count = 0
    awkward_breaks = []

    # Traverse aligned words
    for idx, (w_exp, w_usr, op) in enumerate(zip(aligned_exp, aligned_usr, ops)):
        alignment_details.append({
            "expected": w_exp,
            "user": w_usr,
            "type": op
        })

        if op == "match":
            correct_count += 1
        elif op == "confusion":
            confusion_count += 1
            # Run graphemes check for specific tips
            sub_res = evaluate_pronunciation(w_exp, w_usr)
            tips = [m["tip"] for m in sub_res["mistakes"] if m.get("tip")]
            tip = tips[0] if tips else "Focus on correct retroflex tongue shape."
            mistakes.append({
                "type": "phonetic_confusion",
                "expected": w_exp,
                "got": w_usr,
                "explanation": f"Slight phonetic error pronouncing '{w_exp}' as '{w_usr}'.",
                "tip": tip
            })
            weaknesses.append(f"Mispronounced: '{w_exp}' (heard '{w_usr}')")
        elif op == "mismatch":
            mismatch_count += 1
            mistakes.append({
                "type": "mismatch",
                "expected": w_exp,
                "got": w_usr,
                "explanation": f"Expected '{w_exp}' but heard '{w_usr}'.",
                "tip": "Slowing down compound consonants will help clarify this word."
            })
            weaknesses.append(f"Incorrect: '{w_exp}' (heard '{w_usr}')")
        elif op == "del":
            skipped_count += 1
            mistakes.append({
                "type": "deletion",
                "expected": w_exp,
                "got": "—",
                "explanation": f"Skipped the word '{w_exp}'.",
                "tip": "Keep your eyes on the text to avoid omitting words."
            })
            weaknesses.append(f"Skipped word: '{w_exp}'")
        elif op == "ins":
            inserted_count += 1
            if w_usr in TAMIL_FILLERS:
                hesitation_count += 1
            mistakes.append({
                "type": "insertion",
                "expected": "—",
                "got": w_usr,
                "explanation": f"Spoke extra word/filler: '{w_usr}'.",
                "tip": "Try reading directly without filler words."
            })
            weaknesses.append(f"Extra word: '{w_usr}'")

        # Awkward break detection
        # If there's a skipped word or filler immediately separating grammar entities
        if op in ("del", "ins") and idx > 0 and idx < len(aligned_exp) - 1:
            prev_exp = aligned_exp[idx - 1]
            next_exp = aligned_exp[idx + 1]
            if prev_exp and next_exp:
                awkward_breaks.append(f"Awkward pause between '{prev_exp}' and '{next_exp}'")

    # Accuracy Score
    accuracy = int(((correct_count + 0.6 * confusion_count) / len(expected_words)) * 100)
    accuracy = max(0, min(100, accuracy))

    # Pacing Penalty
    pacing_penalty = 0
    if wpm < 85:
        pacing_penalty = int((85 - wpm) * 0.45)
    elif wpm > 165:
        pacing_penalty = int((wpm - 165) * 0.3)

    # Fluency Score
    fluency_score = 100 - (skipped_count * 8) - (inserted_count * 4) - (hesitation_count * 5) - pacing_penalty - (len(awkward_breaks) * 4)
    fluency_score = max(10, min(100, int(fluency_score)))

    # Overall Reading Score
    score = int(0.6 * accuracy + 0.4 * fluency_score)

    # Strengths
    strengths = []
    if accuracy >= 88:
        strengths.append("Excellent pronunciation and letter alignment accuracy.")
    if 90 <= wpm <= 145:
        strengths.append(f"Perfect speaking tempo and pacing flow ({wpm} WPM).")
    if fluency_score >= 82:
        strengths.append("Very fluid sentence connections and minimal pauses.")
    if not strengths:
        strengths.append("Completed the reading exercise successfully.")

    if len(awkward_breaks) > 0:
        mistakes.append({
            "type": "awkward_pause",
            "expected": "",
            "got": "",
            "explanation": "Awkward breathing pause or sentence break detected.",
            "tip": "Try grouping words into short logical phrases and breathing at punctuation marks."
        })
        weaknesses.append("Awkward phrase breaks detected.")

    # Streamed AI coach feedback
    coach_feedback = ""
    if score >= 90:
        coach_feedback = (
            f"Superb reading session! You maintained a highly fluent pace of {wpm} WPM. "
            "Your phonetic accuracy is outstanding, particularly on retroflex consonants. "
            "Keep practicing with more complex articles or historical text to test your flow."
        )
    elif score >= 75:
        coach_feedback = (
            f"Good job! Your reading speed was solid ({wpm} WPM). "
            f"Most mistakes occurred during compound combinations or tongue bends. "
            "Slowing down slightly for retroflex sounds (like ழ/ள) will boost your accuracy. "
            "Practice linking words together naturally to smooth out pauses."
        )
    else:
        coach_feedback = (
            f"A solid effort. Your pacing was {wpm} WPM. "
            "Take a deep breath and read the sentence word-by-word before recording. "
            "Focus on clear pronunciation first, then gradually build your fluency rhythm. "
            "Listen to the correct audio and try reading again."
        )

    return {
        "score": score,
        "accuracy": accuracy,
        "fluency": fluency_score,
        "wpm": wpm,
        "duration": duration_seconds,
        "mistakes": mistakes,
        "alignment": alignment_details,
        "strengths": strengths,
        "weaknesses": weaknesses[:5],  # Limit to top 5
        "coach_feedback": coach_feedback
    }
