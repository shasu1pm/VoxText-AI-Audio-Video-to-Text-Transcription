# User Flow Documentation

## VoxText - User Journey & Flow Diagrams

**Version:** 1.0
**Last Updated:** February 2026

---

## 1. High-Level User Journey

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           VoxText User Journey                               │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
    │  LAND    │     │  UPLOAD  │     │  PROCESS │     │ DOWNLOAD │
    │          │────▶│          │────▶│          │────▶│          │
    │  on page │     │  file    │     │  & detect│     │ transcript│
    └──────────┘     └──────────┘     └──────────┘     └──────────┘
         │                │                │                │
         ▼                ▼                ▼                ▼
    View upload      Select file     See progress      Choose format
    area             or drag-drop    & language        & download
```

---

## 2. Detailed Flow: Happy Path (English File)

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ENGLISH FILE - HAPPY PATH                             │
└─────────────────────────────────────────────────────────────────────────────┘

User                          System                         UI State
 │                               │                               │
 │  1. Visits page               │                               │
 ├──────────────────────────────▶│                               │
 │                               │  Initialize                   │
 │                               ├──────────────────────────────▶│ IDLE
 │                               │                               │
 │  2. Drops/selects file        │                               │
 ├──────────────────────────────▶│                               │
 │                               │  Validate file                │
 │                               │  (type: ✓, size: ✓)          │
 │                               ├──────────────────────────────▶│ UPLOADING
 │                               │                               │
 │                               │  Send to API                  │
 │                               │  ─────────────────────▶       │
 │                               │                               │
 │                               │  Stage 1: Language detect     │
 │                               │  (tiny model, 30 sec)        │
 │                               │  Result: "en"                 │
 │                               ├──────────────────────────────▶│ PROCESSING
 │                               │                               │
 │                               │  Stage 2: Full transcription  │
 │                               │  (base model)                 │
 │                               │                               │
 │                               │  Response: {text, srt, ...}   │
 │                               ├──────────────────────────────▶│ COMPLETED
 │                               │                               │
 │  3. Sees "English" badge      │                               │
 │◀──────────────────────────────┤                               │
 │                               │                               │
 │  4. Clicks download dropdown  │                               │
 ├──────────────────────────────▶│                               │
 │                               │  Show format options          │
 │                               ├──────────────────────────────▶│ Dropdown open
 │                               │                               │
 │  5. Selects "TXT"             │                               │
 ├──────────────────────────────▶│                               │
 │                               │  Enable download button       │
 │                               ├──────────────────────────────▶│ Format selected
 │                               │                               │
 │  6. Clicks "Download"         │                               │
 ├──────────────────────────────▶│                               │
 │                               │  Generate file                │
 │                               │  Trigger browser download     │
 │                               ├──────────────────────────────▶│ Download complete
 │                               │                               │
 │  7. File saved locally        │                               │
 │◀──────────────────────────────┤                               │
 │                               │                               │
 │  (Optional) 8. Click Reset    │                               │
 ├──────────────────────────────▶│                               │
 │                               │  Clear all state              │
 │                               ├──────────────────────────────▶│ IDLE
```

### Step Details

| Step | User Action | System Response | UI Feedback |
|------|-------------|-----------------|-------------|
| 1 | Visit page | Load application | Upload area visible |
| 2 | Drop/select file | Validate → Upload → Process | Progress bar, status text |
| 3 | Wait | Detect language | "English" in badge |
| 4 | Click dropdown | Open format menu | 3 options visible |
| 5 | Select format | Store selection | Option highlighted |
| 6 | Click Download | Generate & download | Toast: "Downloaded" |
| 7 | - | - | File in downloads |
| 8 | Click Reset | Clear state | Back to initial |

---

## 3. Detailed Flow: Non-English File

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      NON-ENGLISH FILE - ERROR PATH                           │
└─────────────────────────────────────────────────────────────────────────────┘

User                          System                         UI State
 │                               │                               │
 │  1. Drops Tamil audio file    │                               │
 ├──────────────────────────────▶│                               │
 │                               │  Validate file                │
 │                               │  (type: ✓, size: ✓)          │
 │                               ├──────────────────────────────▶│ UPLOADING
 │                               │                               │
 │                               │  Send to API                  │
 │                               │  ─────────────────────▶       │
 │                               │                               │
 │                               │  Stage 1: Language detect     │
 │                               │  (tiny model, 30 sec)        │
 │                               │  Result: "ta" (Tamil)         │
 │                               │                               │
 │                               │  ❌ Non-English detected      │
 │                               │  Skip Stage 2 (no transcribe) │
 │                               │                               │
 │                               │  Response: {language: "ta"}   │
 │                               ├──────────────────────────────▶│ ERROR
 │                               │                               │
 │  2. Sees "Tamil" badge (red)  │                               │
 │◀──────────────────────────────┤                               │
 │                               │                               │
 │  3. Sees error message:       │                               │
 │     "English only..."         │                               │
 │◀──────────────────────────────┤                               │
 │                               │                               │
 │  4. Download dropdown         │                               │
 │     is DISABLED               │                               │
 │                               │                               │
 │  5. Clicks "Reset"            │                               │
 ├──────────────────────────────▶│                               │
 │                               │  Clear all state              │
 │                               ├──────────────────────────────▶│ IDLE
 │                               │                               │
 │  6. Uploads English file      │                               │
 ├──────────────────────────────▶│                               │
 │                               │  (Continue happy path)        │
