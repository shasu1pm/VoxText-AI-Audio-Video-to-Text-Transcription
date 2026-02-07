@echo off
setlocal enabledelayedexpansion

echo ============================================
echo   VoxText VOSK Transcription Server
echo ============================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.9+ from https://python.org
    pause
    exit /b 1
)

REM Check if FFmpeg is installed
ffmpeg -version >nul 2>&1
if errorlevel 1 (
    echo ERROR: FFmpeg is not installed or not in PATH
    echo Please install FFmpeg from https://ffmpeg.org/download.html
    echo Or via chocolatey: choco install ffmpeg
    pause
    exit /b 1
)

REM Check if VOSK model exists
if not exist "model" (
    echo.
    echo VOSK model not found. Downloading...
    echo This may take a few minutes depending on your internet connection.
    echo.

    REM Download the small English model (~40MB)
    curl -L -o vosk-model.zip https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip

    if errorlevel 1 (
        echo.
        echo ERROR: Failed to download VOSK model.
        echo Please download manually from: https://alphacephei.com/vosk/models
        echo Download: vosk-model-small-en-us-0.15.zip
        echo Extract to: Backend\model
        pause
        exit /b 1
    )

    echo Extracting model...
    powershell -command "Expand-Archive -Path 'vosk-model.zip' -DestinationPath '.' -Force"

    REM Rename extracted folder to 'model'
    if exist "vosk-model-small-en-us-0.15" (
        ren "vosk-model-small-en-us-0.15" "model"
    )

    REM Clean up zip file
    del vosk-model.zip

    echo Model downloaded and extracted successfully!
    echo.
)

echo Installing/updating dependencies...
pip install -r requirements.txt

if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ============================================
echo   Starting VOSK Transcription Server
echo   Server will be available at:
echo   http://localhost:8000
echo ============================================
echo.
echo Press Ctrl+C to stop the server
echo.

python server.py
pause
