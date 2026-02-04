# Setup & Installation Guide

## VoxText - Complete Setup Instructions

**Version:** 1.0
**Last Updated:** February 2026

---

## 1. Prerequisites

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| Node.js | 18.0+ | Frontend runtime |
| Python | 3.10+ | Backend runtime |
| FFmpeg | Latest | Audio processing |
| Git | Latest | Version control |

### System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| RAM | 4 GB | 8 GB+ |
| Storage | 2 GB | 5 GB+ |
| CPU | 2 cores | 4+ cores |
| GPU | Not required | NVIDIA (faster processing) |

---

## 2. Installation Steps

### 2.1 Clone the Repository

```bash
git clone https://github.com/your-org/voxtext.git
cd voxtext
```

### 2.2 Install FFmpeg

**Windows (using Chocolatey):**
```bash
choco install ffmpeg
```

**Windows (manual):**
1. Download from https://ffmpeg.org/download.html
2. Extract to `C:\ffmpeg`
3. Add `C:\ffmpeg\bin` to PATH

**macOS:**
```bash
brew install ffmpeg
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install ffmpeg
```

**Verify installation:**
```bash
ffmpeg -version
```

### 2.3 Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server
python server.py
```

**Expected output:**
```
Loading Whisper models...
  - Loading 'tiny' model for fast language detection...
  - Loading 'base' model for transcription...
Models loaded successfully!
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 2.4 Frontend Setup

```bash
# Navigate to project root (new terminal)
cd voxtext

# Install dependencies
npm install

# Start development server
npm run dev
```

**Expected output:**
```
VITE v6.3.5  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### 2.5 Verify Installation

1. Open http://localhost:5173 in browser
2. Upload a test audio file
3. Verify transcription completes successfully

---

## 3. Environment Variables

### 3.1 Frontend (.env)

Create `.env` file in project root:

```env
# API Configuration (optional - defaults work for local dev)
VITE_API_BASE_URL=http://localhost:8000
VITE_TRANSCRIBE_URL=/api/transcribe
```

### 3.2 Backend (Environment)

```env
# Whisper model size (tiny, base, small, medium, large)
WHISPER_MODEL=base

# Server configuration
HOST=0.0.0.0
PORT=8000
```

### 3.3 Available Model Sizes

| Model | Size | Speed | Accuracy | VRAM |
|-------|------|-------|----------|------|
| tiny | 72 MB | Fastest | Good | ~1 GB |
| base | 139 MB | Fast | Better | ~1 GB |
| small | 461 MB | Medium | Good | ~2 GB |
| medium | 1.5 GB | Slow | Better | ~5 GB |
| large | 2.9 GB | Slowest | Best | ~10 GB |

---

## 4. Docker Setup

### 4.1 Using Docker Compose

```bash
# Build and start containers
docker-compose up --build

# Run in background
docker-compose up -d

# Stop containers
docker-compose down
```

### 4.2 Dockerfile (Backend)

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Expose port
EXPOSE 8000

# Run server
CMD ["python", "server.py"]
```

### 4.3 docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - WHISPER_MODEL=base
    volumes:
      - whisper_cache:/root/.cache/whisper

  frontend:
    build: .
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  whisper_cache:
```

---

## 5. Production Deployment

### 5.1 Build Frontend

```bash
npm run build
```

Output will be in `dist/` directory.

### 5.2 Serve with Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend static files
    location / {
        root /var/www/voxtext/dist;
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        client_max_body_size 200M;
    }
}
```

### 5.3 Run Backend with Gunicorn

```bash
pip install gunicorn

gunicorn server:app \
    --workers 2 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:8000 \
    --timeout 300
```

---

## 6. Common Setup Errors

### 6.1 FFmpeg Not Found

**Error:**
```
FileNotFoundError: [Errno 2] No such file or directory: 'ffmpeg'
```

**Solution:**
1. Install FFmpeg (see section 2.2)
2. Ensure FFmpeg is in PATH
3. Restart terminal after installation

### 6.2 Whisper Model Download Fails

**Error:**
```
ConnectionError: Unable to download model
```

**Solution:**
1. Check internet connection
2. Try manual download:
   ```bash
   python -c "import whisper; whisper.load_model('base')"
   ```
3. Check firewall settings

### 6.3 Port Already in Use

**Error:**
```
OSError: [Errno 98] Address already in use
```

**Solution:**
```bash
# Find process using port
# Windows:
netstat -ano | findstr :8000
# Linux/macOS:
lsof -i :8000

# Kill process
# Windows:
taskkill /PID <pid> /F
# Linux/macOS:
kill -9 <pid>
```

### 6.4 CORS Errors

**Error:**
```
Access to fetch has been blocked by CORS policy
```

**Solution:**
Verify backend CORS settings allow frontend origin:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 6.5 Out of Memory

**Error:**
```
RuntimeError: CUDA out of memory
```

**Solution:**
1. Use smaller model: `WHISPER_MODEL=tiny`
2. Process shorter audio files
3. Increase system swap space

### 6.6 Module Not Found

**Error:**
```
ModuleNotFoundError: No module named 'whisper'
```

**Solution:**
```bash
# Ensure virtual environment is activated
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Reinstall dependencies
pip install -r requirements.txt
```

---

## 7. Development Tips

### 7.1 Hot Reload

Frontend (Vite) has hot reload enabled by default.

Backend can use:
```bash
uvicorn server:app --reload
```

### 7.2 Debug Mode

Enable verbose logging:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### 7.3 Testing API

```bash
# Health check
curl http://localhost:8000/health

# Test transcription
curl -X POST http://localhost:8000/api/transcribe \
  -F "file=@test-audio.mp3"
```

---

## 8. Updating

### 8.1 Update Dependencies

```bash
# Frontend
npm update

# Backend
pip install --upgrade -r requirements.txt
```

### 8.2 Update Whisper

```bash
pip install --upgrade openai-whisper
```

---

## 9. Uninstallation

### 9.1 Remove Application

```bash
# Delete project folder
rm -rf voxtext

# Remove Python packages (if using global)
pip uninstall openai-whisper fastapi uvicorn
```

### 9.2 Remove Whisper Models

```bash
# Windows
rmdir /s %USERPROFILE%\.cache\whisper

# macOS/Linux
rm -rf ~/.cache/whisper
```

---

## 10. Support

If you encounter issues not covered here:

1. Check [GitHub Issues](https://github.com/your-org/voxtext/issues)
2. Search existing issues first
3. Create new issue with:
   - Error message
   - System info (OS, Python version, Node version)
   - Steps to reproduce

---

*Setup guide maintained by the VoxText team*
