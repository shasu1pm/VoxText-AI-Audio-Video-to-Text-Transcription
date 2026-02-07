# Contributing

Thanks for contributing to VoxText.

## 1. Prerequisites

- Node.js 18+
- Python 3.9+
- FFmpeg
- Git

## 2. Repository Structure

- `Frontend/` React + Vite UI
- `Backend/` FastAPI + VOSK API
- `Documentation/` project documentation

## 3. Setup

Backend:
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
```

## 4. Branching

Use short-lived branches off `main`:
- `feature/<name>`
- `fix/<name>`
- `docs/<name>`

## 5. Coding Standards

Frontend:
- TypeScript, functional React components
- Follow existing patterns and file structure

Backend:
- Python, PEP8 style
- Use type hints for new functions
- Keep changes small and focused

There is no enforced lint/format configuration in this repo. Keep style consistent with nearby code.

## 6. Tests

Backend test script:
```bash
cd Backend
python test_transcription.py "../Audio-Video-To-Text/example.mp3"
```

There are no automated frontend tests in the current repo.

## 7. Documentation

If your change affects behavior, update the relevant docs in `Documentation/`.

## 8. Pull Request Checklist

- Code builds and runs locally
- Backend endpoint behavior verified
- Docs updated if behavior changes
- No unrelated files modified
