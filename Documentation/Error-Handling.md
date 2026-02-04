# Error Handling & Edge Cases

## VoxText - Error Handling Documentation

**Version:** 1.0
**Last Updated:** February 2026

---

## 1. Error Categories

### Overview

| Category | Severity | User Impact | Recovery |
|----------|----------|-------------|----------|
| Validation Errors | Low | Immediate feedback | Re-upload correct file |
| Language Errors | Medium | Blocked transcription | Reset & try English file |
| Network Errors | High | Cannot proceed | Check connection, retry |
| Processing Errors | High | Transcription fails | Retry or contact support |

---

## 2. Validation Errors

### 2.1 File Too Large

**Trigger:** File size > 200 MB

**Error Code:** `ERR-FILE-SIZE`

**User Message:**
```
File size exceeds 200 MB limit
```

**UI Behavior:**
- Toast notification displayed
- File card shows error state
- Reset button visible
- Upload area re-enabled after reset

**Technical Details:**
```typescript
const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200 MB

if (file.size > MAX_FILE_SIZE) {
  setErrorMessage("File size exceeds 200 MB limit");
  return false;
}
```

---

### 2.2 Invalid File Type

**Trigger:** File MIME type or extension not in allowed list

**Error Code:** `ERR-FILE-TYPE`

**User Message:**
```
Unsupported file format. Please upload an audio or video file.
```

**Allowed Types:**

| Category | MIME Types | Extensions |
|----------|------------|------------|
| Audio | `audio/mpeg`, `audio/wav`, `audio/x-m4a`, `audio/aac`, `audio/flac` | .mp3, .wav, .m4a, .aac, .flac |
| Video | `video/mp4`, `video/mp2t` | .mp4, .ts |

**UI Behavior:**
- Toast notification displayed
- File rejected immediately
- No upload initiated

---

## 3. Language Errors

### 3.1 Non-English Language Detected

**Trigger:** Detected language code not in `["en", "en-us", "en-gb", "english"]`

**Error Code:** `ERR-NON-ENGLISH`

**User Message:**
```
Sorry: We currently support transcription in English only. We're actively
working with the community to add 98+ other languages. Please click "Reset"
and try again with an English recording.
```

**UI Behavior:**
- Language badge shows detected language (e.g., "Tamil") with error styling
- Inline error alert displayed below action row
- Download dropdown disabled
- Download button disabled
- Reset button visible
- Toast notification with error message

**Technical Details:**
```typescript
const ALLOWED_LANGUAGE_CODES = ["en", "en-us", "en-gb", "english"];

if (!isEnglishLanguage(result.language)) {
  setUploadStatus("error");
  setLanguageError(true);
  setIsEnglishDetected(false);
  setErrorMessage(ENGLISH_ONLY_MESSAGE);
  toast.error(ENGLISH_ONLY_MESSAGE);
  return;
}
```

---

### 3.2 Language Detection Failed

**Trigger:** API returns empty or missing language field

**Error Code:** `ERR-LANG-DETECT`

**User Message:**
```
Language detection failed. Please try again.
```

**UI Behavior:**
- Language badge shows "Unknown" with error styling
- Error state displayed
- Reset button visible

---

## 4. Network Errors

### 4.1 API Unreachable

**Trigger:** All API endpoint candidates fail to connect

**Error Code:** `ERR-NETWORK`

**User Message:**
```
Unable to reach the transcription service. Check that the API is running
and accessible. Tried: /api/transcribe, /transcribe, http://localhost:8000/transcribe, ...
```

**UI Behavior:**
- Error state with detailed message
- List of attempted endpoints shown
- Reset button visible

**Endpoint Fallback Chain:**
```typescript
const endpoints = [
  TRANSCRIBE_ENDPOINT,           // /api/transcribe
  DEFAULT_TRANSCRIBE_FALLBACK,   // /transcribe
  `${BASE_API_URL}/transcribe`,
  `${BASE_API_URL}/api/transcribe`,
  "http://localhost:8000/transcribe",
  "http://127.0.0.1:8000/transcribe",
  "http://localhost:8000/api/transcribe",
  "http://127.0.0.1:8000/api/transcribe",
];
```

---

### 4.2 Request Timeout

**Trigger:** API request exceeds timeout limit

**Error Code:** `ERR-TIMEOUT`

**User Message:**
```
Transcription timed out. The file may be too long or the server is busy.
Please try again.
```

**Default Timeout:** 120 seconds (configurable)

---

### 4.3 Connection Lost Mid-Upload

**Trigger:** Network disconnection during file upload

**Error Code:** `ERR-CONNECTION-LOST`

**User Message:**
```
Connection lost during upload. Please check your internet connection and try again.
```

---

## 5. Processing Errors

### 5.1 Transcription Failed

**Trigger:** Whisper model throws error during processing

**Error Code:** `ERR-TRANSCRIBE`

**User Message:**
```
Transcription failed. Please try again.
```

**Possible Causes:**
- Corrupted audio file
- Unsupported audio codec
- Server out of memory
- Model loading failure

---

### 5.2 No Text Generated

**Trigger:** Transcription returns empty text (English file)

