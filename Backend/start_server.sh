#!/bin/bash

echo "============================================"
echo "  VoxText VOSK Transcription Server"
echo "============================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed"
    echo "Please install Python 3.9+ using your package manager"
    exit 1
fi

# Check if FFmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "ERROR: FFmpeg is not installed"
    echo "Please install FFmpeg:"
    echo "  macOS: brew install ffmpeg"
    echo "  Ubuntu/Debian: sudo apt install ffmpeg"
    echo "  Fedora: sudo dnf install ffmpeg"
    exit 1
fi

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Check if VOSK model exists
if [ ! -d "model" ]; then
    echo ""
    echo "VOSK model not found. Downloading..."
    echo "This may take a few minutes depending on your internet connection."
    echo ""

    # Download the small English model (~40MB)
    curl -L -o vosk-model.zip https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip

    if [ $? -ne 0 ]; then
        echo ""
        echo "ERROR: Failed to download VOSK model."
        echo "Please download manually from: https://alphacephei.com/vosk/models"
        echo "Download: vosk-model-small-en-us-0.15.zip"
        echo "Extract to: Backend/model"
        exit 1
    fi

    echo "Extracting model..."
    unzip -q vosk-model.zip

    # Rename extracted folder to 'model'
    if [ -d "vosk-model-small-en-us-0.15" ]; then
        mv vosk-model-small-en-us-0.15 model
    fi

    # Clean up zip file
    rm vosk-model.zip

    echo "Model downloaded and extracted successfully!"
    echo ""
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

echo "Installing/updating dependencies..."
pip install -r requirements.txt

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies"
    exit 1
fi

echo ""
echo "============================================"
echo "  Starting VOSK Transcription Server"
echo "  Server will be available at:"
echo "  http://localhost:8000"
echo "============================================"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python server.py
