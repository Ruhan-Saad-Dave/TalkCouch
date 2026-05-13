# Docker — TalkCouch

The full stack (backend + frontend) can be run with a single `docker compose` command from the project root.

## Running the full stack

```bash
# 1. Create backend/.env with your API key
echo "GOOGLE_API_KEY=your_key_here" > backend/.env

# 2. Build and start both services
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:80 |
| Backend API | http://localhost:8000 |
| API docs | http://localhost:8000/docs |

## Running backend only

```bash
cd backend
docker build -t talkcouch-backend .
docker run -p 8000:8000 --env-file .env talkcouch-backend
```

## Environment variables

The backend container reads from `backend/.env`. Create this file before building:

```
GOOGLE_API_KEY=your_gemini_api_key_here
```

The frontend's `VITE_API_URL` is set at **build time** via a Docker build arg (default: `http://localhost:8000`). Override it when building for a different host:

```bash
docker compose build --build-arg VITE_API_URL=https://api.yourdomain.com frontend
```

## What's included

```
TalkCouch/
├── docker-compose.yml       # Runs both services; backend on :8000, frontend on :80
├── backend/
│   ├── Dockerfile           # Python 3.12-slim + uv + FFmpeg; installs from pyproject.toml
│   └── .dockerignore        # Excludes .env, __pycache__, .venv
└── frontend/
    ├── Dockerfile           # Multi-stage: node:22-alpine build → nginx:alpine serve
    ├── nginx.conf           # SPA routing (try_files → index.html)
    └── .dockerignore        # Excludes node_modules, dist, .env*
```
