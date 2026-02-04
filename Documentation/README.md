# VoxText - Audio/Video to Text Transcription

> **Transform your audio and video files into accurate text transcripts instantly.**

VoxText is an open-source, privacy-focused transcription tool that converts audio and video files into downloadable text formats. Built for simplicity, speed, and accuracy.

---

## What is VoxText?

VoxText is a web-based transcription application that uses OpenAI's Whisper model to convert spoken content in audio/video files into written text. Users can upload files, get automatic language detection, and download transcripts in multiple formats.

### Key Features

- **Drag & Drop Upload** - Simple file upload with progress tracking
- **Automatic Language Detection** - Identifies spoken language within ~30 seconds
- **English-Only Transcription** (MVP) - High-accuracy English transcription
- **Multiple Export Formats** - Download as DOCX, TXT, or SRT (subtitles)
- **Real Timestamps** - SRT exports include accurate timeline markers
- **Privacy-First** - Files processed locally, no cloud storage
- **Mobile Responsive** - Works on desktop, tablet, and mobile

---

## Current Scope (MVP)

| Feature | Status |
|---------|--------|
| English transcription | Supported |
| Other languages | Detected but blocked (98+ coming soon) |
| Audio formats | MP3, WAV, M4A, AAC, FLAC |
| Video formats | MP4, TS |
| Max file size | 200 MB |

---

## Tech Stack

### Frontend
- **React 18** + TypeScript
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library

### Backend
- **Python 3.10+**
- **FastAPI** - High-performance API framework
- **OpenAI Whisper** - Speech recognition model
- **Uvicorn** - ASGI server

---

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- FFmpeg (for audio processing)

### 1. Clone the repository
```bash
git clone https://github.com/your-org/voxtext.git
cd voxtext
```

### 2. Start the backend
```bash
cd backend
pip install -r requirements.txt
python server.py
```

### 3. Start the frontend
```bash
npm install
npm run dev
```

### 4. Open in browser
```
http://localhost:5173
```

---

## Project Structure

```
voxtext/
├── src/                    # Frontend React application
│   ├── app/
│   │   ├── components/     # UI components
│   │   └── App.tsx         # Main application
│   └── styles/             # CSS and theme files
├── backend/                # Python FastAPI server
│   ├── server.py           # Main API server
│   └── requirements.txt    # Python dependencies
├── Documentation/          # Project documentation
└── Audio-Video-To-Text/    # Test files
```

---

## Screenshots

*Coming soon*

---

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

---

## License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) for details.

---

## Acknowledgments

- [OpenAI Whisper](https://github.com/openai/whisper) - Speech recognition model
- [Radix UI](https://www.radix-ui.com/) - Accessible components
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework

---

## Support

- Report issues: [GitHub Issues](https://github.com/your-org/voxtext/issues)
- Documentation: [/Documentation](./Documentation/)

---

**Made with care for the open-source community**
