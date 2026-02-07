# VoxText Documentation

VoxText is a web app that converts audio and video files into text transcripts. The current implementation uses VOSK for English-only transcription and runs fully on your own server (no external transcription APIs).

## What VoxText Is

VoxText provides a simple upload-to-transcript flow. Users upload an audio or video file, the backend detects whether the speech is English, and if it is, returns a transcript with timestamps. The frontend lets users download the transcript as TXT, DOCX, or SRT.

## Current Features

- Upload audio/video files and get text transcripts
- English-only transcription with language detection and rejection of non-English audio
- Download transcript as TXT, DOCX, or SRT
- SRT generation with timestamps
- Works offline after models are downloaded
- Supports common formats: MP3, WAV, M4A, AAC, FLAC, MP4, TS
- Max file size default is 200 MB (configurable)
- Health endpoints for monitoring (`/healthz`, `/readyz`)

## Current Limitations

- File upload only. The UI text mentions YouTube links, but there is no YouTube URL input or processing code in this repo.
- English-only. Non-English files are detected and returned without transcription.
- Synchronous processing only. There is no background worker or queue.
- No authentication or user accounts.

## Tech Stack

Frontend:
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Radix UI
- MUI icons
- docx (DOCX export)
- sonner (toasts)

Backend:
- Python + FastAPI
- VOSK (speech-to-text)
- FFmpeg (audio conversion)
- SpeechBrain (optional language ID; can be disabled)
- uvicorn (ASGI server)

## Quick Start (Local)

Backend (Windows):
```cmd
cd Backend
start_server.bat
```

Backend (macOS/Linux):
```bash
cd Backend
chmod +x start_server.sh
./start_server.sh
```

Manual backend setup (any OS):
```bash
cd Backend
python -m venv venv
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
python download_model.py
python server.py
```

Frontend:
```bash
cd Frontend
npm install
npm run dev
# App runs at http://localhost:5173
```

## Environment Variables

Frontend (Vite build-time envs):

| Variable | Where Used | Purpose | Default |
|---|---|---|---|
| `VITE_BACKEND_URL` | `Frontend/vite.config.ts` | Dev server proxy target | `http://localhost:8000` |
| `VITE_API_BASE_URL` | `TranscriptionCard.tsx` | Base URL for API calls in production | (empty) |
| `VITE_TRANSCRIBE_URL` | `TranscriptionCard.tsx` | Override full transcribe URL | `/api/transcribe` |
| `VITE_TRANSCRIBE_STATUS_URL` | `TranscriptionCard.tsx` | Base URL for status polling (unused by current backend) | (empty) |

Backend:

| Variable | Where Used | Purpose | Default |
|---|---|---|---|
| `HOST` | `server.py` | Bind address | `0.0.0.0` |
| `PORT` | `server.py` | Server port | `8000` |
| `CORS_ORIGINS` | `server.py` | Comma-separated allowed origins | `*` |
| `VOSK_MODEL_PATH` | `server.py` | Path to VOSK model directory | `Backend/model` |
| `DETECTION_DURATION_SECONDS` | `server.py` | Audio seconds used for language detection | `15` |
| `LOW_RAM_MODE` | `server.py` | Skip SpeechBrain language ID | `0` |
| `MAX_UPLOAD_MB` | `server.py` | Max upload size in MB | `200` |
| `UPLOAD_CHUNK_SIZE` | `server.py` | Upload stream chunk size (bytes) | `1048576` |

Docker-only (used by container entrypoint):

| Variable | Where Used | Purpose | Default |
|---|---|---|---|
| `UVICORN_LIMIT_CONCURRENCY` | Docker `CMD` | Limit concurrent requests | `1` |

## Tests

Backend test script:
```bash
cd Backend
python test_transcription.py "../Audio-Video-To-Text/example.mp3"
```

You can also run without arguments to generate a short test WAV:
```bash
python test_transcription.py
```

## Troubleshooting (Top Issues)

1. FFmpeg not found
   - Install FFmpeg and ensure it is on PATH.
2. VOSK model not found
   - Run `python Backend/download_model.py` or use `start_server.*` scripts.
3. CORS errors in browser
   - Set `CORS_ORIGINS` to your frontend URL and restart backend.
4. File too large
   - Default limit is 200 MB. Increase `MAX_UPLOAD_MB` if needed.
5. Non-English detected or empty transcript
   - This is English-only. Use clear English audio.

## Live URL

A live frontend URL is not defined in this repo.

## Documentation Index

- `./Setup-Guide.md`
- `./Architecture.md`
- `./API.md`
- `./User-flow.md`
- `./UI-UX.md`
- `./Error-Handling.md`
- `./Security-Privacy.md`
- `./Roadmap.md`
- `./CONTRIBUTING.md`
- `./LICENSE`
