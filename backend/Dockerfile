# ---------- Base image ----------
FROM python:3.11-slim AS base

# Ensure stdout/stderr are unbuffered
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Set working directory
WORKDIR /app

# Install system deps (if you need build tools later, add them here)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
 && rm -rf /var/lib/apt/lists/*

# ---------- Dependencies layer ----------
COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# ---------- App layer ----------
COPY . .

# Expose port for local runs (Cloud Run defaults to 8080)
EXPOSE 8080

# Default command: run FastAPI with uvicorn
# If your main file is app/main.py and FastAPI instance is `app`
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
