# API Documentation

**Base URL:** `http://localhost:8000`
**Last Updated:** February 2026

This API is synchronous and English-only. It uses VOSK for transcription.

## 1. Endpoints

### 1.1 Health Checks

`GET /healthz`

Response:
```json
{"status":"alive"}
```

`GET /readyz`

Response:
```json
{"status":"ready"}
```

### 1.2 Root Info

`GET /`

Response:
```json
{
  "status": "ok",
  "message": "VOSK Transcription API",
  "model": "vosk-model-small-en-us"
}
```

### 1.3 Transcribe

`POST /api/transcribe` or `POST /transcribe`

Content-Type: `multipart/form-data`

Accepted file fields (any one is required):
- `file`
- `audio`
- `media`
- `upload`

Supported types (frontend):
- MP3, WAV, M4A, AAC, FLAC, MP4, TS

Backend also accepts:
- `.mov` / `video/quicktime`
- `application/octet-stream` (some browsers)

Max size:
- Default 200 MB (configurable via `MAX_UPLOAD_MB`)

#### Success Response (English)

```json
{
  "text": "Full transcript...",
  "language": "en",
  "segments": [
    {"start": 0.0, "end": 5.0, "text": "First segment"}
  ],
  "srt": "1\n00:00:00,000 --> 00:00:05,000\nFirst segment\n"
}
```

#### Success Response (Non-English)

```json
{
  "text": "",
  "language": "ta",
  "segments": [],
  "srt": ""
}
```

#### Error Responses

- `400` No file provided
```json
{"detail":"No file provided"}
```

- `400` Unsupported file type
```json
{"detail":"Unsupported file type: application/pdf. Please upload an audio or video file."}
```

- `413` File too large
```json
{"detail":"File exceeds 200 MB limit."}
```

- `500` Conversion or transcription failure
```json
{"detail":"Transcription failed: <error message>"}
```

## 2. Processing Behavior

1. Upload is streamed to a temp file on disk.
2. First 15 seconds are converted to WAV for language detection.
3. If detected language is not English, the API returns early with empty transcript.
4. If English, the full file is converted and transcribed by VOSK.
5. Response includes full text, segments, and SRT.

## 3. CORS

CORS is controlled by `CORS_ORIGINS`. Default is `*`. Set a comma-separated list for production.

## 4. Authentication

None. The API is open by default.

## 5. Rate Limits

No built-in rate limiting. Recommended to add limits at a reverse proxy if exposing publicly.

## 6. OpenAPI

FastAPI exposes auto-generated docs:
- `/docs`
- `/redoc`
- `/openapi.json`
