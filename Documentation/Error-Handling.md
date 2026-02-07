# Error Handling

**Last Updated:** February 2026

This section maps frontend messages to backend behavior.

## 1. File Validation Errors (Frontend)

### 1.1 File Too Large

Trigger:
- File size > 200 MB (frontend limit)

User message:
- `File size exceeds 200 MB limit`

Backend behavior:
- If frontend is bypassed, backend rejects above `MAX_UPLOAD_MB` with `413`.

### 1.2 Unsupported File Type

Trigger:
- File type not in allowed list

User message:
- `Unsupported file format. Please upload an audio or video file.`

Backend behavior:
- `400` with `detail` about unsupported type.

## 2. Language Errors

### 2.1 Non-English Detected

Trigger:
- Backend language detection returns a code not in `en`, `en-us`, `en-gb`, `english`

User message:
- `Sorry: We currently support transcription in English only. We're actively working with the community to add 98+ other languages. Please click "Reset" and try again with an English recording.`

Backend response:
```json
{
  "text": "",
  "language": "<non-english>",
  "segments": [],
  "srt": ""
}
```

### 2.2 Language Detection Failed

Trigger:
- Backend returns a response without a `language` field (not expected with current backend)

User message:
- `Language detection failed. Please try again.`

## 3. Network Errors

### 3.1 Backend Unreachable

Trigger:
- All endpoint candidates fail

User message:
- `Unable to reach the transcription service. Check that the API is running and accessible.`

## 4. Processing Errors

### 4.1 Conversion Failure

Trigger:
- FFmpeg fails to convert to WAV

Backend response:
- `500` with detail: `Failed to convert audio file. Please ensure the file is a valid audio/video.`

Frontend message:
- `Transcription failed. Please try again.` (from error toast)

### 4.2 Transcription Failure

Trigger:
- VOSK processing error

Backend response:
- `500` with detail: `Transcription failed: <error message>`

Frontend message:
- `Transcription failed. Please try again.`

### 4.3 No Text Returned

Trigger:
- Backend returns empty transcript for English

User message:
- `Transcription returned no text.`

## 5. Download Errors

### 5.1 SRT Unavailable

Trigger:
- No SRT provided and no segments to build it

User message:
- `SRT export is unavailable.`

### 5.2 Download Failure

Trigger:
- Browser fails to create or download file

User message:
- `Download failed. Please try again.`

## 6. Developer Debugging

Where to look:
- Backend logs: stdout/stderr from `python server.py` or `docker logs <container>`
- Frontend console: network errors and response payloads

Common root causes:
- FFmpeg not installed or not on PATH
- VOSK model missing in `Backend/model`
- CORS not configured for deployed frontend domain
- File size exceeds backend `MAX_UPLOAD_MB`
- Language detected as non-English
