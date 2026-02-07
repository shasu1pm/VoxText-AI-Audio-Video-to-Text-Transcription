#!/usr/bin/env python3
"""
End-to-end upload test for VoxText backend.

Usage:
  python scripts/test_uploads.py --url http://localhost:8000/transcribe
"""

import argparse
import os
import sys
from pathlib import Path

try:
    import requests
except ImportError:
    print("ERROR: requests is required. Install with: pip install requests")
    sys.exit(1)

ROOT = Path(__file__).resolve().parents[1]
TEST_DIR = ROOT / "Audio-Video-To-Text"

ALLOWED_ENGLISH = {"en", "english", "en-us", "en-gb", "eng"}
UNKNOWN_TOKENS = {"", "unknown", "unk", "und", "undefined", "none", "n/a", "na", "-", "null"}

# Expected classification per file (adjust if you add/rename test assets)
EXPECTED = {
    "Audio.mp3": "en",
    "Video.mp4": "en",
    "Other Language.mp4": "non-en",
    "Song-New.mp3": "non-en",
    "File Music.mp4": "non-en",
    "2-File Music.mp4": "non-en",
}


def normalize_lang(code: str) -> str:
    if code is None:
        return ""
    value = str(code).strip().lower()
    if ":" in value:
        value = value.split(":", 1)[0].strip()
    value = value.replace("_", "-")
    if value in UNKNOWN_TOKENS:
        return ""
    if value in ("en-us", "en-gb", "eng", "english"):
        return "en"
    if value in ("zh-cn", "zh-tw", "cmn"):
        return "zh"
    if value in ("pt-br", "pt-pt"):
        return "pt"
    if "-" in value:
        base = value.split("-", 1)[0]
        if base:
            return base
    return value


def is_english(code: str) -> bool:
    return normalize_lang(code) in ALLOWED_ENGLISH


def post_file(url: str, path: Path, timeout: int) -> dict:
    with path.open("rb") as handle:
        files = {"file": (path.name, handle, "application/octet-stream")}
        response = requests.post(url, files=files, timeout=timeout)
    if response.status_code != 200:
        raise RuntimeError(f"{response.status_code} {response.text[:200]}")
    return response.json()


def validate_result(filename: str, payload: dict, expected: str) -> tuple[bool, str]:
    language = normalize_lang(payload.get("language", ""))
    text = str(payload.get("text", "") or "").strip()

    if not language:
        return False, "missing language"
    if language in UNKNOWN_TOKENS:
        return False, f"invalid language: {language!r}"

    if expected == "en":
        if not is_english(language):
            return False, f"expected English, got {language}"
        if not text:
            return False, "expected transcript text, got empty"
        return True, "ok"

    if expected == "non-en":
        if is_english(language):
            return False, f"expected non-English, got {language}"
        if text:
            return False, "expected empty text for non-English"
        return True, "ok"

    return True, "ok"


def main() -> int:
    parser = argparse.ArgumentParser(description="Test VoxText uploads against backend.")
    parser.add_argument("--url", default="http://localhost:8000/transcribe", help="Transcription endpoint URL")
    parser.add_argument("--timeout", type=int, default=600, help="Request timeout in seconds")
    args = parser.parse_args()

    if not TEST_DIR.exists():
        print(f"ERROR: Missing test directory: {TEST_DIR}")
        return 1

    files = sorted([p for p in TEST_DIR.iterdir() if p.is_file() and p.suffix.lower() != ".md"])
    if not files:
        print("ERROR: No test files found.")
        return 1

    print(f"Testing {len(files)} files against {args.url}")
    print("-" * 72)

    failures = 0
    for path in files:
        expected = EXPECTED.get(path.name, "unknown")
        try:
            result = post_file(args.url, path, args.timeout)
            ok, reason = validate_result(path.name, result, expected)
            status = "PASS" if ok else "FAIL"
            language = normalize_lang(result.get("language", ""))
            text_len = len(str(result.get("text", "") or ""))
            print(f"{status}: {path.name} | expected={expected} | lang={language} | text_len={text_len} | {reason}")
            if not ok:
                failures += 1
        except Exception as exc:
            failures += 1
            print(f"FAIL: {path.name} | expected={expected} | error={exc}")

    print("-" * 72)
    if failures:
        print(f"FAILED: {failures} file(s)")
        return 1
    print("ALL TESTS PASSED")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
