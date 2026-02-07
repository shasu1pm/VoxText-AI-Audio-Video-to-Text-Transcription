# Roadmap

**Last Updated:** February 2026

This roadmap reflects the current codebase (VOSK English-only) and realistic next steps.

## Now (Current State)

- VOSK-based English-only transcription
- File upload workflow (audio and video)
- TXT, DOCX, and SRT downloads
- Synchronous processing (no worker/queue)
- Health endpoints (`/healthz`, `/readyz`)
- Optional low-RAM mode (`LOW_RAM_MODE=1`)

## Next (Planned)

- YouTube link ingestion (UI and backend support)
- Optional background processing with job status endpoints
- Better progress reporting
- Larger VOSK model option for higher accuracy
- Improved file validation and clearer error states

## Later (Possible)

- Multi-language transcription
- Speaker diarization
- Summaries and highlights
- User accounts and quotas
- Admin dashboard / usage analytics

## Engine Migration Note

Some project notes mention a Whisper-to-VOSK migration. The current repository already uses VOSK. If Whisper support is still desired, it would be an optional alternate engine and not part of the current implementation.
