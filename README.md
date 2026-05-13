# TalkCouch

A communication skills practice app. Built for anyone who wants to improve their spoken English, vocabulary, and quick thinking through structured, interactive exercises.

## Features

| Module | What you do |
|--------|------------|
| **JAM** | Get a random topic and speak about it for one minute (60-second countdown timer auto-stops recording) |
| **Jumble** | Unscramble ten shuffled sentences; each sentence is colour-coded correct/incorrect with the right answer shown |
| **Scenario** | Listen to a real-life situation and explain what you would do |
| **Speech** | Listen to a sentence read aloud, then repeat it with correct pronunciation |
| **Summary** | Listen to a paragraph read aloud, then explain it in your own words |
| **History** | Browse all past sessions stored in localStorage — expandable cards showing your answers and feedback |

Audio responses (JAM, Scenario, Speech, Summary) are transcribed and evaluated by an LLM (Gemini 2.5 Flash), which provides detailed markdown-formatted feedback.

## Project Structure

```
TalkCouch/
├── backend/            # FastAPI server — question generation + evaluation
├── frontend/           # React + Vite SPA
└── docker-compose.yml  # Full-stack Docker setup
```

## Quick Start

### Local development

You need both servers running at the same time.

**Backend:**

```bash
cd backend
pip install uv          # if not already installed
uv sync
```

Create `backend/.env`:
```
GOOGLE_API_KEY=your_gemini_api_key_here
```

```bash
uv run uvicorn main:app --reload
```

API at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

**Frontend:**

```bash
cd frontend
npm install
```

Create `frontend/.env`:
```
VITE_API_URL=http://localhost:8000
```

```bash
npm run dev
```

Open `http://localhost:5173`.

### Docker (full stack)

```bash
# Create backend/.env with your API key first
docker compose up --build
```

Frontend at `http://localhost:80`, backend at `http://localhost:8000`.

## Tech Stack

**Backend:** Python 3.12, FastAPI, Uvicorn, LangChain + Gemini 2.5 Flash, gTTS, SpeechRecognition, pydub

**Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, react-markdown

---

## Resume Content

### Version 1 — AI Engineer

**TalkCouch** | LangChain · Gemini 2.5 Flash · Google STT/TTS · FastAPI · pydub · React 19 · TypeScript · Docker

- Built a multimodal AI app with 5 practice modules, each using a distinct LLM evaluation strategy: open-ended critique prompts (JAM, Scenario, Summary), controlled sentence generation with word shuffling (Jumble), and word-similarity ratio scoring (Speech)
- Authored separate system prompts for question generation (clean output, no preamble) and evaluation (coach persona, 3–5 bullet structure), separating formatting constraints from task-specific content in every LLM call
- Migrated LLM evaluation to token-by-token streaming using LangChain astream; backend yields NDJSON over FastAPI StreamingResponse, frontend reads via the Fetch ReadableStream API and progressively renders markdown as tokens arrive
- Implemented a full audio pipeline: browser WebM → pydub normalization + WAV transcoding → Google Speech Recognition → LLM evaluation; TTS audio returned as base64-encoded MP3 decoded and played client-side
- Used LRU cache to singleton-initialize the LLM model; containerized with Docker (multi-stage Node → nginx frontend, Python 3.12-slim + uv backend) via a root Docker Compose file

---

### Version 2 — FastAPI / Backend Developer

**TalkCouch** | FastAPI · Python 3.12 · pydub · SpeechRecognition · gTTS · LangChain · Docker · uv

- Designed 10 REST endpoints across two versioned routers (questions and evaluation) using FastAPI dependency injection for stateless service resolution
- Built a 3-layer architecture — API (routing), Service (orchestration), Core (LLM/STT/TTS I/O) — with multipart form annotations for audio uploads processed through pydub (normalize, mono conversion, WebM→WAV transcoding) before Google STT
- Migrated JAM, Scenario, and Summary endpoints to FastAPI StreamingResponse with async NDJSON streaming — STT completes before the stream opens so HTTP errors (400/503/500) still propagate correctly; tokens stream as newline-delimited JSON consumed by a typed async generator on the frontend
- Propagated domain-specific HTTP exceptions from the core layer through to a typed frontend error parser, surfacing human-readable messages to the user
- Wrote 9 pytest tests (pytest-asyncio, asyncio auto mode) covering evaluate_jumble (exact, partial, empty, case-insensitive, length mismatch) and evaluate_speech (exact match, punctuation stripping, low similarity) using AsyncMock for service dependencies
- Containerized with a Python 3.12-slim image using uv for reproducible installs; multi-stage frontend Dockerfile (Node → nginx) with the API URL baked in at build time; full stack via root Docker Compose

---

### Suggestions

1. **Deploy it.** A live URL on a resume beats any bullet. Railway/Render (backend) + Vercel (frontend) are both free tier.
