# -*- coding: utf-8 -*-
"""
Text-to-Speech module for PIZHAI.
Uses gTTS (Google TTS) to synthesize Tamil speech.
Audio files are saved to /static/audio/ and served as static files.
"""

import logging
import uuid
from pathlib import Path

logger = logging.getLogger(__name__)

AUDIO_DIR = Path("static") / "audio"


def _ensure_audio_dir() -> None:
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)


def generate_tts(text: str, output_path: str | None = None) -> dict:
    """
    Generate Tamil TTS audio from text using gTTS.

    Args:
        text: Tamil text to synthesize.
        output_path: Optional explicit output file path.
                     If None, a UUID-named file is created in AUDIO_DIR.

    Returns:
        dict with keys:
          - success (bool)
          - file_path (str | None)
          - audio_url (str | None)  — relative URL to serve
          - error (str | None)
    """
    _ensure_audio_dir()

    if output_path is None:
        filename = f"tts_{uuid.uuid4().hex[:10]}.mp3"
        file_path = AUDIO_DIR / filename
    else:
        file_path = Path(output_path)
        filename = file_path.name

    try:
        from gtts import gTTS  # type: ignore

        tts = gTTS(text=text, lang="ta", slow=False)
        tts.save(str(file_path))

        logger.info(f"TTS generated: {file_path}")
        return {
            "success": True,
            "file_path": str(file_path),
            "audio_url": f"/static/audio/{filename}",
            "error": None,
        }

    except ImportError:
        msg = "gTTS not installed. Run: pip install gTTS"
        logger.error(msg)
        return {"success": False, "file_path": None, "audio_url": None, "error": msg}

    except Exception as exc:
        msg = f"TTS generation failed: {exc}"
        logger.error(msg)
        return {"success": False, "file_path": None, "audio_url": None, "error": msg}