```

### Error Message Displayed

```
┌────────────────────────────────────────────────────────────────────┐
│ ⚠️ English only                                                    │
│                                                                    │
│ Sorry: We currently support transcription in English only.        │
│ We're actively working with the community to add 98+ other        │
│ languages. Please click "Reset" and try again with an English     │
│ recording.                                                         │
└────────────────────────────────────────────────────────────────────┘
```

---

## 4. Error Flows

### 4.1 File Too Large

```
User uploads 250MB file
         │
         ▼
┌─────────────────────┐
│  Validate file size │
│  250MB > 200MB      │
│  ❌ FAIL            │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│  Show error toast:  │
│  "File size exceeds │
│   200 MB limit"     │
└─────────────────────┘
         │
         ▼
    UI State: ERROR
    File card shows error
    Reset button visible
```

### 4.2 Invalid File Type

```
User uploads .exe file
         │
         ▼
┌─────────────────────┐
│  Validate file type │
│  .exe not allowed   │
│  ❌ FAIL            │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│  Show error toast:  │
│  "Unsupported file  │
│   format..."        │
└─────────────────────┘
         │
         ▼
    UI State: ERROR
```

### 4.3 Network Error

```
User uploads file
API server unreachable
         │
         ▼
┌─────────────────────┐
│  Try all endpoints  │
│  All fail           │
│  ❌ NETWORK ERROR   │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│  Show error:        │
│  "Unable to reach   │
│   transcription     │
│   service..."       │
└─────────────────────┘
         │
         ▼
    UI State: ERROR
    Endpoints listed
    Reset button visible
```

---

## 5. State Machine

```
                                    ┌──────────────┐
                                    │              │
                       ┌───────────▶│     IDLE     │◀───────────┐
                       │            │              │            │
                       │            └──────┬───────┘            │
                       │                   │                    │
                       │                   │ Upload file        │
                       │                   ▼                    │
                       │            ┌──────────────┐            │
                       │            │              │            │
                       │            │  UPLOADING   │            │
                       │            │              │            │
                       │            └──────┬───────┘            │
                       │                   │                    │
                       │        ┌──────────┴──────────┐         │
                       │        │                     │         │
                       │        ▼                     ▼         │
                       │  ┌──────────┐         ┌──────────┐     │
                       │  │          │         │          │     │
              Reset    │  │PROCESSING│         │  ERROR   │     │  Reset
                       │  │          │         │          │─────┘
                       │  └────┬─────┘         └──────────┘
                       │       │                     ▲
                       │       │                     │
                       │       ▼                     │
                       │  ┌──────────┐               │
                       │  │          │               │
                       └──│COMPLETED │───────────────┘
                          │          │    Error during
                          └──────────┘    download
```

### State Descriptions

| State | Description | Allowed Actions |
|-------|-------------|-----------------|
| IDLE | Initial state, ready for upload | Upload file |
| UPLOADING | File being sent to server | Cancel (abort) |
| PROCESSING | Server processing file | Wait |
| COMPLETED | Transcript ready | Download, Reset |
| ERROR | Something went wrong | Reset |

---

## 6. Download Sub-Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DOWNLOAD SUB-FLOW                                  │
└─────────────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────┐
                    │ Click dropdown  │
                    │ trigger button  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Dropdown opens  │
                    │ Show 3 options: │
                    │ • DOCX          │
                    │ • TXT           │
                    │ • SRT           │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ User selects    │
                    │ format          │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Download button │
                    │ becomes enabled │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ User clicks     │
                    │ Download        │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
    ┌─────────────────┐           ┌─────────────────┐
    │ Format: DOCX    │           │ Format: TXT/SRT │
    │                 │           │                 │
    │ Generate Word   │           │ Create Blob     │
    │ document using  │           │ with text       │
    │ docx library    │           │ content         │
    └────────┬────────┘           └────────┬────────┘
              │                             │
              └──────────────┬──────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Create download │
                    │ link & trigger  │
                    │ browser save    │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Show toast:     │
                    │ "Transcript     │
                    │  downloaded"    │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Dropdown closes │
                    │ (auto)          │
                    └─────────────────┘
```

---

## 7. Mobile Flow Adaptations

### Layout Changes

```
Desktop Layout:
┌─────────────────────────────────────────────────────────────┐
│ [Upload] [Lang Badge] ─────────────── [Download ▼] [Reset] │
└─────────────────────────────────────────────────────────────┘

Mobile Layout:
┌─────────────────────────┐
│ [    Upload Button    ] │
│ [   Language Badge    ] │
│ [   Download ▼       ] │
│ [    Reset Button    ] │
└─────────────────────────┘
```

### Touch Interactions
- Tap to upload (no drag-drop on mobile)
- Tap dropdown to open/close
- Native file picker on tap

---

## 8. Accessibility Flow

### Keyboard Navigation

```
Tab Order:
1. File Upload button
2. (Skip language badge - non-interactive)
3. Download dropdown trigger
4. Reset button (when visible)

Within Dropdown:
1. DOCX option
2. TXT option
3. SRT option
4. Download button
```

### Screen Reader Announcements

| Action | Announcement |
|--------|--------------|
| File uploaded | "File [name] uploaded, processing" |
| Language detected | "Language detected: English" |
| Error | "Error: English only. Press Reset to try again" |
| Download complete | "Transcript downloaded successfully" |

---

## 9. Timing Expectations

| Step | Expected Duration |
|------|-------------------|
| File validation | < 100ms |
| Upload to server | 1-5 sec (depends on size) |
| Language detection | 10-30 seconds |
| Full transcription | 30 sec - 3 min (depends on length) |
| File generation | < 500ms |
| Total (happy path) | 1-4 minutes |

---

*User flow documentation maintained by the VoxText product team*
