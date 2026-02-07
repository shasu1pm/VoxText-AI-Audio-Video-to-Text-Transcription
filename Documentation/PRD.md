# Product Requirements Document (PRD)

**Product:** VoxText
**Version:** 1.0
**Last Updated:** February 2026

## 1. Problem Statement

Users need a simple and private way to transcribe audio and video files without relying on paid services or cloud-based processing. Many existing tools are expensive, require accounts, or store user data.

## 2. Target Users

- Content creators who need transcripts or subtitles
- Students transcribing lectures
- Journalists and researchers processing interviews
- Anyone who wants local, private transcription

## 3. Goals

- Provide a fast, simple upload-to-transcript workflow
- Support common audio and video formats
- Enforce English-only transcription (MVP scope)
- Allow download as TXT, DOCX, and SRT
- Keep the system self-hostable and privacy-friendly

## 4. Non-Goals (Current)

- Multi-language transcription
- Real-time transcription
- Speaker diarization
- User accounts or billing
- YouTube link ingestion (not implemented in this repo)

## 5. Core User Stories

1. As a user, I want to upload an audio/video file and receive a transcript.
2. As a user, I want to know if my file is non-English before waiting for a full transcript.
3. As a user, I want to download the transcript in common formats.
4. As a user, I want a clear error message when something goes wrong.

## 6. Functional Requirements

- Upload audio/video files via browser
- Validate file type and size on the frontend
- Backend accepts multipart uploads via `/api/transcribe` and `/transcribe`
- Language detection using first 15 seconds of audio
- English-only transcription with VOSK
- Return transcript, segments, and SRT
- Provide downloads as TXT, DOCX, SRT
- Provide health endpoints for deployment checks

## 7. Non-Functional Requirements

Performance:
- Detect language within 15-30 seconds for typical files
- Transcribe a 10 minute English file in a few minutes (depends on hardware)

Reliability:
- Handle invalid file types and sizes gracefully
- Return clear errors on conversion/transcription failure

Privacy:
- Files processed locally on the server
- Temporary files deleted after each request
- No analytics or user tracking

## 8. Success Metrics

- >95% transcription accuracy on clear English speech
- >90% of users complete a successful transcript download
- <5% error rate for valid inputs

## 9. Assumptions and Constraints

- English-only (non-English files are rejected)
- No background worker or queue
- Max file size defaults to 200 MB
- FFmpeg is required on the backend host

## 10. Current vs Planned

Current:
- VOSK English-only transcription
- File upload workflow
- TXT/DOCX/SRT download

Planned:
- Optional larger VOSK models for higher accuracy
- Optional YouTube link ingestion
- Background processing / job status endpoints
- Multi-language support

## 11. Out of Scope

- Speaker diarization
- Real-time streaming
- Translation
- Billing and user management
