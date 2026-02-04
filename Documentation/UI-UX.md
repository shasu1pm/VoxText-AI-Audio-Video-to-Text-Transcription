# UI/UX Design Guidelines

## VoxText - Design System & User Experience

**Version:** 1.0
**Last Updated:** February 2026

---

## 1. Design Principles

### 1.1 Core Principles

| Principle | Description |
|-----------|-------------|
| **Simplicity** | One-page workflow, minimal clicks to complete task |
| **Clarity** | Clear feedback at every step, no ambiguous states |
| **Speed** | Fast visual feedback, progress indicators |
| **Accessibility** | WCAG 2.1 AA compliant, keyboard navigable |
| **Trust** | Privacy-focused messaging, transparent limitations |

### 1.2 Design Goals
- User completes transcription in < 5 clicks
- Error states are helpful, not frustrating
- Mobile experience matches desktop quality
- No learning curve for first-time users

---

## 2. Color System

### 2.1 Primary Colors

| Name | Hex | Usage |
|------|-----|-------|
| Primary Blue | `#2563eb` | Primary actions, links, focus states |
| Primary Blue (Hover) | `#1d4ed8` | Button hover states |
| White | `#ffffff` | Backgrounds, cards |
| Dark Gray | `#111827` | Primary text |

### 2.2 Semantic Colors

| Name | Hex | Usage |
|------|-----|-------|
| Error Red | `#ef4444` | Error states, destructive actions |
| Destructive | `#d4183d` | Critical errors |
| Success Green | `#22c55e` | Success states |
| Warning Yellow | `#f59e0b` | Warning messages |
| Muted Gray | `#6b7280` | Secondary text, placeholders |
| Border Gray | `#e5e7eb` | Borders, dividers |
| Background Gray | `#f3f4f6` | Disabled states, backgrounds |

### 2.3 Color Application

```css
/* Primary action buttons */
.btn-primary {
  background-color: #2563eb;
  color: #ffffff;
}

/* Error states */
.error-text { color: #ef4444; }
.error-border { border-color: #ef4444; }
.error-bg { background-color: rgba(239, 68, 68, 0.1); }

/* Disabled states */
.disabled {
  background-color: #f3f4f6;
  color: #9ca3af;
  border-color: #e5e7eb;
}
```

---

## 3. Typography

### 3.1 Font Family
- **Primary:** System font stack (San Francisco, Segoe UI, Roboto)
- **Monospace:** For code, timestamps

### 3.2 Font Sizes

| Name | Size | Line Height | Usage |
|------|------|-------------|-------|
| xs | 12px | 16px | Captions, metadata |
| sm | 14px | 20px | Secondary text, labels |
| base | 16px | 24px | Body text |
| lg | 18px | 28px | Emphasized text |
| xl | 20px | 28px | Section headers |
| 2xl | 24px | 32px | Card titles |
| 3xl | 30px | 36px | Page headers |

### 3.3 Font Weights

| Weight | Value | Usage |
|--------|-------|-------|
| Normal | 400 | Body text |
| Medium | 500 | Labels, navigation |
| Semibold | 600 | Buttons, headings |
| Bold | 700 | Emphasis, hover states |

---

## 4. Spacing System

### 4.1 Base Unit
- Base unit: 4px
- Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64

### 4.2 Component Spacing

| Element | Padding | Margin |
|---------|---------|--------|
| Buttons | 12px 16px | - |
| Cards | 24px - 32px | 16px - 24px |
| Form inputs | 12px 16px | 8px bottom |
| Sections | 32px - 48px | 24px - 32px |

---

## 5. Component Specifications

### 5.1 Buttons

#### Primary Button (File Upload, Download)
```css
.btn-primary {
  height: 44px;
  padding: 0 16px;
  border-radius: 12px;
  background: #2563eb;
  color: white;
  font-weight: 600;
  font-size: 14px;
}

.btn-primary:hover {
  font-weight: 700;
}

.btn-primary:disabled {
  background: #93c5fd;
  opacity: 0.7;
  cursor: not-allowed;
}
```

#### Ghost Button (Reset)
```css
.btn-ghost {
  height: 44px;
  padding: 0 16px;
  border-radius: 12px;
  background: #d3e3fd;
  color: #111827;
}

.btn-ghost:hover {
  background: #ea4335;
  color: white;
  font-weight: 700;
}
```

### 5.2 Download Dropdown

#### Trigger Button
```css
.dropdown-trigger {
  width: 260px;
  height: 44px;
  padding: 0 16px;
  border: 1px solid #ef4444;
  border-radius: 12px;
  background: white;
  color: #111827;
}

.dropdown-trigger:disabled {
  background: #f3f4f6;
  color: #9ca3af;
  border-color: #e5e7eb;
}
```

#### Dropdown Menu
```css
.dropdown-menu {
  min-width: 280px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: white;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
}
```

#### Dropdown Option
```css
.dropdown-option {
  height: 56px;
  padding: 0 12px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.dropdown-option:hover {
  background: #f3f4f6;
}

.dropdown-option.selected {
  background: #eef2ff;
}

.option-title {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.option-subtitle {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
}
```

### 5.3 Language Badge

