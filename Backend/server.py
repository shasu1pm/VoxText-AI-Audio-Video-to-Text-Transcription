"""
VOSK Transcription API Server
Provides audio/video transcription with language detection and SRT generation.
Fully offline - no external API calls required.
"""

# CRITICAL: Set HuggingFace env vars BEFORE any imports
# This must be at the very top to avoid Windows symlink permission errors
import os
os.environ["HF_HUB_DISABLE_SYMLINKS"] = "1"
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"

import json
import wave
import tempfile
import subprocess
from pathlib import Path
from typing import Optional, Tuple

from vosk import Model, KaldiRecognizer, SetLogLevel
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from healthz import router as health_router

# Suppress VOSK logging (set to 0 for normal, -1 for silent)
SetLogLevel(-1)

app = FastAPI(title="VOSK Transcription API")

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

# Allowed English language codes (must match frontend expectations)
ALLOWED_ENGLISH_CODES = ["en", "english"]

# Language detection settings (override via env for low-RAM mode)
DETECTION_DURATION_SECONDS = int(os.getenv("DETECTION_DURATION_SECONDS", "15"))

# Low-RAM mode (skip heavy language ID model)
LOW_RAM_MODE = os.getenv("LOW_RAM_MODE", "0").lower() in ("1", "true", "yes")

# Upload limits and streaming settings
MAX_UPLOAD_MB = int(os.getenv("MAX_UPLOAD_MB", "200"))
MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024
UPLOAD_CHUNK_SIZE = int(os.getenv("UPLOAD_CHUNK_SIZE", str(1024 * 1024)))  # 1 MB

# Model path configuration
MODEL_PATH = os.getenv("VOSK_MODEL_PATH", os.path.join(os.path.dirname(__file__), "model"))

# Global model references (loaded lazily)
_vosk_model = None
_lang_id_model = None

# Language name mapping for user-friendly display
LANGUAGE_NAMES = {
    "en": "English",
    "es": "Spanish",
    "fr": "French",
    "de": "German",
    "it": "Italian",
    "pt": "Portuguese",
    "ru": "Russian",
    "zh": "Chinese",
    "ja": "Japanese",
    "ko": "Korean",
    "ar": "Arabic",
    "hi": "Hindi",
    "ta": "Tamil",
    "te": "Telugu",
    "bn": "Bengali",
    "mr": "Marathi",
    "gu": "Gujarati",
    "kn": "Kannada",
    "ml": "Malayalam",
    "pa": "Punjabi",
    "ur": "Urdu",
    "vi": "Vietnamese",
    "th": "Thai",
    "tr": "Turkish",
    "pl": "Polish",
    "nl": "Dutch",
    "sv": "Swedish",
    "da": "Danish",
    "no": "Norwegian",
    "fi": "Finnish",
    "el": "Greek",
    "he": "Hebrew",
    "id": "Indonesian",
    "ms": "Malay",
    "tl": "Filipino",
    "sw": "Swahili",
    "uk": "Ukrainian",
    "cs": "Czech",
    "ro": "Romanian",
    "hu": "Hungarian",
    "bg": "Bulgarian",
    "hr": "Croatian",
    "sk": "Slovak",
    "sl": "Slovenian",
    "lt": "Lithuanian",
    "lv": "Latvian",
    "et": "Estonian",
    "fa": "Persian",
    "af": "Afrikaans",
    "cy": "Welsh",
    "so": "Somali",
    "ca": "Catalan",
    "eu": "Basque",
    "gl": "Galician",
}


def get_vosk_model():
    """Load VOSK model lazily on first use."""
    global _vosk_model
    if _vosk_model is None:
        if not os.path.exists(MODEL_PATH):
            raise RuntimeError(
                f"VOSK model not found at {MODEL_PATH}. "
                "Please download the model first. See README for instructions."
            )
        print(f"Loading VOSK model from: {MODEL_PATH}")
        _vosk_model = Model(MODEL_PATH)
        print("VOSK model loaded successfully!")
    return _vosk_model


def _patch_symlink_for_windows():
    """Patch os.symlink to use copy on Windows when symlinks fail."""
    import shutil
    _original_symlink = os.symlink

    def _safe_symlink(src, dst, target_is_directory=False):
        try:
            _original_symlink(src, dst, target_is_directory)
        except OSError:
            # Symlink failed, use copy instead
            if os.path.isdir(src):
                if os.path.exists(dst):
                    shutil.rmtree(dst)
                shutil.copytree(src, dst)
            else:
                shutil.copy2(src, dst)

    os.symlink = _safe_symlink


