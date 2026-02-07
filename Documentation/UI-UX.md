# UI/UX

**Last Updated:** February 2026

This document describes the current UI and states as implemented in `Frontend/src/app/components`.

## 1. Screens and Components

- Hero section (headline and short description)
- Transcription card
  - File upload button
  - Language detected badge
  - Download dropdown
  - Reset button
  - Upload area or file loader card
- Footer

## 2. Core States

### 2.1 Idle

- Upload area is visible
- Language badge shows `Language Detected: —`
- Download dropdown disabled

### 2.2 Uploading

- File loader card appears
- Progress bar animates
- Status changes to `uploading` and then `processing`

### 2.3 Processing

- Progress bar continues
- Backend request is in progress

### 2.4 Completed

- Transcript is ready
- Download dropdown enabled (TXT/DOCX/SRT)
- Toast shows `Transcript is ready!`

### 2.5 Error

Possible error display paths:
- Non-English detected shows inline alert + red language badge
- File validation errors show toast + error message in file card
- Network errors show toast + error message in file card

## 3. UI to Backend Mapping

- When a file is selected, the frontend POSTs to `/api/transcribe` (or `/transcribe` fallback)
- The request is multipart form data with the file in fields `file`, `audio`, `media`, `upload`
- The backend response updates:
  - Language badge
  - Transcript content
  - Download availability

## 4. Download Flow

- TXT: uses plain transcript text
- DOCX: generated in-browser using `docx`
- SRT: uses server-provided `srt` or locally assembled segments

## 5. Reset Behavior

Reset clears:
- Selected file
- Progress and status
- Error state
- Transcript data
- Language badge

## 6. Notes

- There is no YouTube link input in the UI. The hero text references YouTube, but the current UI only supports file uploads.
