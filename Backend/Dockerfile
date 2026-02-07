# syntax=docker/dockerfile:1

# VoxText Backend - Optimized for low RAM (VOSK only)
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    MALLOC_ARENA_MAX=2 \
    OMP_NUM_THREADS=1 \
    OPENBLAS_NUM_THREADS=1 \
    MKL_NUM_THREADS=1 \
    NUMEXPR_NUM_THREADS=1

WORKDIR /app

# Install only required system packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Build-time toggle for low RAM mode
ARG LOW_RAM=1
ENV LOW_RAM_MODE=${LOW_RAM}

# Copy requirements for better caching
COPY requirements*.txt /tmp/

# Install Python dependencies (low-ram profile by default)
RUN pip install --upgrade pip setuptools wheel && \
    if [ "$LOW_RAM" = "1" ]; then \
      pip install -r /tmp/requirements.lowram.txt; \
    else \
      pip install -r /tmp/requirements.txt; \
    fi

# Download VOSK model (~40MB)
RUN python - <<'PY'
import os, shutil, urllib.request, zipfile

url = "https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip"
zip_path = "/tmp/vosk-model.zip"
urllib.request.urlretrieve(url, zip_path)

with zipfile.ZipFile(zip_path, "r") as z:
    z.extractall("/app")

model_dir = "/app/vosk-model-small-en-us-0.15"
target_dir = "/app/model"
if os.path.exists(target_dir):
    shutil.rmtree(target_dir)
os.rename(model_dir, target_dir)
os.remove(zip_path)
PY

# Copy backend application code
COPY . /app/

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/healthz')"

# Run API with single worker and limited concurrency for low RAM
CMD ["sh", "-c", "uvicorn server:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1 --limit-concurrency ${UVICORN_LIMIT_CONCURRENCY:-1} --timeout-keep-alive 5"]
