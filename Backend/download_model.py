#!/usr/bin/env python3
"""
Download VOSK model for VoxText Transcription

This script downloads the VOSK English model required for transcription.
Run this before starting the server if you haven't already.

Usage:
    python download_model.py

The model will be downloaded to the 'model' folder in the Backend directory.
"""

import os
import sys
import zipfile
import urllib.request
import shutil

# Model URL and info
MODEL_URL = "https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip"
MODEL_NAME = "vosk-model-small-en-us-0.15"
MODEL_SIZE_MB = 40  # Approximate size in MB

# Get script directory
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(SCRIPT_DIR, "model")
ZIP_PATH = os.path.join(SCRIPT_DIR, "vosk-model.zip")


def download_with_progress(url: str, filename: str):
    """Download a file with progress indicator."""

    def reporthook(block_num, block_size, total_size):
        downloaded = block_num * block_size
        if total_size > 0:
            percent = min(100, downloaded * 100 / total_size)
            downloaded_mb = downloaded / 1024 / 1024
            total_mb = total_size / 1024 / 1024
            sys.stdout.write(f"\rDownloading: {percent:.1f}% ({downloaded_mb:.1f}/{total_mb:.1f} MB)")
            sys.stdout.flush()

    try:
        urllib.request.urlretrieve(url, filename, reporthook)
        print()  # New line after progress
        return True
    except Exception as e:
        print(f"\nError downloading: {e}")
        return False


def main():
    print("="*60)
    print("VoxText VOSK Model Downloader")
    print("="*60)
    print()

    # Check if model already exists
    if os.path.exists(MODEL_DIR) and os.listdir(MODEL_DIR):
        print(f"Model already exists at: {MODEL_DIR}")
        response = input("Do you want to re-download? (y/N): ").strip().lower()
        if response != 'y':
            print("Using existing model.")
            return 0

        # Remove existing model
        print("Removing existing model...")
        shutil.rmtree(MODEL_DIR)

    print(f"Model: {MODEL_NAME}")
    print(f"Size: ~{MODEL_SIZE_MB} MB")
    print(f"URL: {MODEL_URL}")
    print()

    # Download
    print("Downloading model...")
    if not download_with_progress(MODEL_URL, ZIP_PATH):
        print("ERROR: Failed to download model.")
        print("Please download manually from:")
        print(f"  {MODEL_URL}")
        print(f"And extract to: {MODEL_DIR}")
        return 1

    # Extract
    print("Extracting model...")
    try:
        with zipfile.ZipFile(ZIP_PATH, 'r') as zip_ref:
            zip_ref.extractall(SCRIPT_DIR)

        # Rename extracted folder
        extracted_path = os.path.join(SCRIPT_DIR, MODEL_NAME)
        if os.path.exists(extracted_path):
            os.rename(extracted_path, MODEL_DIR)

        # Clean up zip
        os.remove(ZIP_PATH)

        print()
        print("="*60)
        print("SUCCESS: Model downloaded and extracted!")
        print(f"Location: {MODEL_DIR}")
        print("="*60)
        return 0

    except Exception as e:
        print(f"ERROR: Failed to extract model: {e}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