def get_lang_id_model():
    """Load SpeechBrain language identification model lazily."""
    global _lang_id_model
    if LOW_RAM_MODE:
        # Skip heavy model to keep RAM usage low
        return None
    if _lang_id_model is None:
        try:
            # Suppress warnings
            import warnings
            warnings.filterwarnings("ignore", category=UserWarning)
            warnings.filterwarnings("ignore", category=FutureWarning)

            # Patch symlink for Windows compatibility
            _patch_symlink_for_windows()

            # Import torch first
            import torch

            # Patch torchaudio for compatibility with newer versions
            import torchaudio
            if not hasattr(torchaudio, 'list_audio_backends'):
                torchaudio.list_audio_backends = lambda: ['soundfile']

            # Now import speechbrain
            from speechbrain.inference.classifiers import EncoderClassifier

            print("Loading SpeechBrain language identification model...")
            print("(First run will download ~90MB model, please wait...)")

            save_dir = os.path.join(os.path.expanduser("~"), ".speechbrain", "lang-id")
            os.makedirs(save_dir, exist_ok=True)

            _lang_id_model = EncoderClassifier.from_hparams(
                source="speechbrain/lang-id-voxlingua107-ecapa",
                savedir=save_dir,
                run_opts={"device": "cpu"}
            )
            print("Language ID model loaded successfully!")
        except Exception as e:
            print(f"Failed to load language ID model: {e}")
            print("Will use fallback detection method.")
            _lang_id_model = None
    return _lang_id_model


async def save_upload_to_temp(uploaded_file: UploadFile, suffix: str) -> str:
    """Stream upload to disk to avoid loading the whole file into RAM."""
    size = 0
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        while True:
            chunk = await uploaded_file.read(UPLOAD_CHUNK_SIZE)
            if not chunk:
                break
            size += len(chunk)
            if size > MAX_UPLOAD_BYTES:
                tmp.close()
                os.unlink(tmp.name)
                raise HTTPException(
                    status_code=413,
                    detail=f"File exceeds {MAX_UPLOAD_MB} MB limit."
                )
            tmp.write(chunk)
        tmp_path = tmp.name
    await uploaded_file.close()
    return tmp_path


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
        if text:  # Only include non-empty segments
            srt_lines.append(f"{i}")
            srt_lines.append(f"{start} --> {end}")
            srt_lines.append(text)
            srt_lines.append("")
    return "\n".join(srt_lines).strip()


def convert_to_wav(input_path: str, output_path: str, duration: int = None) -> bool:
    """
    Convert audio/video file to WAV PCM 16kHz mono using FFmpeg.
    If duration is specified, only convert that many seconds.
    Returns True on success, False on failure.
    """
    try:
        cmd = [
            "ffmpeg",
            "-y",  # Overwrite output
            "-i", input_path,
        ]

        # Add duration limit if specified
        if duration:
            cmd.extend(["-t", str(duration)])

        cmd.extend([
            "-ar", "16000",  # 16kHz sample rate (required by VOSK)
            "-ac", "1",  # Mono
            "-f", "wav",  # WAV format
            "-acodec", "pcm_s16le",  # PCM 16-bit little-endian
            output_path
        ])

        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=300  # 5 minute timeout
        )
        return result.returncode == 0
    except subprocess.TimeoutExpired:
        print("FFmpeg conversion timed out")
        return False
    except FileNotFoundError:
        print("FFmpeg not found. Please install FFmpeg.")
        return False
    except Exception as e:
        print(f"FFmpeg error: {e}")
        return False


def detect_language_from_audio(wav_path: str) -> Tuple[str, float]:
    """
    Detect language directly from audio using SpeechBrain's language ID model.
    Returns (language_code, confidence).
    """
    lang_model = get_lang_id_model()

    if lang_model is None:
        # Fallback to confidence-based detection if model not available
        return fallback_language_detection(wav_path)

    try:
        import torch
        import wave
        import numpy as np

        # Load audio using wave module (more compatible)
        with wave.open(wav_path, 'rb') as wf:
            n_channels = wf.getnchannels()
            sample_width = wf.getsampwidth()
            framerate = wf.getframerate()
            n_frames = wf.getnframes()
            audio_bytes = wf.readframes(n_frames)

        # Convert to numpy array
        if sample_width == 2:
            audio_np = np.frombuffer(audio_bytes, dtype=np.int16).astype(np.float32) / 32768.0
        else:
            audio_np = np.frombuffer(audio_bytes, dtype=np.int8).astype(np.float32) / 128.0

        # Handle stereo -> mono
        if n_channels == 2:
            audio_np = audio_np.reshape(-1, 2).mean(axis=1)

        # Convert to torch tensor
        signal = torch.from_numpy(audio_np).unsqueeze(0)

        # Get prediction
        prediction = lang_model.classify_batch(signal)

        # Extract language and confidence
        # prediction returns (posterior, score, index, text_lab)
        score = prediction[1].item()
        lang_label = prediction[3][0]  # e.g., "ta: Tamil" or "en: English"

        # Parse language code from label (format: "xx: Language Name")
        lang_code = lang_label.split(":")[0].strip().lower()

        # Map some language codes to standard ISO codes
        lang_code_map = {
            "zh-cn": "zh",
            "zh-tw": "zh",
            "cmn": "zh",  # Mandarin
        }
        lang_code = lang_code_map.get(lang_code, lang_code)

        print(f"[LangID] Detected: {lang_label}, confidence: {score:.3f}")

        # LOW CONFIDENCE HANDLING:
        # SpeechBrain is trained on speech, not music/singing.
        # When confidence is low (score < -0.8), the model is uncertain.
        # In these cases, default to English since this is an English-only service.
        # This allows songs and music with vocals to be transcribed.
        LOW_CONFIDENCE_THRESHOLD = -0.8

        if score < LOW_CONFIDENCE_THRESHOLD:
            print(f"[LangID] Low confidence ({score:.3f}), defaulting to English for transcription attempt")
            return ("en", score)

        return (lang_code, score)

    except Exception as e:
        print(f"Language detection error: {e}")
        return fallback_language_detection(wav_path)


