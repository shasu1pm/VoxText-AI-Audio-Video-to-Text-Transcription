# Security & Privacy Policy

## VoxText - Security and Data Privacy Documentation

**Version:** 1.0
**Last Updated:** February 2026

---

## 1. Privacy Commitment

VoxText is built with a **privacy-first** philosophy. We believe your audio and video files are personal, and we've designed our system to respect that.

### Core Privacy Principles

| Principle | Implementation |
|-----------|----------------|
| **No Cloud Storage** | Files are never uploaded to cloud services |
| **Local Processing** | All transcription happens on local/self-hosted servers |
| **No Data Retention** | Files are deleted immediately after processing |
| **No Tracking** | No analytics, cookies, or user tracking |
| **No Accounts** | No login required, no user data collected |
| **Open Source** | Code is transparent and auditable |

---

## 2. Data Handling

### 2.1 File Upload

When you upload a file:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │────▶│   Server    │────▶│   Whisper   │
│   (File)    │     │  (Temp Dir) │     │   (Memory)  │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   DELETED   │
                    │ (Immediate) │
                    └─────────────┘
```

### 2.2 File Lifecycle

| Stage | Duration | Storage |
|-------|----------|---------|
| Upload | Seconds | Temp directory |
| Processing | Seconds-minutes | Memory only |
| Post-processing | 0 | Deleted |
| Long-term | Never | Not stored |

### 2.3 Temporary Files

```python
# Files are saved to temp directory
with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as tmp:
    content = await uploaded_file.read()
    tmp.write(content)
    tmp_path = tmp.name

# ... processing ...

# Files are deleted immediately after
finally:
    try:
        os.unlink(tmp_path)
    except:
        pass
```

---

## 3. What We Collect

### 3.1 Data We DO Collect

| Data | Purpose | Retention |
|------|---------|-----------|
| None | N/A | N/A |

**We collect absolutely no user data.**

### 3.2 Data We DO NOT Collect

- Audio/video file contents
- Transcription results
- User IP addresses
- Browser fingerprints
- Usage analytics
- Cookies
- Email addresses
- Account information
- Location data

---

## 4. Data Transmission

### 4.1 Network Security

| Protocol | Usage |
|----------|-------|
| HTTPS | Required in production |
| HTTP | Development only |

### 4.2 Encryption

- **In Transit:** TLS 1.2+ encryption (production)
- **At Rest:** Files not stored, encryption N/A

### 4.3 CORS Policy

```python
# Development - permissive
allow_origins=["*"]

# Production - restrictive
allow_origins=["https://your-domain.com"]
```

---

## 5. Server Security

### 5.1 Access Control

- No authentication required (open access)
- No admin panel or backend access
- Server-side file validation

### 5.2 Input Validation

All uploads are validated before processing:

```python
# File type validation
valid_types = [
    "audio/mpeg", "audio/wav", "audio/x-m4a",
    "audio/aac", "audio/flac", "video/mp4",
    "video/mp2t"
]

# File size validation
MAX_FILE_SIZE = 200 * 1024 * 1024  # 200 MB
```

### 5.3 Server Hardening (Production)

Recommended security measures:

- [ ] Run behind reverse proxy (Nginx)
- [ ] Enable rate limiting
- [ ] Use firewall rules
- [ ] Disable directory listing
- [ ] Keep dependencies updated
- [ ] Use non-root user
- [ ] Enable security headers

---

## 6. Client-Side Security

### 6.1 Browser Storage

VoxText does not use:
- LocalStorage
- SessionStorage
- IndexedDB
- Cookies

### 6.2 JavaScript Security

- No eval() or dynamic code execution
- No inline scripts
- Content Security Policy recommended

### 6.3 File Handling

Files processed entirely in JavaScript for download generation:
- DOCX created using `docx` library
- TXT/SRT created using Blob API
- Files never sent back to server

---

## 7. Third-Party Services

### 7.1 External Services Used

| Service | Purpose | Data Shared |
|---------|---------|-------------|
| None | N/A | N/A |

**VoxText does not use any third-party services that receive user data.**

### 7.2 Open Source Dependencies

All dependencies are open source and auditable:

**Frontend:**
- React (MIT)
- Tailwind CSS (MIT)
- Radix UI (MIT)
- Lucide Icons (ISC)

**Backend:**
- FastAPI (MIT)
- OpenAI Whisper (MIT)
- Uvicorn (BSD)

---

## 8. Self-Hosting Recommendations

For maximum privacy, we recommend self-hosting:

### 8.1 Local Deployment

```bash
# Run entirely on your machine
python backend/server.py
npm run dev
```

### 8.2 Air-Gapped Deployment

VoxText can run completely offline after initial setup:
1. Install dependencies with internet
2. Download Whisper models
3. Disconnect from internet
4. Run locally

### 8.3 Docker Isolation

```yaml
services:
  voxtext:
    network_mode: "bridge"
    # No external network access needed
```

---

## 9. Compliance

### 9.1 GDPR Considerations

| Requirement | Status |
|-------------|--------|
| Data minimization | Compliant (no data collected) |
| Right to erasure | N/A (no data stored) |
| Data portability | N/A (no user accounts) |
| Consent | N/A (no personal data processed) |

### 9.2 CCPA Considerations

| Requirement | Status |
|-------------|--------|
| Right to know | N/A (no data collected) |
| Right to delete | N/A (no data stored) |
| Right to opt-out | N/A (no data sold) |

### 9.3 HIPAA Considerations

VoxText is **not** HIPAA compliant out of the box. For healthcare use:
- Deploy on HIPAA-compliant infrastructure
- Implement audit logging
- Add authentication
- Enable encryption at rest

---

## 10. Vulnerability Disclosure

### 10.1 Reporting Security Issues

If you discover a security vulnerability:

1. **Do not** open a public GitHub issue
2. Email: security@your-domain.com
3. Include:
   - Description of vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### 10.2 Response Timeline

| Stage | Timeline |
|-------|----------|
| Acknowledgment | 24 hours |
| Initial assessment | 72 hours |
| Fix development | 1-2 weeks |
| Public disclosure | After fix released |

---

## 11. Security Best Practices for Users

### 11.1 Recommended Practices

- [ ] Use HTTPS in production
- [ ] Keep browser updated
- [ ] Don't upload sensitive files on shared computers
- [ ] Clear browser cache after use on shared devices
- [ ] Self-host for sensitive content

### 11.2 What NOT to Upload

While we don't store your files, consider not uploading:
- Medical records
- Legal proceedings
- Financial information
- Passwords or credentials
- Classified or confidential materials

---

## 12. Updates to This Policy

This security and privacy policy may be updated as the project evolves.

**Change Log:**

| Date | Version | Changes |
|------|---------|---------|
| Feb 2026 | 1.0 | Initial release |

---

## 13. Contact

For privacy-related questions:
- GitHub Issues: https://github.com/your-org/voxtext/issues
- Email: privacy@your-domain.com

---

**Summary:** VoxText processes your files locally, stores nothing, tracks nothing, and deletes everything immediately. Your privacy is our priority.

---

*Security & Privacy documentation maintained by the VoxText team*
