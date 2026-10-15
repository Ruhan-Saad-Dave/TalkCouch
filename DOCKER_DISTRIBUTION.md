# Single-Container Docker Distribution Guide

This document outlines how to compile **TalkCouch** into a single Docker image containing both the React frontend and FastAPI backend. This setup allows external users to run your entire application with a single command.

---

## 1. How It Works (The Unified Architecture)

Instead of running two separate containers (one for the frontend served by Nginx, and one for the backend served by Uvicorn), we combine them:
1. **Frontend Compilation:** During the Docker build, Node.js compiles the React SPA into static HTML, CSS, and JS files.
2. **Backend Server integration:** The FastAPI backend is configured to host these compiled static files directly.
3. **No Port conflicts or CORS issues:** Everything is served from a single port (e.g., `8000`). All API calls are sent using relative paths (e.g., `/api/questions/...` instead of `http://localhost:8000/api/questions/...`).

---

## 2. End-User Guide (What Your Users Do)

Assuming the user has a **brand-new laptop** with nothing downloaded, here is their setup flow:

### Step 1: Pre-requisites
1. **Install Docker Desktop:** Download and install [Docker Desktop](https://www.docker.com/products/docker-desktop/).
2. **Get a Gemini API Key:** Create a free API Key from [Google AI Studio](https://aistudio.google.com/).

### Step 2: Running the App
The user opens their terminal (Command Prompt, PowerShell, or macOS Terminal) and runs:

```bash
docker run -d -p 8000:8000 -e GOOGLE_API_KEY="YOUR_GEMINI_API_KEY_HERE" yourusername/talkcouch:latest
```

### Step 3: Accessing the App
Open the web browser and visit:
[http://localhost:8000](http://localhost:8000)

---

## 3. Required Codebase Changes

To enable this unified structure, the following modifications are required in your codebase:

### A. Frontend API URL
In [frontend/src/services/api.ts](file:///C:/Users/ruhan/TalkCouch/frontend/src/services/api.ts#L3), change `API_URL` to fallback to an empty string when the environment variable is not defined:
```typescript
const API_URL = import.meta.env.VITE_API_URL || "";
```
*Why? If `VITE_API_URL` is empty, requests will resolve relatively (e.g., `/api/...`), prompting the browser to hit the FastAPI backend that served the page.*

### B. FastAPI Backend Configuration
Modify [backend/main.py](file:///C:/Users/ruhan/TalkCouch/backend/main.py) to serve the static frontend assets. Add the following at the bottom of the file:

```python
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

# Path where frontend build assets will live in the container
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")

if os.path.exists(STATIC_DIR):
    # Mount the /assets folder for static JS/CSS
    app.mount("/assets", StaticFiles(directory=os.path.join(STATIC_DIR, "assets")), name="assets")

    # Serve the main SPA index.html on all non-API paths
    @app.get("/{catchall:path}")
    async def serve_frontend(catchall: str):
        # Exclude FastAPI docs and API endpoints
        if catchall.startswith(("api/", "docs", "redoc", "openapi.json")):
            return RedirectResponse(url="/docs")
        return FileResponse(os.path.join(STATIC_DIR, "index.html"))
```

### C. Unified Dockerfile (Root Level)
Create a new file `Dockerfile` in the root of the project:

```dockerfile
# --- Stage 1: Build the React Frontend ---
FROM node:22-alpine AS frontend-builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
# Leave VITE_API_URL empty so it compiles to relative paths
RUN npm run build

# --- Stage 2: Build the FastAPI Backend & Bundle Everything ---
FROM python:3.12-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends ffmpeg curl && \
    rm -rf /var/lib/apt/lists/*

# Install uv
RUN curl -Ls https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.local/bin:$PATH"

# Install backend dependencies
COPY backend/pyproject.toml .
RUN uv sync --no-dev

# Copy backend files
COPY backend/ .

# Copy compiled frontend from Stage 1 into the backend's static directory
COPY --from=frontend-builder /app/dist ./static

EXPOSE 8000
CMD ["sh", "-c", "uv run uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
```

---

## 4. How You Publish the Image (Developer Guide)

When you are ready to update the image on Docker Hub:

1. **Log in to Docker:**
   ```bash
   docker login
   ```
2. **Build the image (from the root of the project):**
   ```bash
   docker build -t yourusername/talkcouch:latest .
   ```
3. **Push to Docker Hub:**
   ```bash
   docker push yourusername/talkcouch:latest
   ```
