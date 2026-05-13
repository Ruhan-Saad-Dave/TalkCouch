# Docker — TalkCouch Backend

> **Note:** Only the backend has a Docker setup currently. A full-stack `docker-compose.yml` (with the frontend) is not yet implemented.

## Running the backend with Docker

```bash
cd backend
docker compose up --build
```

The API will be available at `http://localhost:8000`.

## Environment variables

The container reads from a `.env` file. Create one in the `backend/` directory before building:

```
GOOGLE_API_KEY=your_gemini_api_key_here
```

## What's included

- `Dockerfile` — builds the Python backend using `uv`
- `compose.yaml` — runs the backend service on port 8000

## What's not yet implemented

- Frontend `Dockerfile`
- Root-level `docker-compose.yml` to run the full stack (backend + frontend) together
