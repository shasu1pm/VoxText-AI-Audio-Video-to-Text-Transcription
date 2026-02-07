# Setup and Installation Guide

**Last Updated:** February 2026

This guide reflects the current repository behavior (VOSK backend, English-only).

## 1. Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Node.js | 18+ | Frontend dev/build |
| Python | 3.9+ | Backend runtime |
| FFmpeg | Latest | Required for audio conversion |
| Git | Optional | Only if cloning |
| Docker | Optional | Containerized deployment |

## 2. Local Setup

### 2.1 Backend (Quick Script)

Windows:
```cmd
cd Backend
start_server.bat
```

macOS/Linux:
```bash
cd Backend
chmod +x start_server.sh
./start_server.sh
```

The script:
- Checks Python and FFmpeg
- Downloads the VOSK model if missing
- Installs dependencies
- Starts the server on `http://localhost:8000`

### 2.2 Backend (Manual)

```bash
cd Backend
python -m venv venv
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate

# Full dependencies (includes SpeechBrain language ID)
pip install -r requirements.txt

# Or low-RAM mode dependencies
pip install -r requirements.lowram.txt

# Download VOSK model (if not present)
python download_model.py

# Start the API
python server.py
```

### 2.3 Frontend (Development)

```bash
cd Frontend
npm install
npm run dev
```

The dev server runs at `http://localhost:5173` and proxies `/api` and `/transcribe` to the backend.

## 3. Environment Variables

### 3.1 Frontend

Vite envs are build-time. Set them before `npm run build`.

| Variable | Purpose | Default |
|---|---|---|
| `VITE_BACKEND_URL` | Dev proxy target (Vite only) | `http://localhost:8000` |
| `VITE_API_BASE_URL` | Base URL for API calls in production | (empty) |
| `VITE_TRANSCRIBE_URL` | Full transcribe URL override | `/api/transcribe` |
| `VITE_TRANSCRIBE_STATUS_URL` | Status polling base URL (unused by current backend) | (empty) |

### 3.2 Backend

| Variable | Purpose | Default |
|---|---|---|
| `HOST` | Bind address | `0.0.0.0` |
| `PORT` | Bind port | `8000` |
| `CORS_ORIGINS` | Allowed origins, comma-separated | `*` |
| `VOSK_MODEL_PATH` | VOSK model directory | `Backend/model` |
| `DETECTION_DURATION_SECONDS` | Seconds used for language detection | `15` |
| `LOW_RAM_MODE` | Skip SpeechBrain language ID | `0` |
| `MAX_UPLOAD_MB` | Max upload size in MB | `200` |
| `UPLOAD_CHUNK_SIZE` | Upload stream chunk size (bytes) | `1048576` |

## 4. Docker Setup

`docker-compose.yml` builds two services:
- `frontend`: `Frontend/Dockerfile` (Nginx serving static build)
- `backend`: root `Dockerfile` (FastAPI + VOSK)

Build and run:
```bash
docker-compose up --build
```

Defaults:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`

Backend build options:
- `LOW_RAM=1` (default) skips SpeechBrain and installs `requirements.lowram.txt`
- To enable full dependencies, build with `--build-arg LOW_RAM=0`

## 5. Model Downloads

### 5.1 VOSK Model (Current)

The backend uses `vosk-model-small-en-us-0.15` (~40 MB). It is stored in `Backend/model`.

Download manually:
```bash
cd Backend
python download_model.py
```

The `start_server.*` scripts also download this model automatically.

### 5.2 SpeechBrain Language ID Model (Optional)

If `LOW_RAM_MODE=0` and `requirements.txt` is installed, the SpeechBrain language ID model is downloaded on first use (~90 MB). Set `LOW_RAM_MODE=1` to skip it.

### 5.3 Planned (Larger Models)

Planned improvements include optional larger VOSK models for higher accuracy. This is not implemented yet.

## 6. Verification

Check health endpoints:
```bash
curl http://localhost:8000/healthz
curl http://localhost:8000/readyz
```

Expected responses:
```json
{"status":"alive"}
```
```json
{"status":"ready"}
```

Test transcription:
```bash
curl -X POST http://localhost:8000/api/transcribe \
  -F "file=@Audio-Video-To-Text/example.mp3"
```

Expected response (English):
```json
{
  "text": "...",
  "language": "en",
  "segments": [
    {"start": 0.0, "end": 5.0, "text": "..."}
  ],
  "srt": "..."
}
```

## 7. Notes

- The current backend is synchronous and handles one file per request.
- The frontend UI only supports file uploads. YouTube link processing is not implemented.
