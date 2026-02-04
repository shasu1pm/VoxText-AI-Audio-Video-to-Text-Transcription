# API Documentation

## VoxText - Backend API Reference

**Version:** 1.0
**Base URL:** `http://localhost:8000`
**Last Updated:** February 2026

---

## 1. Overview

The VoxText API provides audio/video transcription services using OpenAI's Whisper model. The API is built with FastAPI and supports both synchronous transcription and fast language detection.

### Base URLs

| Environment | URL |
|-------------|-----|
| Development | `http://localhost:8000` |
| Production | `https://api.your-domain.com` |

### Authentication

Currently, the API does not require authentication (open access for MVP).

---

## 2. Endpoints

### 2.1 Health Check

Check if the API server is running.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "healthy"
}
```

**Status Codes:**
| Code | Description |
|------|-------------|
| 200 | Server is healthy |
| 503 | Server unavailable |

---

### 2.2 Root Info

Get API information and model status.

**Endpoint:** `GET /`

**Response:**
```json
{
  "status": "ok",
  "message": "Whisper Transcription API",
  "model": "base"
}
```

---

### 2.3 Transcribe Audio/Video

Transcribe an audio or video file to text.

**Endpoint:** `POST /api/transcribe` or `POST /transcribe`

**Content-Type:** `multipart/form-data`

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | File | Yes* | Audio/video file |
| `audio` | File | Yes* | Alternative parameter name |
| `media` | File | Yes* | Alternative parameter name |
| `upload` | File | Yes* | Alternative parameter name |

*At least one file parameter is required.

**Supported File Types:**

| Type | MIME Types | Extensions |
|------|------------|------------|
| Audio | `audio/mpeg`, `audio/wav`, `audio/x-m4a`, `audio/aac`, `audio/flac`, `audio/mp3`, `audio/m4a` | .mp3, .wav, .m4a, .aac, .flac |
| Video | `video/mp4`, `video/mp2t`, `video/quicktime` | .mp4, .ts, .mov |

**File Constraints:**
- Maximum size: 200 MB
- Maximum duration: ~60 minutes (based on size)

---

#### Success Response (English)

**Status Code:** `200 OK`

```json
{
  "text": "Hello, this is a sample transcription of the audio file. The content continues here with more text from the recording.",
  "language": "en",
  "segments": [
    {
      "start": 0.0,
      "end": 2.5,
      "text": "Hello, this is a sample transcription"
    },
    {
      "start": 2.5,
      "end": 5.0,
      "text": "of the audio file."
    },
    {
      "start": 5.0,
      "end": 8.5,
      "text": "The content continues here with more text from the recording."
    }
  ],
  "srt": "1\n00:00:00,000 --> 00:00:02,500\nHello, this is a sample transcription\n\n2\n00:00:02,500 --> 00:00:05,000\nof the audio file.\n\n3\n00:00:05,000 --> 00:00:08,500\nThe content continues here with more text from the recording."
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `text` | string | Full transcript text |
| `language` | string | Detected language code (ISO 639-1) |
| `segments` | array | Timed segments with start/end timestamps |
| `srt` | string | Pre-formatted SRT subtitle content |

**Segment Object:**

| Field | Type | Description |
|-------|------|-------------|
| `start` | number | Start time in seconds |
| `end` | number | End time in seconds |
| `text` | string | Transcript text for this segment |

---

#### Success Response (Non-English)

When a non-English language is detected, the API returns immediately without full transcription.

**Status Code:** `200 OK`

```json
{
  "text": "",
  "language": "ta",
  "segments": [],
  "srt": ""
}
```

**Common Language Codes:**

| Code | Language |
|------|----------|
| `en` | English |
| `es` | Spanish |
| `fr` | French |
| `de` | German |
| `ta` | Tamil |
| `hi` | Hindi |
| `zh` | Chinese |
| `ja` | Japanese |
| `ko` | Korean |
| `ar` | Arabic |

---

#### Error Responses

**400 Bad Request - No File:**
```json
{
  "detail": "No file provided"
}
```

**400 Bad Request - Invalid File Type:**
```json
{
  "detail": "Unsupported file type: application/pdf. Please upload an audio or video file."
}
```

**500 Internal Server Error - Processing Failed:**
```json
{
  "detail": "Transcription failed: [error message]"
}
```

**500 Internal Server Error - File Save Failed:**
```json
{
  "detail": "Failed to save uploaded file: [error message]"
}
```

---

## 3. Request Examples

### 3.1 cURL

```bash
# Basic request
curl -X POST "http://localhost:8000/api/transcribe" \
  -F "file=@audio.mp3"

# With verbose output
curl -X POST "http://localhost:8000/api/transcribe" \
  -F "file=@audio.mp3" \
  -v

# Save response to file
curl -X POST "http://localhost:8000/api/transcribe" \
  -F "file=@audio.mp3" \
  -o response.json
```

### 3.2 JavaScript (Fetch)

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('http://localhost:8000/api/transcribe', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
console.log(result.text);
console.log(result.language);
```

### 3.3 Python (Requests)

```python
import requests

with open('audio.mp3', 'rb') as f:
    response = requests.post(
        'http://localhost:8000/api/transcribe',
        files={'file': f}
    )

result = response.json()
print(result['text'])
print(result['language'])
```

---

## 4. Processing Pipeline

### 4.1 Two-Stage Processing

The API uses an optimized two-stage processing pipeline:

```
┌─────────────────────────────────────────────────────────────┐
│                    PROCESSING PIPELINE                       │
└─────────────────────────────────────────────────────────────┘

Stage 1: Fast Language Detection (~10-30 seconds)
├── Load first 30 seconds of audio
├── Use 'tiny' Whisper model (72 MB)
├── Detect language
└── If non-English → Return immediately (skip Stage 2)

Stage 2: Full Transcription (only for English)
├── Use 'base' Whisper model (139 MB)
├── Process entire audio file
├── Generate segments with timestamps
└── Create SRT content
```

### 4.2 Performance Characteristics

| Stage | Duration | Model | Audio Processed |
|-------|----------|-------|-----------------|
| Language Detection | 10-30 sec | tiny | First 30 sec |
| Full Transcription | 30 sec - 3 min | base | Entire file |

---

## 5. SRT Format

### 5.1 Format Specification

The SRT (SubRip Subtitle) format follows this structure:

```
[sequence number]
[start time] --> [end time]
[subtitle text]

[sequence number]
...
```

### 5.2 Timestamp Format

```
HH:MM:SS,mmm --> HH:MM:SS,mmm
```

- `HH`: Hours (00-99)
- `MM`: Minutes (00-59)
- `SS`: Seconds (00-59)
- `mmm`: Milliseconds (000-999)

### 5.3 Example SRT Output

```
1
00:00:00,000 --> 00:00:02,500
Hello, welcome to this presentation.

2
00:00:02,500 --> 00:00:05,800
Today we'll be discussing transcription technology.

3
00:00:05,800 --> 00:00:09,200
Let's start with an overview of how it works.
```

---

## 6. Error Handling

### 6.1 HTTP Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | Success | Transcription completed |
| 400 | Bad Request | Invalid input (no file, wrong type) |
| 500 | Server Error | Processing failed |
| 503 | Service Unavailable | Server starting up |

### 6.2 Error Response Format

All errors follow this format:

```json
{
  "detail": "Human-readable error message"
}
```

### 6.3 Client-Side Error Handling

```javascript
try {
  const response = await fetch('/api/transcribe', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail);
  }

  const result = await response.json();
  // Handle success
} catch (error) {
  // Handle error
  console.error('Transcription failed:', error.message);
}
```

---

## 7. Rate Limits

### 7.1 Current Limits (MVP)

| Limit | Value |
|-------|-------|
| Requests per minute | Unlimited |
| Concurrent requests | 1 (sequential processing) |
| Max file size | 200 MB |

### 7.2 Future Considerations

Rate limiting may be implemented in future versions:
- Per-IP rate limiting
- Queue-based processing
- API key authentication

---

## 8. CORS Configuration

The API supports Cross-Origin Resource Sharing (CORS) for browser-based clients.

### 8.1 Allowed Origins

| Environment | Allowed Origins |
|-------------|-----------------|
| Development | `*` (all origins) |
| Production | Specific domain only |

### 8.2 Allowed Methods

- `GET`
- `POST`
- `OPTIONS`

### 8.3 Allowed Headers

- `Content-Type`
- `Authorization`
- All standard headers

---

## 9. OpenAPI Documentation

FastAPI automatically generates OpenAPI documentation.

### 9.1 Swagger UI

```
http://localhost:8000/docs
```

### 9.2 ReDoc

```
http://localhost:8000/redoc
```

### 9.3 OpenAPI JSON

```
http://localhost:8000/openapi.json
```

---

## 10. Changelog

### v1.0.0 (February 2026)
- Initial release
- English-only transcription
- Two-stage processing pipeline
- DOCX, TXT, SRT export support

---

*API documentation maintained by the VoxText team*