**Error Code:** `ERR-NO-TEXT`

**User Message:**
```
Transcription returned no text.
```

**Possible Causes:**
- Silent audio file
- Audio too quiet
- Heavy background noise
- Corrupted file

---

### 5.3 SRT Generation Failed

**Trigger:** Cannot generate SRT from segments

**Error Code:** `ERR-SRT`

**User Message:**
```
SRT export is unavailable.
```

**Condition:** No segments available AND no pre-generated SRT from API

---

## 6. Download Errors

### 6.1 Download Failed

**Trigger:** Blob creation or download trigger fails

**Error Code:** `ERR-DOWNLOAD`

**User Message:**
```
Download failed. Please try again.
```

**UI Behavior:**
- Toast notification with error
- Dropdown remains open
- User can retry

---

### 6.2 DOCX Generation Failed

**Trigger:** docx library fails to create document

**Error Code:** `ERR-DOCX`

**User Message:**
```
Download failed. Please try again.
```

**Fallback:** User can download as TXT instead

---

## 7. Edge Cases

### 7.1 Empty Audio File

**Scenario:** User uploads valid audio file with no sound

**Behavior:**
1. Language detection may return "unknown" or incorrect language
2. If detected as English, transcription returns empty text
3. Error shown: "Transcription returned no text"

---

### 7.2 Mixed Language Audio

**Scenario:** Audio contains both English and non-English speech

**Behavior:**
1. Language detection based on first 30 seconds
2. If first 30 seconds are English, full transcription proceeds
3. Non-English portions may be transcribed incorrectly
4. No error shown (detected as English)

**Recommendation:** Users should ensure audio is primarily English

---

### 7.3 Very Short Audio (< 1 second)

**Scenario:** Audio file is extremely short

**Behavior:**
1. May not have enough data for language detection
2. Could return incorrect language
3. Transcription may be empty or incorrect

**Minimum recommended:** 3+ seconds of audio

---

### 7.4 Very Long Audio (> 60 minutes)

**Scenario:** Audio exceeds typical processing time

**Behavior:**
1. File size likely exceeds 200MB limit → validation error
2. If under 200MB, processing may timeout
3. Server may run out of memory

**Recommendation:** Split into smaller files

---

### 7.5 Background Noise

**Scenario:** Audio has significant background noise

**Behavior:**
1. Language detection usually still works
2. Transcription accuracy reduced
3. Some words may be missing or incorrect

**Recommendation:** Use noise-reduced audio when possible

---

### 7.6 Multiple Speakers

**Scenario:** Audio contains multiple speakers

**Behavior:**
1. All speech transcribed together (no speaker identification)
2. Overlapping speech may be garbled
3. Timestamps may be less accurate

**Future Feature:** Speaker diarization planned

---

### 7.7 Accented English

**Scenario:** English with strong accent

**Behavior:**
1. Correctly detected as English
2. Transcription accuracy may vary by accent
3. Whisper generally handles accents well

---

### 7.8 Browser Tab Closed During Processing

**Scenario:** User closes browser during transcription

**Behavior:**
1. Frontend AbortController cancels request
2. Server may continue processing (wasted resources)
3. No transcript saved
4. User must re-upload

---

### 7.9 Concurrent Uploads

**Scenario:** User tries to upload second file while first is processing

**Behavior:**
1. Upload button disabled during processing
2. User cannot initiate second upload
3. Must wait or reset first

---

## 8. Error Recovery Procedures

### 8.1 Standard Recovery Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   ERROR     │────▶│   RESET     │────▶│   RETRY     │
│   OCCURS    │     │   STATE     │     │   UPLOAD    │
└─────────────┘     └─────────────┘     └─────────────┘
```

### 8.2 Reset Action

The Reset button clears all state:

```typescript
const handleReset = () => {
  abortRef.current?.abort();
  abortRef.current = null;
  stopProgress();
  setSelectedFile(null);
  setUploadStatus("idle");
  setUploadProgress(0);
  setErrorMessage("");
  setDetectedLanguage("—");
  setLanguageError(false);
  setIsEnglishDetected(false);
  setTranscriptText("");
  setTranscriptSegments(null);
  setTranscriptSrt(null);
};
```

---

## 9. Error Logging

### 9.1 Frontend Console Logging

All errors are logged to browser console for debugging:

```typescript
console.error('Transcription error:', error);
```

### 9.2 Backend Server Logging

```python
import logging
logging.error(f"Transcription failed: {str(e)}")
```

### 9.3 Server Logs Location

- Development: Console output
- Production: `/var/log/voxtext/error.log`

---

## 10. User Support Information

### 10.1 What to Include in Bug Reports

1. Error message displayed
2. File type and size
3. Browser and version
4. Steps to reproduce
5. Console error (if available)

### 10.2 Self-Help Checklist

- [ ] Is the file under 200 MB?
- [ ] Is the file format supported (MP3, WAV, MP4, etc.)?
- [ ] Is the audio in English?
- [ ] Is the backend server running?
- [ ] Is there internet connectivity?
- [ ] Has the browser been refreshed?

---

*Error handling documentation maintained by the VoxText team*
