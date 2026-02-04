@echo off
echo Installing dependencies...
pip install -r requirements.txt

echo.
echo Starting Whisper Transcription Server...
echo Server will be available at http://localhost:8000
echo.
python server.py
pause
