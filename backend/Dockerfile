FROM python:3.10-slim

# Install system dependencies (ffmpeg is required for Whisper audio processing)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY . .

# Expose port (Hugging Face Spaces defaults to 7860, others use PORT env)
ENV PORT=7860
EXPOSE 7860

# Run uvicorn server
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT}"]
