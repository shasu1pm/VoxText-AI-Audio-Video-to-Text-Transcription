# Architecture

**Last Updated:** February 2026

This document reflects the current VOSK-based implementation.

## 1. High-Level Architecture

```mermaid
graph TD
  U[User Browser] --> F[Frontend (React + Vite)]
  F -->|POST /api/transcribe| B[Backend API (FastAPI)]
  B -->|FFmpeg convert| W[Temp WAV Files]
  B -->|Language ID| L[SpeechBrain (optional)]
  B -->|Transcribe| V[VOSK Model]
  B -->|JSON response| F

  subgraph Storage
    W
  end
```

## 2. Components

### 2.1 Frontend

- Path: `Frontend/`
- React + Vite, static build (Nginx in Docker)
- Primary component: `TranscriptionCard`
- Uses `fetch` to call the backend
- Generates DOCX/TXT/SRT downloads in the browser

### 2.2 Backend API

- Path: `Backend/`
- FastAPI app in `server.py`
- Endpoints:
  - `GET /`
  - `GET /healthz`
  - `GET /readyz`
  - `POST /transcribe`
  - `POST /api/transcribe`
- Streaming upload to temp files (no full file in RAM)
- Converts media to 16 kHz mono WAV using FFmpeg
- Detects language on the first `DETECTION_DURATION_SECONDS` (default 15s)
- English-only: non-English returns early with empty transcript
- Full transcription only if English

### 2.3 Models

- VOSK model: `vosk-model-small-en-us-0.15` stored in `Backend/model`
- SpeechBrain language ID model (optional): downloaded on first use

### 2.4 Storage

- No database
- Temporary files created during processing
- Temporary files are deleted after each request

### 2.5 Worker / Queue

- None in current implementation
- Processing is synchronous inside the API request

## 3. Data Flow

1. User uploads a file in the browser
2. Frontend validates size/type and POSTs to `/api/transcribe`
3. Backend streams upload to disk
4. Backend converts first 15 seconds to WAV for language detection
5. If non-English: return `{text: "", language: <code>, segments: [], srt: ""}`
6. If English: convert full file, run VOSK, generate segments and SRT
7. Frontend displays transcript and enables downloads

## 4. Deployment Options

### 4.1 Local Development

- Frontend: `npm run dev` (Vite dev server)
- Backend: `python server.py`

### 4.2 Docker

- Backend: root `Dockerfile`
- Frontend: `Frontend/Dockerfile`
- Orchestration: `docker-compose.yml`

### 4.3 Production

- Frontend: static hosting (Cloudflare Pages or similar)
- Backend: containerized FastAPI service
- CORS restricted to frontend domain

## 5. Key Design Decisions

- VOSK small model for lower memory use and faster startup
- English-only gating to keep UX simple and predictable
- Synchronous processing to avoid queue complexity
- Temp files on disk to reduce RAM usage
- Optional SpeechBrain language ID for better accuracy; can be disabled with `LOW_RAM_MODE=1`
