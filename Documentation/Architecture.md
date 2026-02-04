# System Architecture

## VoxText - Technical Architecture Document

**Version:** 1.0
**Last Updated:** February 2026

---

## 1. Architecture Overview

VoxText follows a client-server architecture with a React frontend and Python FastAPI backend.

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                         │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    React Application                      │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐   │    │
│  │  │  Upload  │  │ Language │  │  Download Dropdown   │   │    │
│  │  │   Area   │  │  Badge   │  │  (DOCX/TXT/SRT)     │   │    │
│  │  └──────────┘  └──────────┘  └──────────────────────┘   │    │
│  │                                                           │    │
│  │  ┌─────────────────────────────────────────────────────┐ │    │
│  │  │              TranscriptionCard Component             │ │    │
│  │  │  - File validation    - Progress tracking           │ │    │
│  │  │  - API communication  - State management            │ │    │
│  │  └─────────────────────────────────────────────────────┘ │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/HTTPS
                              │ multipart/form-data
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SERVER (FastAPI)                            │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    API Endpoints                          │    │
│  │  POST /api/transcribe    POST /transcribe                │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│  ┌───────────────────────────┴───────────────────────────┐      │
│  │              Two-Stage Processing Pipeline             │      │
│  │                                                        │      │
│  │  ┌──────────────────┐    ┌──────────────────────────┐ │      │
│  │  │   STAGE 1        │    │      STAGE 2             │ │      │
│  │  │   Fast Language  │───▶│   Full Transcription     │ │      │
│  │  │   Detection      │    │   (English only)         │ │      │
│  │  │                  │    │                          │ │      │
│  │  │  • Tiny model    │    │  • Base model            │ │      │
│  │  │  • First 30 sec  │    │  • Full audio            │ │      │
│  │  │  • ~10-30 sec    │    │  • Segments + SRT        │ │      │
│  │  └──────────────────┘    └──────────────────────────┘ │      │
│  └────────────────────────────────────────────────────────┘      │
│                              │                                   │
│  ┌───────────────────────────┴───────────────────────────┐      │
│  │                  Whisper Models                        │      │
│  │  ┌─────────────┐              ┌─────────────────────┐ │      │
│  │  │ tiny (72MB) │              │    base (139MB)     │ │      │
│  │  │ Detection   │              │    Transcription    │ │      │
│  │  └─────────────┘              └─────────────────────┘ │      │
│  └────────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Component Architecture

### 2.1 Frontend Components

```
src/
├── app/
│   ├── App.tsx                 # Root application component
│   └── components/
│       ├── TranscriptionCard.tsx   # Main orchestrator
│       │   ├── State management
│       │   ├── File validation
│       │   ├── API communication
│       │   └── Download handling
│       │
│       ├── UploadArea.tsx          # Drag-and-drop upload
│       │   ├── File input handling
│       │   └── Visual feedback
│       │
│       ├── FileLoaderCard.tsx      # Progress display
│       │   ├── File metadata
│       │   ├── Progress bar
│       │   └── Status indicators
│       │
│       ├── DownloadDropdown.tsx    # Format selection
│       │   ├── DOCX/TXT/SRT options
│       │   └── Download trigger
│       │
│       └── ui/                     # Shadcn/Radix components
│           ├── button.tsx
│           ├── card.tsx
│           ├── popover.tsx
│           ├── progress.tsx
│           └── ...
│
└── styles/
    ├── tailwind.css            # Tailwind utilities
    └── theme.css               # CSS custom properties
```

### 2.2 Backend Components

```
backend/
├── server.py                   # FastAPI application
│   ├── detect_language_fast()  # Stage 1: Quick detection
│   ├── transcribe()            # Main API endpoint
│   ├── generate_srt()          # SRT generation
│   └── format_timestamp()      # Timestamp formatting
│
└── requirements.txt            # Python dependencies
```

---

## 3. Data Flow

### 3.1 Upload & Transcription Flow

```
User Action              Frontend                    Backend
    │                       │                           │
    │  Select/Drop File     │                           │
    ├──────────────────────▶│                           │
    │                       │                           │
    │                       │  Validate file            │
    │                       │  (type, size)             │
    │                       │                           │
    │                       │  POST /api/transcribe     │
    │                       ├──────────────────────────▶│
    │                       │  (multipart/form-data)    │
    │                       │                           │
    │                       │                           │  Stage 1: Detect
    │                       │                           │  language (30 sec)
    │                       │                           │
    │                       │                           │  If non-English:
    │                       │                           │  Return {language: "ta"}
    │                       │                           │
    │                       │                           │  If English:
    │                       │                           │  Stage 2: Full
    │                       │                           │  transcription
    │                       │                           │
    │                       │  JSON Response            │
    │                       │◀────────────────────────────┤
    │                       │  {text, language,         │
    │                       │   segments, srt}          │
    │                       │                           │
    │  Update UI            │                           │
    │◀──────────────────────┤                           │
    │  (badge, error,       │                           │
    │   or transcript)      │                           │
```

### 3.2 Download Flow

