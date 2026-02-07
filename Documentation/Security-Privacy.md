# Security and Privacy

**Last Updated:** February 2026

## 1. Data Handling

- Files are uploaded to the backend as multipart form data.
- The backend streams uploads to a temporary file on disk.
- FFmpeg converts the file to WAV (16 kHz mono) for processing.
- VOSK transcribes the WAV file.
- Temporary files are deleted in a `finally` block after processing.

There is no database and no long-term storage in the current implementation.

## 2. Privacy Stance

- No third-party transcription APIs are used.
- No user accounts or analytics.
- All processing happens on your own server.

Note: The optional SpeechBrain language ID model downloads from HuggingFace on first use. After the model is cached, it runs locally. Set `LOW_RAM_MODE=1` to skip SpeechBrain entirely.

## 3. Network Security

- Use HTTPS/TLS in production.
- Restrict `CORS_ORIGINS` to trusted frontend domains.

## 4. Access Control

- There is no authentication in the current backend.
- If deploying publicly, add a reverse proxy with rate limiting and optional auth.

## 5. Secrets Management

- Store secrets in environment variables.
- Avoid committing `.env` files with production values.

## 6. File Retention

- Files are deleted after processing.
- Ensure the host has periodic temp directory cleanup if needed.

## 7. Recommended Hardening

- Run the backend as a non-root user (Dockerfile already does this).
- Add request size limits at the reverse proxy.
- Add rate limiting and basic auth if exposed to the internet.
- Keep FFmpeg and Python dependencies updated.

## 8. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Public endpoint abuse | Add rate limiting and auth |
| Large uploads | Set `MAX_UPLOAD_MB` and proxy limits |
| CORS misconfig | Set `CORS_ORIGINS` to exact frontend domain |
| Temp files on disk | Ensure filesystem permissions and cleanup |
