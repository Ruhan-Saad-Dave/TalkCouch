# TalkCouch

A communication skills practice app. Built for anyone who wants to improve their spoken English, vocabulary, and quick thinking through structured, interactive exercises.

## Features

| Module | What you do |
|--------|------------|
| **JAM** | Get a random topic and speak about it for one minute without hesitation or deviation |
| **Jumble** | Unscramble ten shuffled sentences to restore their correct word order |
| **Scenario** | Listen to a real-life situation and explain what you would do |
| **Speech** | Listen to a sentence read aloud, then repeat it with correct pronunciation |
| **Summary** | Listen to a paragraph read aloud, then explain it in your own words |

Audio responses (JAM, Scenario, Speech, Summary) are transcribed and evaluated by an LLM (Gemini 2.5 Flash), which provides detailed markdown-formatted feedback.

## Project Structure

```
TalkCouch/
├── backend/       # FastAPI server — question generation + evaluation
└── frontend/      # React + Vite SPA
```

## Quick Start

You need both servers running at the same time.

### 1. Backend

```bash
cd backend
pip install uv          # if not already installed
uv sync
uv run uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

Create a `.env` file inside `backend/`:
```
GOOGLE_API_KEY=your_gemini_api_key_here
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

The frontend expects a `.env` file inside `frontend/`:
```
VITE_API_URL=http://localhost:8000
```

## Tech Stack

**Backend:** Python 3.12, FastAPI, Uvicorn, LangChain + Gemini 2.5 Flash, gTTS, SpeechRecognition, pydub

**Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, react-markdown
