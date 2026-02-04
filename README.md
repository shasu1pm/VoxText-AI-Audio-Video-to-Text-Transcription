# VoxText - Audio/Video to Text Transcription

VoxText is an open-source AI tool that converts audio and video files to text. Currently supports English transcription with a two-stage processing pipeline for fast language detection.

## Project Structure

```
VoxText/
├── Frontend/          # React + Vite + TypeScript frontend
│   ├── src/           # Source code
│   ├── public/        # Static assets
│   ├── package.json   # Frontend dependencies
│   └── Dockerfile     # For Cloudflare deployment
│
├── Backend/           # FastAPI + Whisper backend
│   ├── server.py      # Main API server
│   ├── requirements.txt
│   └── Dockerfile     # For Render deployment
│
├── Documentation/     # Project documentation
├── docker-compose.yml # Local development with Docker
└── README.md
```

## Quick Start (Local Development)

### Prerequisites
- Node.js 18+ (for Frontend)
- Python 3.11+ (for Backend)
- FFmpeg (required for audio processing)

### Option 1: Run Separately

**Backend:**
```bash
cd Backend
pip install -r requirements.txt
python server.py
# Server runs at http://localhost:8000
```

**Frontend:**
```bash
cd Frontend
npm install
npm run dev
# App runs at http://localhost:5173
```

### Option 2: Run with Docker

```bash
docker-compose up --build
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
```

## Deployment

### Frontend (Cloudflare Pages)

1. Connect your GitHub repo to Cloudflare Pages
2. Set build settings:
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `Frontend`
3. Add environment variable:
   - `VITE_BACKEND_URL` = Your Render backend URL

### Backend (Render)

1. Create a new Web Service on Render
2. Connect your GitHub repo
3. Set:
   - Root directory: `Backend`
   - Build command: `pip install -r requirements.txt`
   - Start command: `python server.py`
4. Add environment variables:
   - `CORS_ORIGINS` = Your Cloudflare Pages URL
   - `WHISPER_MODEL_SIZE` = `base` (or `tiny` for faster processing)

## Environment Variables

### Frontend (.env)
```
VITE_BACKEND_URL=https://your-backend.onrender.com
```

### Backend (.env)
```
HOST=0.0.0.0
PORT=8000
CORS_ORIGINS=https://your-frontend.pages.dev
WHISPER_MODEL_SIZE=base
```

## API Endpoints

- `GET /` - API info
- `GET /health` - Health check
- `POST /api/transcribe` - Transcribe audio/video file
- `POST /transcribe` - Alternative transcription endpoint

## Features

- Fast language detection (~10-30 seconds)
- English-only transcription (rejects non-English files quickly)
- SRT subtitle generation
- Multiple download formats (DOCX, TXT, SRT)
- Drag-and-drop file upload
- Progress tracking

## License

Open source - see Documentation/LICENSE for details.
