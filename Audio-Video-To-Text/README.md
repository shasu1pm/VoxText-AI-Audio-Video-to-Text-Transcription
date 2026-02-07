# Test Audio/Video Files

Place your test audio and video files in this folder for testing the VoxText VOSK transcription.

## Recommended Test Files

### English Files (should transcribe successfully)
- `english_audio.mp3` - Any English audio file
- `english_video.mp4` - Any English video file

### Non-English Files (should return language error)
- `spanish_audio.mp3` - Spanish audio
- `french_video.mp4` - French video
- `hindi_audio.mp3` - Hindi audio

## Supported Formats
- Audio: MP3, WAV, M4A, AAC, FLAC
- Video: MP4, TS, MOV

## Running Tests

From the Backend folder:

```bash
# Test a single file
python test_transcription.py "../Audio-Video-To-Text/english_audio.mp3"

# Test multiple files
python test_transcription.py "../Audio-Video-To-Text/english_audio.mp3" "../Audio-Video-To-Text/spanish_audio.mp3"

# Test with expected language
python test_transcription.py -e "../Audio-Video-To-Text/english_audio.mp3"
python test_transcription.py -n "../Audio-Video-To-Text/spanish_audio.mp3"
```

## Expected Results

| File Type | Language Detected | Transcript | Download Available |
|-----------|------------------|------------|-------------------|
| English audio | `en` or `english` | Yes | Yes |
| English video | `en` or `english` | Yes | Yes |
| Non-English audio | Language code (e.g., `es`, `fr`) | No | No |
| Non-English video | Language code (e.g., `es`, `fr`) | No | No |

## Sample Test Files

You can download sample audio files from:
- [LibriVox](https://librivox.org/) - Public domain English audiobooks
- [Wikimedia Commons](https://commons.wikimedia.org/wiki/Category:Audio_files) - Various languages

Or generate test audio using:
- Text-to-speech tools (e.g., Google TTS, espeak)
- Recording your own voice
