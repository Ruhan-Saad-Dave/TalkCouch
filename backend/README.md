# TalkCouch Backend

FastAPI server that generates practice questions and evaluates user responses for the TalkCouch communication skills app.

## Requirements

- Python 3.12+
- [`uv`](https://docs.astral.sh/uv/) package manager
- A Google Gemini API key ([get one here](https://aistudio.google.com/app/apikey))
- FFmpeg (required by pydub for audio processing)

## Setup

```bash
# Install uv if you don't have it
pip install uv

# Install dependencies
uv sync
```

Create a `.env` file in this directory:
```
GOOGLE_API_KEY=your_gemini_api_key_here
```

## Running

```bash
uv run uvicorn main:app --reload
```

Server starts at `http://localhost:8000`.
Interactive API docs: `http://localhost:8000/docs`

## API Reference

All routes are prefixed with `/api`.

### Questions — `GET /api/questions/v1/`

| Endpoint | Response |
|----------|----------|
| `GET /jam` | `{ question: string }` |
| `GET /jumble` | `{ questions: string[], answers: string[] }` |
| `GET /scenario` | `{ question: string }` |
| `GET /speech` | `{ question: string, audio: string }` — audio is base64 MP3 |
| `GET /summary` | `{ question: string, audio: string }` — audio is base64 MP3 |

### Evaluation — `POST /api/evaluation/v1/`

All audio evaluation endpoints accept `multipart/form-data`. Jumble accepts a JSON body.

| Endpoint | Input | Response |
|----------|-------|----------|
| `POST /jam` | form: `question: str`, `user_answer_audio: file` | `{ user_answer, feedback }` |
| `POST /jumble` | JSON: `{ user_answers: string[], correct_answers: string[] }` | `{ score, total_score, accuracy, results }` |
| `POST /scenario` | form: `scenario: str`, `user_answer_audio: file` | `{ user_answer, feedback }` |
| `POST /speech` | form: `question: str`, `user_answer_audio: file` | `{ user_answer, accuracy }` |
| `POST /summary` | form: `summary_question: str`, `user_answer_audio: file` | `{ user_answer, feedback }` |

**Jumble `results` array** — one entry per sentence:
```json
[{ "user": "...", "correct": "...", "is_exact": true }]
```

`feedback` is markdown-formatted text from Gemini. `accuracy` (speech only) is a percentage string showing how closely the user's transcription matched the original sentence.

## Project Structure

```
backend/
├── main.py                    # FastAPI app, CORS, router registration
├── pyproject.toml             # Dependencies (managed by uv)
├── .env                       # API keys (not committed)
└── src/
    ├── api/v1/
    │   ├── questions.py       # Question generation endpoints
    │   └── evaluation.py      # Evaluation endpoints
    ├── services/v2/
    │   ├── question_service.py   # Generates questions + TTS audio
    │   ├── evaluation_service.py # Transcribes audio + evaluates with LLM
    │   ├── llm_service.py        # Gemini LLM wrapper
    │   └── media_service.py      # Audio transcription + generation
    └── core/
        ├── llm.py             # LLM model singleton (cached)
        └── speech.py          # SpeechRecognition + gTTS wrappers
```

## Error Handling

All errors return JSON with a `detail` field:
```json
{ "detail": "Could not understand your audio. Please speak clearly and try again." }
```

Common status codes:
- `400` — Audio could not be understood (speak more clearly)
- `503` — LLM overloaded or TTS/STT service unavailable
- `500` — Unexpected server error
