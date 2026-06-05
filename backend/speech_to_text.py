# -*- coding: utf-8 -*-
"""
Speech-to-Text module for PIZHAI.
Loads Whisper model ONCE globally at module import time.
Falls back gracefully: OpenAI API → Local Whisper → Empty string (browser STT handles it)
"""

import os
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

# ─── Global model state ───────────────────────────────────────────────────────
_whisper_model = None   # Local whisper.Model instance
_use_openai_api = False  # Use OpenAI Whisper API

# ─── Load once at startup ─────────────────────────────────────────────────────


def _initialize():
    global _whisper_model, _use_openai_api

    # Check for OpenAI API key first (preferred — faster, no local GPU needed)
    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if api_key and api_key != "your_openai_api_key_here":
        logger.info("✅ OPENAI_API_KEY found — Whisper API mode enabled.")
        _use_openai_api = True
        return

    # Try loading local openai-whisper model
    try:
        import whisper  # type: ignore
        logger.info("⏳ Loading local Whisper model (base)... this may take 30s on first run.")
        _whisper_model = whisper.load_model("base")
        logger.info("✅ Local Whisper model loaded successfully.")
    except ImportError:
        logger.warning(
            "⚠️  openai-whisper not installed. "
            "Install it with: pip install openai-whisper\n"
            "   Falling back to frontend Web Speech API."
        )
    except Exception as exc:
        logger.warning(
            f"⚠️  Failed to load local Whisper model: {exc}\n"
            "   Falling back to frontend Web Speech API."
        )


# Run initialization at import time (once per process)
_initialize()


# ─── Public API ───────────────────────────────────────────────────────────────


def transcribe_audio(audio_path: str) -> str:
    """
    Transcribe an audio file to Tamil text.

    Priority:
    1. OpenAI Whisper API (if OPENAI_API_KEY is set)
    2. Local openai-whisper model (if installed and loaded)
    3. Returns empty string (frontend falls back to Web Speech API)
    """

    # --- Option 1: OpenAI API ---
    if _use_openai_api:
        try:
            from openai import OpenAI  # type: ignore

            client = OpenAI()
            with open(audio_path, "rb") as f:
                result = client.audio.transcriptions.create(
                    model="whisper-1",
                    file=f,
                    language="ta",
                    response_format="text",
                )
            text = result.strip() if isinstance(result, str) else result.text.strip()
            logger.info(f"[Whisper API] Transcribed: {text!r}")
            return text
        except Exception as exc:
            logger.error(f"OpenAI Whisper API failed: {exc}")

    # --- Option 2: Local Whisper ---
    if _whisper_model is not None:
        try:
            result = _whisper_model.transcribe(
                audio_path,
                language="ta",
                task="transcribe",
                fp16=False,  # Safe for CPU
            )
            text = result["text"].strip()
            logger.info(f"[Local Whisper] Transcribed: {text!r}")
            return text
        except Exception as exc:
            logger.error(f"Local Whisper transcription failed: {exc}")

    # --- Option 3: Graceful fallback ---
    logger.warning("No STT backend available — returning empty string for frontend fallback.")
    return ""


def get_stt_mode() -> str:
    """Return a string describing the active STT mode (for /health endpoint)."""
    if _use_openai_api:
        return "openai_api"
    if _whisper_model is not None:
        return "local_whisper"
    return "frontend_fallback"