def fallback_language_detection(wav_path: str) -> Tuple[str, float]:
    """
    Fallback language detection using VOSK confidence scores.
    When SpeechBrain is not available, use confidence-based heuristics.
    """
    try:
        result = transcribe_with_vosk(wav_path, max_duration=15)
        avg_confidence = result.get("avg_confidence", 1.0)
        low_conf_ratio = result.get("low_conf_ratio", 0.0)
        text = result.get("text", "")

        # If confidence is high, it's likely English
        if avg_confidence > 0.85 and low_conf_ratio < 0.25:
            return ("en", avg_confidence)

        # Try langdetect on the text as a hint
        try:
            from langdetect import detect
            detected = detect(text)
            if detected != "en":
                return (detected, 1.0 - avg_confidence)
        except:
            pass

        # Low confidence suggests non-English
        # Return a generic indicator
        if avg_confidence < 0.75:
            return ("hi", 0.8)  # Default to Hindi for South Asian languages
        elif avg_confidence < 0.85:
            return ("es", 0.6)  # Could be Romance language

        return ("en", avg_confidence)

    except Exception as e:
        print(f"Fallback detection error: {e}")
        return ("en", 0.0)


def transcribe_with_vosk(wav_path: str, max_duration: int = None) -> dict:
    """
    Transcribe a WAV file using VOSK.
    If max_duration is specified, only process that many seconds.
    Returns dict with 'text', 'segments', 'words', and confidence metrics.
    """
    model = get_vosk_model()

    wf = wave.open(wav_path, "rb")

    # Verify WAV format
    if wf.getnchannels() != 1 or wf.getsampwidth() != 2 or wf.getframerate() != 16000:
        wf.close()
        raise ValueError("Audio file must be WAV format, mono, 16-bit, 16kHz")

    recognizer = KaldiRecognizer(model, wf.getframerate())
    recognizer.SetWords(True)  # Enable word-level timestamps

    all_results = []
    all_words = []

    # Calculate max frames if duration limit specified
    max_frames = None
    if max_duration:
        max_frames = max_duration * wf.getframerate()

    frames_read = 0

    # Process audio in chunks
    while True:
        data = wf.readframes(4000)  # ~0.25 seconds of audio
        if len(data) == 0:
            break

        frames_read += 4000
        if max_frames and frames_read > max_frames:
            break

        if recognizer.AcceptWaveform(data):
            result = json.loads(recognizer.Result())
            if result.get("text"):
                all_results.append(result)
            if result.get("result"):
                all_words.extend(result["result"])

    # Get final result
    final_result = json.loads(recognizer.FinalResult())
    if final_result.get("text"):
        all_results.append(final_result)
    if final_result.get("result"):
        all_words.extend(final_result["result"])

    wf.close()

    # Combine all text
    full_text = " ".join(r.get("text", "") for r in all_results).strip()

    # Build segments from words (group into ~5 second chunks or sentence boundaries)
    segments = []
    if all_words:
        current_segment = {"start": 0, "end": 0, "text": "", "words": []}
        segment_duration = 5.0  # Target segment duration in seconds

        for word in all_words:
            word_text = word.get("word", "")
            word_start = word.get("start", 0)
            word_end = word.get("end", 0)

            if not current_segment["words"]:
                current_segment["start"] = word_start

            current_segment["words"].append(word)
            current_segment["end"] = word_end

            # Check if we should start a new segment
            duration = word_end - current_segment["start"]
            is_sentence_end = word_text.endswith((".", "!", "?"))

            if duration >= segment_duration or is_sentence_end:
                current_segment["text"] = " ".join(w.get("word", "") for w in current_segment["words"])
                segments.append({
                    "start": current_segment["start"],
                    "end": current_segment["end"],
                    "text": current_segment["text"]
                })
                current_segment = {"start": 0, "end": 0, "text": "", "words": []}

        # Add remaining words as final segment
        if current_segment["words"]:
            current_segment["text"] = " ".join(w.get("word", "") for w in current_segment["words"])
            segments.append({
                "start": current_segment["start"],
                "end": current_segment["end"],
                "text": current_segment["text"]
            })

    # Calculate confidence metrics
    avg_confidence = 0.0
    low_conf_ratio = 0.0
    if all_words:
        confidences = [w.get("conf", 0.0) for w in all_words if "conf" in w]
        if confidences:
            avg_confidence = sum(confidences) / len(confidences)
            # Ratio of words with confidence below 70%
            low_conf_count = sum(1 for c in confidences if c < 0.7)
            low_conf_ratio = low_conf_count / len(confidences)

    return {
        "text": full_text,
        "segments": segments,
        "words": all_words,
        "avg_confidence": avg_confidence,
        "low_conf_ratio": low_conf_ratio
    }