```
User Action              Frontend                    Browser
    │                       │                           │
    │  Select format        │                           │
    │  (DOCX/TXT/SRT)      │                           │
    ├──────────────────────▶│                           │
    │                       │                           │
    │  Click Download       │                           │
    ├──────────────────────▶│                           │
    │                       │                           │
    │                       │  Generate content:        │
    │                       │  - DOCX: docx library     │
    │                       │  - TXT: plain text        │
    │                       │  - SRT: formatted subs    │
    │                       │                           │
    │                       │  Create Blob              │
    │                       ├──────────────────────────▶│
    │                       │                           │
    │                       │                           │  Trigger download
    │                       │                           │  {filename} (voxtext).{ext}
    │                       │                           │
    │  File downloaded      │                           │
    │◀────────────────────────────────────────────────────┤
```

---

## 4. API Design

### 4.1 Transcription Endpoint

**POST** `/api/transcribe` or `/transcribe`

**Request:**
```
Content-Type: multipart/form-data

file: <binary>           # Primary file field
audio: <binary>          # Alternative field name
media: <binary>          # Alternative field name
upload: <binary>         # Alternative field name
```

**Response (Success):**
```json
{
  "text": "Full transcript text...",
  "language": "en",
  "segments": [
    {
      "start": 0.0,
      "end": 2.5,
      "text": "Hello world"
    }
  ],
  "srt": "1\n00:00:00,000 --> 00:00:02,500\nHello world\n\n..."
}
```

**Response (Non-English):**
```json
{
  "text": "",
  "language": "ta",
  "segments": [],
  "srt": ""
}
```

---

## 5. State Management

### 5.1 Frontend State (TranscriptionCard)

```typescript
// Upload state
uploadStatus: "idle" | "uploading" | "processing" | "completed" | "error"
selectedFile: File | null
uploadProgress: number (0-100)
errorMessage: string

// Language state
detectedLanguage: string ("—" | "English" | "Tamil" | ...)
languageError: boolean
isEnglishDetected: boolean

// Transcript state
transcriptText: string
transcriptSegments: TranscriptSegment[] | null
transcriptSrt: string | null
```

### 5.2 State Transitions

```
IDLE ──────────▶ UPLOADING ──────────▶ PROCESSING ──────────▶ COMPLETED
  │                  │                      │                      │
  │                  │                      │                      │
  │                  ▼                      ▼                      │
  │              ERROR ◀───────────────── ERROR                    │
  │                  │                                             │
  │                  │                                             │
  └──────────────────┴─────────── RESET ◀──────────────────────────┘
```

---

## 6. Security Architecture

### 6.1 File Handling
- Files uploaded via multipart/form-data
- Saved to temporary directory with auto-cleanup
- Processed in memory, not persisted
- Deleted immediately after transcription

### 6.2 Input Validation
- File type validation (MIME type + extension)
- File size validation (max 200MB)
- Content-type header verification

### 6.3 CORS Configuration
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 7. Performance Optimizations

### 7.1 Two-Stage Processing
| Stage | Model | Audio Length | Time |
|-------|-------|--------------|------|
| 1. Detection | tiny (72MB) | First 30 sec | ~10-30 sec |
| 2. Transcription | base (139MB) | Full audio | Varies |

### 7.2 Benefits
- Non-English files rejected in ~30 seconds (not 10+ minutes)
- Only English files proceed to full transcription
- Smaller model for detection = faster response

### 7.3 Frontend Optimizations
- Simulated progress bar during processing
- Abort controller for cancelled requests
- Lazy model loading (models loaded once at startup)

---

## 8. Deployment Architecture

### 8.1 Development
```
┌─────────────┐     ┌─────────────┐
│   Vite      │     │   Uvicorn   │
│   :5173     │────▶│   :8000     │
│  (Frontend) │     │  (Backend)  │
└─────────────┘     └─────────────┘
```

### 8.2 Production (Docker)
```
┌─────────────────────────────────────────┐
│              Docker Compose              │
│  ┌─────────────┐     ┌─────────────┐   │
│  │   Nginx     │     │   Gunicorn  │   │
│  │   :80/443   │────▶│   :8000     │   │
│  │  (Static +  │     │  (FastAPI)  │   │
│  │   Proxy)    │     │             │   │
│  └─────────────┘     └─────────────┘   │
└─────────────────────────────────────────┘
```

---

## 9. Technology Decisions

### 9.1 Why React + Vite?
- Fast development with HMR
- TypeScript support
- Large ecosystem
- Easy deployment

### 9.2 Why FastAPI?
- Async support for file uploads
- Automatic OpenAPI documentation
- High performance
- Python ecosystem (Whisper)

### 9.3 Why Whisper?
- State-of-the-art accuracy
- Open source (MIT license)
- Multiple model sizes
- Built-in language detection

### 9.4 Why Two Models?
- `tiny`: Fast detection, good enough for language ID
- `base`: Better accuracy for final transcription
- Trade-off: Memory usage vs. user experience

---

## 10. Future Architecture Considerations

### 10.1 Scaling
- Queue-based processing (Redis/RabbitMQ)
- Worker pool for parallel transcriptions
- CDN for frontend assets

### 10.2 Multi-Language
- Language-specific model selection
- Dynamic model loading
- Translation pipeline integration

### 10.3 Real-time
- WebSocket for progress updates
- Streaming transcription
- Live audio input

---

*Architecture document maintained by the VoxText engineering team*