```css
.language-badge {
  padding: 8px 16px;
  border-radius: 9999px; /* pill shape */
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.language-badge.normal {
  background: rgba(156, 163, 175, 0.1);
  color: #6b7280;
}

.language-badge.error {
  background: rgba(212, 24, 61, 0.1);
  color: #d4183d;
  border: 1px solid rgba(212, 24, 61, 0.2);
}
```

### 5.4 Progress Bar

```css
.progress-container {
  height: 8px;
  border-radius: 4px;
  background: #e5e7eb;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-bar.uploading { background: #2563eb; }
.progress-bar.processing { background: #f59e0b; }
.progress-bar.completed { background: #22c55e; }
.progress-bar.error { background: #ef4444; }
```

### 5.5 Error Alert

```css
.error-alert {
  padding: 16px;
  border-radius: 12px;
  background: rgba(212, 24, 61, 0.1);
  border: 1px solid rgba(212, 24, 61, 0.2);
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.error-icon {
  width: 20px;
  height: 20px;
  color: #d4183d;
  flex-shrink: 0;
}

.error-title {
  font-weight: 600;
  color: #d4183d;
  margin-bottom: 4px;
}

.error-message {
  font-size: 14px;
  color: rgba(212, 24, 61, 0.8);
}
```

---

## 6. Layout & Grid

### 6.1 Container
- Max width: 1280px (5xl)
- Horizontal padding: 16px (mobile), 24px (tablet), 32px (desktop)

### 6.2 Card Layout
```css
.transcription-card {
  max-width: 1024px; /* 5xl */
  margin: 0 auto;
  padding: 24px; /* mobile */
  padding: 32px; /* desktop */
  border-radius: 24px;
  border: 2px solid #e5e7eb;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}
```

### 6.3 Action Row
```css
.action-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

/* Order on mobile */
/* 1. File Upload */
/* 2. Language Badge */
/* 3. Download Dropdown */
/* 4. Reset Button */
```

---

## 7. Responsive Breakpoints

| Breakpoint | Width | Behavior |
|------------|-------|----------|
| Mobile | < 640px | Stack layout, full-width buttons |
| Tablet | 640px - 1024px | Flex wrap, medium spacing |
| Desktop | > 1024px | Full layout, spacer between groups |

### 7.1 Mobile Adaptations
- Buttons become full-width
- Dropdown matches trigger width
- Reduced padding (24px → 16px)
- Stacked action row

---

## 8. Icons

### 8.1 Icon Library
Using **Lucide React** for consistency.

### 8.2 Icon Sizes

| Context | Size |
|---------|------|
| Buttons | 16px (w-4 h-4) |
| Badges | 16px (w-4 h-4) |
| Dropdown options | 20px (w-5 h-5) |
| Alerts | 20px (w-5 h-5) |

### 8.3 Key Icons

| Icon | Usage |
|------|-------|
| `Upload` | File upload button |
| `Download` | Download button/dropdown |
| `ChevronDown` | Dropdown indicator |
| `File` | Format options |
| `Languages` | Language badge |
| `RotateCcw` | Reset button |
| `AlertCircle` | Error states |

---

## 9. Animation & Transitions

### 9.1 Standard Transitions
```css
/* Color/background transitions */
transition: colors 0.2s ease;

/* Font weight (prevent layout shift) */
.btn-text {
  display: inline-grid;
}
.btn-text > span:first-child {
  grid-area: 1 / 1;
}
.btn-text > span:last-child {
  grid-area: 1 / 1;
  font-weight: 700;
  visibility: hidden;
}
```

### 9.2 Progress Animation
- Simulated progress during upload
- Smooth width transitions
- Color changes for status

---

## 10. Accessibility

### 10.1 Requirements
- WCAG 2.1 AA compliance
- Keyboard navigation for all interactive elements
- Focus visible indicators
- Screen reader support
- Color contrast ratio ≥ 4.5:1

### 10.2 Focus States
```css
.interactive:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

/* Dropdown trigger */
.dropdown-trigger:focus-visible {
  border-color: #ef4444;
  ring: 2px;
  ring-color: #ef4444;
}
```

### 10.3 ARIA Labels
- File input: `aria-label="Upload audio or video file"`
- Download dropdown: `aria-haspopup="listbox"`
- Progress bar: `aria-valuenow`, `aria-valuemin`, `aria-valuemax`

---

## 11. Error States

### 11.1 Error Types

| Error | Visual Treatment |
|-------|------------------|
| Non-English detected | Red badge + inline alert |
| File too large | Toast notification |
| Invalid file type | Toast notification |
| Network error | Toast + error message |
| Transcription failed | Toast + generic error |

### 11.2 Error Message Guidelines
- Be specific about what went wrong
- Provide clear next action (e.g., "Click Reset")
- Use friendly, non-technical language
- Keep messages under 2 sentences

---

## 12. Empty & Loading States

### 12.1 Initial State (Idle)
- Upload area visible with drag-drop prompt
- Language badge shows "—"
- Download dropdown disabled

### 12.2 Uploading State
- Progress bar animating
- File card showing metadata
- "Uploading..." status text

### 12.3 Processing State
- Progress bar at ~90%
- "Processing..." status text
- Spinner or animation

### 12.4 Completed State
- Progress bar at 100% (green)
- Language badge shows detected language
- Download dropdown enabled

---

*Design system maintained by the VoxText design team*
