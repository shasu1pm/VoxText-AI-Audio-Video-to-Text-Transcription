# Contributing to VoxText

Thank you for your interest in contributing to VoxText! This guide will help you get started.

---

## Table of Contents

1. [Code of Conduct](#1-code-of-conduct)
2. [Getting Started](#2-getting-started)
3. [How to Contribute](#3-how-to-contribute)
4. [Development Workflow](#4-development-workflow)
5. [Coding Standards](#5-coding-standards)
6. [Commit Guidelines](#6-commit-guidelines)
7. [Pull Request Process](#7-pull-request-process)
8. [Issue Guidelines](#8-issue-guidelines)
9. [Testing](#9-testing)
10. [Documentation](#10-documentation)

---

## 1. Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of:
- Age, body size, disability, ethnicity
- Gender identity and expression
- Level of experience, nationality
- Personal appearance, race, religion
- Sexual identity and orientation

### Expected Behavior

- Be respectful and inclusive
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment, trolling, or personal attacks
- Publishing others' private information
- Any conduct inappropriate for a professional setting

---

## 2. Getting Started

### 2.1 Prerequisites

- Node.js 18+
- Python 3.10+
- Git
- FFmpeg

### 2.2 Fork & Clone

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR-USERNAME/voxtext.git
cd voxtext
git remote add upstream https://github.com/voxtext/voxtext.git
```

### 2.3 Setup Development Environment

```bash
# Frontend
npm install

# Backend
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

### 2.4 Run Development Servers

```bash
# Terminal 1: Backend
cd backend
python server.py

# Terminal 2: Frontend
npm run dev
```

---

## 3. How to Contribute

### 3.1 Types of Contributions

| Contribution | Description |
|--------------|-------------|
| Bug Fixes | Fix issues in the codebase |
| Features | Implement new functionality |
| Documentation | Improve or add documentation |
| Tests | Add or improve tests |
| Translations | Translate UI or docs |
| Design | UI/UX improvements |
| Reviews | Review pull requests |

### 3.2 Finding Issues

Look for issues labeled:
- `good first issue` - Great for newcomers
- `help wanted` - Community help needed
- `bug` - Bug fixes needed
- `enhancement` - New features
- `documentation` - Docs improvements

### 3.3 Claiming Issues

1. Comment on the issue expressing interest
2. Wait for maintainer assignment
3. Start working once assigned

---

## 4. Development Workflow

### 4.1 Branching Strategy

```
main
 │
 ├── develop (default branch for PRs)
 │    │
 │    ├── feature/add-spanish-support
 │    ├── feature/improve-upload-ui
 │    ├── fix/memory-leak-in-transcription
 │    └── docs/update-api-docs
 │
 └── release/v1.1.0
```

### 4.2 Branch Naming

| Type | Format | Example |
|------|--------|---------|
| Feature | `feature/description` | `feature/add-pdf-export` |
| Bug Fix | `fix/description` | `fix/upload-validation-error` |
| Documentation | `docs/description` | `docs/update-readme` |
| Refactor | `refactor/description` | `refactor/simplify-api-calls` |
| Test | `test/description` | `test/add-upload-tests` |

### 4.3 Workflow Steps

```bash
# 1. Sync with upstream
git fetch upstream
git checkout develop
git merge upstream/develop

# 2. Create feature branch
git checkout -b feature/your-feature-name

# 3. Make changes
# ... edit files ...

# 4. Commit changes
git add .
git commit -m "feat: add your feature"

# 5. Push to your fork
git push origin feature/your-feature-name

# 6. Create Pull Request on GitHub
```

---

## 5. Coding Standards

### 5.1 TypeScript/JavaScript (Frontend)

```typescript
// Use TypeScript for all new code
// Use functional components with hooks
// Use explicit types (avoid 'any')

// Good
interface Props {
  disabled?: boolean;
  onDownload: (format: FileFormat) => Promise<boolean>;
}

export function DownloadDropdown({ disabled, onDownload }: Props) {
  const [open, setOpen] = useState(false);
  // ...
}

// Bad
export function DownloadDropdown(props: any) {
  // ...
}
```

### 5.2 Python (Backend)

```python
# Follow PEP 8 style guide
# Use type hints
# Use docstrings for functions

# Good
def detect_language_fast(audio_path: str) -> str:
    """
    Quickly detect language using first 30 seconds of audio.

    Args:
        audio_path: Path to the audio file

    Returns:
        ISO 639-1 language code (e.g., 'en', 'es')
    """
    audio = whisper.load_audio(audio_path)
    # ...

# Bad
def detect_language_fast(audio_path):
    audio = whisper.load_audio(audio_path)
    # ...
```

### 5.3 CSS/Tailwind

```tsx
// Use Tailwind utility classes
// Use cn() for conditional classes
// Follow existing patterns

// Good
<Button
  className={cn(
    "w-full h-11 rounded-xl",
    "bg-[#2563eb] text-white",
    disabled && "opacity-70 cursor-not-allowed"
  )}
>

// Bad
<Button style={{ width: '100%', height: '44px' }}>
```

### 5.4 File Organization

```
// Components: One component per file
// Name matches export: DownloadDropdown.tsx exports DownloadDropdown
// Related files grouped in directories
// Index files for re-exports
```

---

## 6. Commit Guidelines

### 6.1 Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 6.2 Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Code style (formatting, etc.) |
| `refactor` | Code refactoring |
| `test` | Adding/updating tests |
| `chore` | Maintenance tasks |

### 6.3 Examples

```bash
# Feature
feat(download): add PDF export option

# Bug fix
fix(upload): validate file type before upload

# Documentation
docs(readme): add installation instructions

# With body
feat(language): add Spanish language support

- Add Spanish to supported languages list
- Update language detection logic
- Add Spanish test audio files

Closes #123
```

### 6.4 Commit Best Practices

- Keep commits atomic (one logical change per commit)
- Write in imperative mood ("add" not "added")
- Keep subject line under 50 characters
- Reference issues in footer

---

## 7. Pull Request Process

### 7.1 Before Submitting

- [ ] Code follows project style guidelines
- [ ] Self-reviewed the code
- [ ] Added/updated tests if needed
- [ ] Updated documentation if needed
- [ ] All tests pass locally
- [ ] No merge conflicts

### 7.2 PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring

## Related Issues
Closes #123

## Testing
Describe how you tested the changes

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
```

### 7.3 Review Process

1. Submit PR against `develop` branch
2. Automated checks run (linting, tests)
3. Maintainer reviews code
4. Address feedback if any
5. Maintainer approves and merges

### 7.4 After Merge

```bash
# Delete local branch
git checkout develop
git branch -d feature/your-feature-name

# Sync with upstream
git fetch upstream
git merge upstream/develop
```

---

## 8. Issue Guidelines

### 8.1 Bug Reports

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g., Windows 11]
- Browser: [e.g., Chrome 120]
- Node version: [e.g., 18.17]
- Python version: [e.g., 3.11]

**Additional context**
Any other context about the problem.
```

### 8.2 Feature Requests

```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
What you want to happen.

**Describe alternatives you've considered**
Other solutions you've thought about.

**Additional context**
Any other context or screenshots.
```

---

## 9. Testing

### 9.1 Frontend Tests

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

### 9.2 Backend Tests

```bash
# Run tests
cd backend
pytest

# Run with coverage
pytest --cov=.
```

### 9.3 Test Requirements

- All new features should have tests
- Bug fixes should include regression tests
- Maintain >80% code coverage

---

## 10. Documentation

### 10.1 Code Documentation

- Add JSDoc/docstrings to public functions
- Explain complex logic with comments
- Keep README.md updated

### 10.2 Documentation Changes

If your PR affects documentation:
- Update relevant docs in `/Documentation`
- Update inline code comments
- Update README if needed

---

## Questions?

- GitHub Discussions: Ask questions
- Discord: Real-time chat
- Issues: Bug reports and features

---

## Recognition

Contributors are recognized in:
- README.md contributors section
- Release notes
- Annual contributor spotlight

---

**Thank you for contributing to VoxText!**

Your contributions help make transcription accessible to everyone.

---

*Contributing guide maintained by the VoxText team*
