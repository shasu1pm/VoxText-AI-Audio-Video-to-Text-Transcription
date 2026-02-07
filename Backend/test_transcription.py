#!/usr/bin/env python3
"""
Test script for VoxText VOSK Transcription API

Usage:
    python test_transcription.py [path_to_audio_or_video_file]

If no file is provided, it will test with a generated sample audio file.

Expected results:
- English audio/video: Returns transcript with language='en'
- Non-English audio/video: Returns empty transcript with detected language code
"""

import os
import sys
import json
import wave
import struct
import tempfile
import argparse
from pathlib import Path

try:
    import requests
except ImportError:
    print("ERROR: requests package is required. Install with: pip install requests")
    sys.exit(1)

# Default API endpoint
DEFAULT_API_URL = "http://localhost:8000/transcribe"


def create_sample_wav(filename: str, duration: float = 2.0, frequency: float = 440.0):
    """Create a sample WAV file with a simple tone (for basic connectivity testing)."""
    sample_rate = 16000
    num_samples = int(sample_rate * duration)

    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)

        for i in range(num_samples):
            value = int(32767.0 * 0.3 * (i / num_samples) *
                       (1 if (i % int(sample_rate / frequency)) < int(sample_rate / frequency / 2) else -1))
            data = struct.pack('<h', value)
            wav_file.writeframesraw(data)

    return filename


def test_transcription(file_path: str, api_url: str, expected_language: str = None):
    """
    Test transcription endpoint with a file.

    Args:
        file_path: Path to audio/video file
        api_url: API endpoint URL
        expected_language: Expected language code (e.g., 'en' for English)

    Returns:
        dict: API response
    """
    if not os.path.exists(file_path):
        print(f"ERROR: File not found: {file_path}")
        return None

    file_name = os.path.basename(file_path)
    file_size = os.path.getsize(file_path)

    print(f"\n{'='*60}")
    print(f"Testing: {file_name}")
    print(f"Size: {file_size:,} bytes ({file_size/1024/1024:.2f} MB)")
    print(f"{'='*60}")

    try:
        with open(file_path, 'rb') as f:
            files = {
                'file': (file_name, f, 'application/octet-stream')
            }

            print(f"Uploading to {api_url}...")
            response = requests.post(api_url, files=files, timeout=300)

        print(f"Status Code: {response.status_code}")

        if response.status_code == 200:
            result = response.json()

            print(f"\nResponse:")
            print(f"  Language: {result.get('language', 'N/A')}")
            print(f"  Text Length: {len(result.get('text', ''))} characters")
            print(f"  Segments: {len(result.get('segments', []))}")
            print(f"  SRT Lines: {len(result.get('srt', '').split(chr(10))) if result.get('srt') else 0}")

            # Show preview of transcript
            text = result.get('text', '')
            if text:
                preview = text[:200] + "..." if len(text) > 200 else text
                print(f"\n  Transcript Preview:")
                print(f"  {preview}")
            else:
                print(f"\n  [No transcript returned - possibly non-English audio or silence]")

            # Validate expected language if provided
            if expected_language:
                detected = result.get('language', '').lower()
                if expected_language == 'non-en':
                    # Expect non-English
                    if detected not in ('en', 'english'):
                        print(f"\n  ✓ Non-English detection PASSED (got: {detected})")
                    else:
                        print(f"\n  ✗ Non-English detection FAILED (expected non-English, got: {detected})")
                elif detected == expected_language.lower():
                    print(f"\n  ✓ Language detection PASSED (expected: {expected_language})")
                else:
                    print(f"\n  ✗ Language detection FAILED")
                    print(f"    Expected: {expected_language}")
                    print(f"    Got: {detected}")

            return result
        else:
            print(f"ERROR: {response.text}")
            return None

    except requests.exceptions.ConnectionError:
        print(f"ERROR: Cannot connect to {api_url}")
        print("Make sure the backend server is running.")
        return None
    except requests.exceptions.Timeout:
        print("ERROR: Request timed out")
        return None
    except Exception as e:
        print(f"ERROR: {e}")
        return None


def test_health(api_url: str):
    """Test health endpoint."""
    health_url = api_url.rsplit('/', 1)[0] + '/healthz'
    try:
        response = requests.get(health_url, timeout=5)
        if response.status_code == 200:
            print(f"✓ Health check passed: {response.json()}")
            return True
        else:
            print(f"✗ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"✗ Health check failed: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(description='Test VoxText VOSK Transcription API')
    parser.add_argument('files', nargs='*', help='Audio/video files to test')
    parser.add_argument('--english', '-e', action='store_true',
                       help='Expect English language detection')
    parser.add_argument('--non-english', '-n', action='store_true',
                       help='Expect non-English language detection')
    parser.add_argument('--url', '-u', default=DEFAULT_API_URL,
                       help=f'API URL (default: {DEFAULT_API_URL})')

    args = parser.parse_args()
    api_url = args.url

    print("VoxText VOSK Transcription API Test")
    print("="*60)
    print(f"API URL: {api_url}")

    # Test health endpoint first
    print("\nChecking API health...")
    if not test_health(api_url):
        print("\nBackend is not responding. Please start the server first:")
        print("  cd Backend")
        print("  python server.py")
        sys.exit(1)

    # Determine expected language
    expected_lang = None
    if args.english:
        expected_lang = 'en'
    elif args.non_english:
        expected_lang = 'non-en'

    results = []

    if args.files:
        # Test provided files
        for file_path in args.files:
            result = test_transcription(file_path, api_url, expected_lang)
            results.append({
                'file': file_path,
                'success': result is not None,
                'result': result
            })
    else:
        # No files provided - create a test file
        print("\nNo test files provided. Creating a sample audio file...")
        print("(Note: This is just a tone, not speech, so transcript will be empty)")

        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp:
            tmp_path = tmp.name

        try:
            create_sample_wav(tmp_path, duration=2.0)
            result = test_transcription(tmp_path, api_url)
            results.append({
                'file': 'sample.wav',
                'success': result is not None,
                'result': result
            })
        finally:
            os.unlink(tmp_path)

    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)

    passed = sum(1 for r in results if r['success'])
    total = len(results)

    for r in results:
        status = "✓ PASS" if r['success'] else "✗ FAIL"
        print(f"  {status}: {r['file']}")

    print(f"\nTotal: {passed}/{total} tests passed")

    return 0 if passed == total else 1


if __name__ == "__main__":
    sys.exit(main())
