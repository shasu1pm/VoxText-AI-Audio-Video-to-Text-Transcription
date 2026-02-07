# VoxText - Audio/Video to Text Transcription (VOSK)

VoxText is an open-source AI tool that converts audio and video files to text. Uses VOSK for **fully offline** English transcription - no external API calls required.
Live: https://voxtext-ai.pages.dev/

## Features

- **Fully Offline** - No internet required after initial setup
- **Fast Transcription** - Uses lightweight VOSK model
- **English-Only** - Detects and rejects non-English audio/video
- **SRT Subtitle Generation** - Export with timestamps
- **Multiple Download Formats** - DOCX, TXT, SRT
- **Audio & Video Support** - MP3, WAV, M4A, MP4, and more
- **Drag-and-Drop Upload** - Easy file selection

## Project Structure

```
VoxText/
├── Frontend/              # React + Vite + TypeScript frontend
│   ├── src/               # Source code
│   ├── public/            # Static assets
│   ├── package.json       # Frontend dependencies
│   └── Dockerfile         # For production deployment
│
├── Backend/               # FastAPI + VOSK backend
│   ├── server.py          # Main API server
│   ├── model/             # VOSK model directory (downloaded)
│   ├── requirements.txt   # Python dependencies
│   ├── download_model.py  # Model download script
│   ├── test_transcription.py  # Test script
│   └── Dockerfile         # For production deployment
│
├── Audio-Video-To-Text/   # Test files folder
├── Documentation/         # Project documentation
├── docker-compose.yml     # Docker setup
└── README.md
```

## Quick Start (Local Development)

### Prerequisites
- **Python 3.9+** (for Backend)
- **Node.js 18+** (for Frontend)
- **FFmpeg** (required for audio conversion)

### Step 1: Start the Backend

**Windows:**
```cmd
cd Backend
start_server.bat
```

**Linux/macOS:**
```bash
cd Backend
chmod +x start_server.sh
./start_server.sh
```

**Manual setup:**
```bash
cd Backend

# Download VOSK model (~40MB)
python download_model.py

# Install dependencies
pip install -r requirements.txt

# Start server
python server.py
# Server runs at http://localhost:8000
```

### Step 2: Start the Frontend

```bash
cd Frontend
npm install
npm run dev
# App runs at http://localhost:5173
```

### Step 3: Test It

1. Open http://localhost:5173 in your browser
2. Upload an English audio/video file
3. Wait for transcription
4. Download in your preferred format

## Run with Docker

```bash
docker-compose up --build
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
```

## Testing

### Test Script
```bash
cd Backend

# Test with your own files
python test_transcription.py "../Audio-Video-To-Text/your_audio.mp3"

# Test multiple files
python test_transcription.py file1.mp3 file2.mp4

# Expect English (will validate language detection)
python test_transcription.py -e english_audio.mp3

# Expect non-English
python test_transcription.py -n spanish_audio.mp3
```

### Expected Results

| Input | Language Detected | Transcript | Result |
|-------|------------------|------------|--------|
| English audio | `en` | Yes | Success |
| English video | `en` | Yes | Success |
| Non-English | Language code | No | Error message |

## VOSK Model

The backend uses the **vosk-model-small-en-us-0.15** model:
- Size: ~40 MB
- Language: English (US)
- Accuracy: Good for clear speech
- RAM: ~300 MB

For better accuracy (larger files), you can use bigger models from:
https://alphacephei.com/vosk/models

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API info |
| `/healthz` | GET | Liveness probe |
| `/readyz` | GET | Readiness probe |
| `/transcribe` | POST | Transcribe file |
| `/api/transcribe` | POST | Transcribe file (alternate) |

### Request
```
POST /transcribe
Content-Type: multipart/form-data

file: <audio or video file>
```

### Response (Success - English)
```json
{
  "text": "Transcribed text here...",
  "language": "en",
  "segments": [
    {"start": 0.0, "end": 5.0, "text": "First segment"},
    {"start": 5.0, "end": 10.0, "text": "Second segment"}
  ],
  "srt": "1\n00:00:00,000 --> 00:00:05,000\nFirst segment\n\n..."
}
```

### Response (Non-English)
```json
{
  "text": "",
  "language": "es",
  "segments": [],
  "srt": ""
}
```

## Environment Variables

### Backend (.env)
```env
HOST=0.0.0.0
PORT=8000
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
VOSK_MODEL_PATH=./model
```

### Frontend (.env)
```env
VITE_BACKEND_URL=http://localhost:8000
# For production builds (Cloudflare Pages/Vercel/etc.), set one of:
# VITE_TRANSCRIBE_URL=https://your-backend.example.com/transcribe
# VITE_API_BASE_URL=https://your-backend.example.com
```

## Deployment

### Backend (Render, Railway, etc.)
1. Deploy using the root `Dockerfile`
2. The VOSK model is downloaded during build
3. Set `CORS_ORIGINS` to your frontend URL
4. Optional: build with `--build-arg LOW_RAM=1` to disable SpeechBrain language-ID (lower RAM, less accurate detection)

### Frontend (Cloudflare Pages, Vercel, etc.)
1. Deploy the Frontend folder
2. Set `VITE_TRANSCRIBE_URL` (or `VITE_API_BASE_URL`) to your backend URL

### Cloudflare 413 / 405 Notes
- `413 Payload Too Large` from Cloudflare means the request never reached the backend.
  - Fix by pointing the frontend at a backend hostname that is **not** Cloudflare-proxied
    (DNS-only/gray-cloud), or by upgrading Cloudflare to a plan with higher upload limits.
- `405 Method Not Allowed` on `https://<pages>.dev/api/transcribe` indicates the frontend is
  still calling the static Pages origin (no API route). Ensure `VITE_TRANSCRIBE_URL` is set.

## Troubleshooting

### "VOSK model not found"
Run the model download script:
```bash
cd Backend
python download_model.py
```

### "FFmpeg not found"
Install FFmpeg:
- Windows: `choco install ffmpeg` or download from ffmpeg.org
- macOS: `brew install ffmpeg`
- Linux: `sudo apt install ffmpeg`

### "Transcription returns empty"
- Check if FFmpeg is installed
- Ensure the audio file is valid
- Try a different file format

## License

Open source - see Documentation/LICENSE for details.
