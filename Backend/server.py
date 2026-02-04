"""
Whisper Transcription API Server
Provides audio/video transcription with language detection and SRT generation.
Optimized for fast language detection (processes first 30 seconds only for detection).
"""

import os
import tempfile
from pathlib import Path
from typing import Optional

import whisper
import numpy as np
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from healthz import router as health_router

app = FastAPI(title="Whisper Transcription API")

# Include health check router (lightweight, no heavy imports)
app.include_router(health_router)

# CORS configuration - update for production
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Allowed English language codes
ALLOWED_ENGLISH_CODES = ["en", "english"]

# Model size configuration
MODEL_SIZE = os.getenv("WHISPER_MODEL_SIZE", "base")

# Load models - tiny for fast language detection, base for transcription
print("Loading Whisper models...")
print("  - Loading 'tiny' model for fast language detection...")
detection_model = whisper.load_model("tiny")
print(f"  - Loading '{MODEL_SIZE}' model for transcription...")
transcription_model = whisper.load_model(MODEL_SIZE)
print("Models loaded successfully!")


def format_timestamp(seconds: float) -> str:
    """Convert seconds to SRT timestamp format (HH:MM:SS,mmm)"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int((seconds - int(seconds)) * 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"


def generate_srt(segments: list) -> str:
    """Generate SRT subtitle content from segments"""
    srt_lines = []
    for i, segment in enumerate(segments, 1):
        start = format_timestamp(segment["start"])
        end = format_timestamp(segment["end"])
        text = segment["text"].strip()
        srt_lines.append(f"{i}")
        srt_lines.append(f"{start} --> {end}")
        srt_lines.append(text)
        srt_lines.append("")
    return "\n".join(srt_lines).strip()


@app.get("/")
async def root():
    return {"status": "ok", "message": "Whisper Transcription API", "model": MODEL_SIZE}


def detect_language_fast(audio_path: str) -> str:
    """
    Quickly detect language using only the first 30 seconds of audio.
    Uses the tiny model for speed (~10-30 seconds detection time).
    """
    # Load audio and pad/trim to 30 seconds for fast detection
    audio = whisper.load_audio(audio_path)

    # Use only first 30 seconds (30 * 16000 samples at 16kHz)
    max_samples = 30 * 16000
    if len(audio) > max_samples:
        audio = audio[:max_samples]

    # Pad or trim to exactly 30 seconds as required by Whisper
    audio = whisper.pad_or_trim(audio)

    # Create mel spectrogram
    mel = whisper.log_mel_spectrogram(audio).to(detection_model.device)

    # Detect language
    _, probs = detection_model.detect_language(mel)
    detected_lang = max(probs, key=probs.get)

    return detected_lang


@app.post("/transcribe")
@app.post("/api/transcribe")
async def transcribe(
    file: Optional[UploadFile] = File(None),
    audio: Optional[UploadFile] = File(None),
    media: Optional[UploadFile] = File(None),
    upload: Optional[UploadFile] = File(None),
):
    """
    Transcribe audio/video file using Whisper.
    Optimized flow:
    1. Fast language detection (first 30 sec with tiny model) - ~10-30 seconds
    2. If non-English: Return immediately with detected language
    3. If English: Full transcription with base model
    """
    # Get the uploaded file from any of the possible parameter names
    uploaded_file = file or audio or media or upload

    if not uploaded_file:
        raise HTTPException(status_code=400, detail="No file provided")

    # Validate file type
    content_type = uploaded_file.content_type or ""
    filename = uploaded_file.filename or "audio"

    valid_types = [
        "audio/mpeg", "audio/wav", "audio/x-m4a", "audio/aac",
        "audio/flac", "video/mp4", "video/mp2t", "audio/mp3",
        "audio/m4a", "audio/x-wav", "video/quicktime",
        "application/octet-stream"  # Some browsers send this
    ]
    valid_extensions = [".mp3", ".wav", ".m4a", ".aac", ".flac", ".mp4", ".ts", ".mov"]

    file_ext = Path(filename).suffix.lower()
    if content_type not in valid_types and file_ext not in valid_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {content_type}. Please upload an audio or video file."
        )

    # Save uploaded file to temp location
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as tmp:
            content = await uploaded_file.read()
            tmp.write(content)
            tmp_path = tmp.name
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save uploaded file: {str(e)}")

    try:
        # STAGE 1: Fast language detection (first 30 seconds only)
        print(f"[Stage 1] Fast language detection for: {filename}")
        detected_language = detect_language_fast(tmp_path)
        print(f"[Stage 1] Detected language: {detected_language}")

        # If non-English, return immediately without full transcription
        if detected_language not in ALLOWED_ENGLISH_CODES:
            print(f"[Stage 1] Non-English detected ({detected_language}), skipping full transcription")
            return JSONResponse({
                "text": "",
                "language": detected_language,
                "segments": [],
                "srt": "",
            })

        # STAGE 2: Full transcription (only for English)
        print(f"[Stage 2] English detected, proceeding with full transcription...")
        result = transcription_model.transcribe(
            tmp_path,
            task="transcribe",
            language="en",  # Force English for better accuracy
            verbose=False,
        )

        # Extract results
        text = result.get("text", "").strip()
        language = result.get("language", detected_language)
        segments_raw = result.get("segments", [])

        # Build segments array
        segments = [
            {
                "start": seg["start"],
                "end": seg["end"],
                "text": seg["text"].strip()
            }
            for seg in segments_raw
        ]

        # Generate SRT
        srt = generate_srt(segments_raw) if segments_raw else ""

        print(f"[Stage 2] Transcription complete: {len(text)} characters, {len(segments)} segments")
        return JSONResponse({
            "text": text,
            "language": language,
            "segments": segments,
            "srt": srt,
        })

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

    finally:
        # Clean up temp file
        try:
            os.unlink(tmp_path)
        except:
            pass


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run(app, host=host, port=port)
