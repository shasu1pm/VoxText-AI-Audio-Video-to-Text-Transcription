# Product Requirements Document (PRD)

## VoxText - Audio/Video to Text Transcription

**Version:** 1.0 (MVP)
**Last Updated:** February 2026
**Status:** In Development

---

## 1. Executive Summary

VoxText is a web-based application that enables users to upload audio or video files and receive accurate text transcriptions. The MVP focuses on English-only transcription with plans to expand to 98+ languages.

---

## 2. Problem Statement

### User Pain Points
- Existing transcription tools are expensive or require subscriptions
- Many tools upload files to cloud servers, raising privacy concerns
- Language detection and error handling are often poor
- Export options are limited or cumbersome

### Solution
VoxText provides free, privacy-focused transcription with:
- Local file processing (no cloud uploads)
- Fast language detection (~30 seconds)
- Multiple export formats (DOCX, TXT, SRT)
- Clear error messaging for unsupported languages

---

## 3. Target Users

### Primary Users
- **Content Creators** - YouTubers, podcasters needing transcripts/subtitles
- **Students** - Transcribing lectures and interviews
- **Journalists** - Converting interview recordings to text
- **Researchers** - Processing audio data for analysis

### User Personas

#### Persona 1: Sarah (Content Creator)
- Age: 28
- Creates YouTube tutorials
- Needs: Quick subtitle generation (SRT) for videos
- Pain: Current tools are slow and expensive

#### Persona 2: Alex (Student)
- Age: 22
- Records university lectures
- Needs: Text transcripts for study notes
- Pain: Manually transcribing takes hours

---

## 4. Feature Requirements

### 4.1 Core Features (MVP)

| Feature | Priority | Status |
|---------|----------|--------|
| File upload (drag & drop) | P0 | Complete |
| Audio format support (MP3, WAV, M4A, AAC, FLAC) | P0 | Complete |
| Video format support (MP4, TS) | P0 | Complete |
| Language detection | P0 | Complete |
| English transcription | P0 | Complete |
| Download as TXT | P0 | Complete |
| Download as DOCX | P0 | Complete |
| Download as SRT | P0 | Complete |
| Non-English error handling | P0 | Complete |
| Reset functionality | P0 | Complete |
| Mobile responsive design | P1 | Complete |
| Progress indicator | P1 | Complete |

### 4.2 Language Support

**MVP (v1.0)**
- English (en, en-US, en-GB)

**Future (v2.0+)**
- Spanish, French, German, Portuguese
- Hindi, Tamil, Telugu
- Chinese, Japanese, Korean
- 98+ languages total

### 4.3 File Constraints

| Constraint | Value |
|------------|-------|
| Max file size | 200 MB |
| Supported audio | MP3, WAV, M4A, AAC, FLAC |
| Supported video | MP4, TS |
| Max duration | ~60 minutes (based on size) |

---

## 5. User Stories

### Upload Flow
```
As a user,
I want to upload an audio/video file,
So that I can get a text transcript.
```

**Acceptance Criteria:**
- [ ] User can drag & drop files
- [ ] User can click to browse files
- [ ] Progress bar shows upload status
- [ ] File type validation occurs immediately
- [ ] File size validation (max 200MB)

### Language Detection
```
As a user,
I want the system to detect the spoken language,
So that I know if my file will be transcribed.
```

**Acceptance Criteria:**
- [ ] Language detected within 30-60 seconds
- [ ] Language name displayed in badge
- [ ] Non-English shows clear error message
- [ ] Reset option available after error

### Download Transcript
```
As a user,
I want to download my transcript in different formats,
So that I can use it in various applications.
```

**Acceptance Criteria:**
- [ ] Dropdown shows DOCX, TXT, SRT options
- [ ] Download button disabled until format selected
- [ ] Filename follows pattern: `{original} (voxtext).{ext}`
- [ ] SRT includes accurate timestamps

---

## 6. Non-Functional Requirements

### Performance
- Language detection: < 60 seconds
- Full transcription: < 3 minutes for 10-minute audio
- UI response time: < 100ms

### Security
- No file storage on servers
- Files processed in memory only
- No user tracking or analytics
- HTTPS required in production

### Accessibility
- WCAG 2.1 AA compliant
- Keyboard navigation support
- Screen reader compatible
- High contrast mode support

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## 7. Success Metrics

| Metric | Target |
|--------|--------|
| Transcription accuracy | > 95% for clear English |
| Language detection accuracy | > 99% |
| User task completion rate | > 90% |
| Error rate | < 5% |
| Page load time | < 3 seconds |

---

## 8. Out of Scope (MVP)

The following features are NOT included in MVP:
- Multi-language transcription
- User accounts / authentication
- Cloud storage of transcripts
- Real-time transcription
- Speaker diarization
- Translation services
- API access for developers
- Batch processing

---

## 9. Dependencies

### Technical Dependencies
- OpenAI Whisper model availability
- FFmpeg for audio processing
- Python 3.10+ runtime
- Node.js 18+ runtime

### External Dependencies
- None (fully self-contained)

---

## 10. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Whisper model accuracy issues | High | Use "base" model, upgrade to "medium" if needed |
| Large file processing timeout | Medium | Implement chunked processing |
| Browser compatibility issues | Low | Test on all major browsers |
| Non-English user confusion | Medium | Clear error messaging, roadmap communication |

---

## 11. Timeline

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Phase 1 (MVP) | Complete | English transcription, 3 export formats |
| Phase 2 | Q2 2026 | 10 additional languages |
| Phase 3 | Q3 2026 | Full 98+ language support |
| Phase 4 | Q4 2026 | Translation, diarization features |

---

## 12. Approval

| Role | Name | Date |
|------|------|------|
| Product Owner | | |
| Tech Lead | | |
| Design Lead | | |

---

*Document maintained by the VoxText team*