def get_language_display_name(lang_code: str) -> str:
    """Get user-friendly language name from code."""
    return LANGUAGE_NAMES.get(lang_code.lower(), lang_code.upper())


@app.get("/")
async def root():
    return {"status": "ok", "message": "VOSK Transcription API", "model": "vosk-model-small-en-us"}


@app.post("/transcribe")
@app.post("/api/transcribe")
async def transcribe(
    file: Optional[UploadFile] = File(None),
    audio: Optional[UploadFile] = File(None),
    media: Optional[UploadFile] = File(None),
    upload: Optional[UploadFile] = File(None),
):
    """
    Transcribe audio/video file using VOSK.
    Optimized Flow:
    1. Convert first 15 seconds to WAV for language detection
    2. Use SpeechBrain to detect actual language from audio
    3. If non-English: Return immediately with detected language
    4. If English: Convert full file and transcribe
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

    # Save uploaded file to temp location (streamed, low RAM)
    try:
        tmp_path = await save_upload_to_temp(uploaded_file, file_ext)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save uploaded file: {str(e)}")

    wav_path = None
    wav_path_full = None

    try:
        # STAGE 1: Fast language detection (first 15 seconds only)
        print(f"[Stage 1] Converting first {DETECTION_DURATION_SECONDS}s for language detection: {filename}")
        wav_path = tmp_path + "_detect.wav"

        if not convert_to_wav(tmp_path, wav_path, duration=DETECTION_DURATION_SECONDS):
            raise HTTPException(
                status_code=500,
                detail="Failed to convert audio file. Please ensure the file is a valid audio/video."
            )

        # Use SpeechBrain to detect language from audio
        print(f"[Stage 1] Detecting language from audio...")
        detected_language, confidence = detect_language_from_audio(wav_path)
        print(f"[Stage 1] Detected: {detected_language} ({get_language_display_name(detected_language)}), confidence: {confidence:.2f}")

        # If non-English, return immediately (fast path)
        if detected_language not in ALLOWED_ENGLISH_CODES:
            print(f"[Stage 1] Non-English detected ({detected_language}), returning early")
            return JSONResponse({
                "text": "",
                "language": detected_language,
                "segments": [],
                "srt": "",
            })

        # STAGE 2: Full transcription (only for English)
        print(f"[Stage 2] English detected, converting full file...")
        wav_path_full = tmp_path + "_full.wav"

        if not convert_to_wav(tmp_path, wav_path_full):
            raise HTTPException(
                status_code=500,
                detail="Failed to convert audio file. Please ensure the file is a valid audio/video."
            )

        print(f"[Stage 3] Full transcription with VOSK...")
        result = transcribe_with_vosk(wav_path_full)

        text = result.get("text", "").strip()
        segments = result.get("segments", [])

        # Generate SRT for English transcripts
        srt = generate_srt(segments) if segments else ""

        print(f"[Stage 3] Complete: {len(text)} characters, {len(segments)} segments")
        return JSONResponse({
            "text": text,
            "language": "en",
            "segments": segments,
            "srt": srt,
        })

    except HTTPException:
        raise
    except Exception as e:
        print(f"Transcription error: {e}")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

    finally:
        # Clean up temp files
        for path in [tmp_path, wav_path, wav_path_full]:
            if path:
                try:
                    os.unlink(path)
                except:
                    pass


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run(app, host=host, port=port)
