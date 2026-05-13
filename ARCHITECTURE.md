# TalkCouch — Architecture & Workflow

A deep-dive into how the system works, written for interview preparation.

---

## Table of Contents

1. [Overall Architecture](#1-overall-architecture)
2. [Backend Layer Structure](#2-backend-layer-structure)
3. [LLM Setup](#3-llm-setup)
4. [Question Generation Flow](#4-question-generation-flow)
5. [Audio Evaluation Flow](#5-audio-evaluation-flow-stt-pipeline)
6. [Streaming Architecture](#6-streaming-architecture)
7. [Jumble Evaluation](#7-jumble-evaluation-no-llm)
8. [Speech Evaluation](#8-speech-evaluation-no-llm)
9. [Session History](#9-session-history)
10. [Docker Setup](#10-docker-setup)
11. [Common Interview Questions](#11-common-interview-questions)

---

## 1. Overall Architecture

Two independent servers, one for AI/backend work, one for the UI:

```
Browser (React SPA)
      │
      │  HTTP (REST + NDJSON streaming)
      ▼
FastAPI Server (port 8000)
      ├── Question generation  →  LLM (Gemini 2.5 Flash)
      ├── Audio transcription  →  Google Speech Recognition
      ├── TTS generation       →  gTTS
      └── Evaluation           →  LLM + string algorithms
```

The frontend never touches the LLM or audio processing directly. All AI work lives in the backend.

---

## 2. Backend Layer Structure

The backend is split into 3 layers. This is the single most important architectural decision.

```
src/
├── api/v1/             API layer    — HTTP: routing, request parsing, response shaping
├── services/v2/        Service layer — Business logic: what to do with the data
└── core/               Core layer   — I/O: LLM calls, STT, TTS
```

### Why 3 layers?

Each layer has exactly one responsibility:

| Layer | Knows about | Does NOT know about |
|-------|-------------|---------------------|
| API | HTTP, FastAPI, request/response | What Gemini is |
| Service | Business rules, orchestration | HTTP status codes |
| Core | LLM API, Google STT, gTTS | What a "JAM question" is |

If you swap Google STT for Whisper tomorrow, you only change `core/speech.py`. Nothing else needs to change.

### Dependency Injection

FastAPI's `Depends()` wires the layers together automatically. When a request arrives:

```
Request → evaluate_jam endpoint
            └── Depends(EvaluationService)
                    ├── Depends(LLMService)
                    │       └── Depends(get_llm_model)   ← cached singleton
                    └── Depends(MediaService)
                            └── Depends(SpeechService)
```

You never manually call constructors. FastAPI resolves the entire dependency tree per request.

---

## 3. LLM Setup

**File:** `src/core/llm.py`

```python
@lru_cache()
def get_llm_model():
    return ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.7, ...)
```

### Key decisions

**`@lru_cache` — singleton pattern**
The model is initialized once on the first request and reused forever. Without this, every request would create a new API client — slow and wasteful.

**Temperature 0.7**
A scale from 0 (deterministic) to 1+ (highly random). 0.7 balances creativity (varied topics each time) with coherence (answers still make sense).

**Two LLM call modes in `LLMService`:**

| Method | LangChain call | Used for |
|--------|---------------|----------|
| `get_question(prompt)` | `ainvoke()` | Question generation — need full answer before continuing |
| `stream_feedback(prompt)` | `astream()` | Evaluation — show tokens as they arrive |

### System prompts

Every LLM call sends two messages:

1. **SystemMessage** — sent on every call, defines behavior. Two variants:
   - *Question generation:* "Output exactly what is requested. No preamble or commentary."
   - *Evaluation:* "You are a communication coach. Be concise. 3–5 bullet points. Bold key terms."

2. **HumanMessage** — the actual task (the topic, the user's answer, what to evaluate).

Separating these means formatting rules are defined once, not copy-pasted into every prompt.

---

## 4. Question Generation Flow

All question endpoints are simple `GET` requests.

### JAM / Scenario
```
GET /api/questions/v1/jam
  → LLMService.get_question(prompt)
  → returns { question: string }
```
One LLM call, return the string. No processing.

### Jumble
```
GET /api/questions/v1/jumble
  → LLM generates 10 complete sentences
  → strip numbering ("1. 2. 3." prefixes the LLM adds)
  → shuffle each sentence's words with random.shuffle()
  → returns { questions: string[], answers: string[] }
```
`questions` = shuffled (shown to user), `answers` = originals (used for scoring later).

### Speech / Summary (two-step: text + audio)
```
GET /api/questions/v1/speech
  → LLM generates a sentence
  → MediaService.generate_audio(sentence)
      → gTTS(text, lang="en") → MP3 BytesIO
  → FastAPI serializes BytesIO bytes to base64 automatically
  → returns { question: string, audio: string }  ← audio is base64 MP3
```

**Frontend decodes:**
```typescript
const audioBlob = new Blob(
  [new Uint8Array(atob(data.audio).split("").map(c => c.charCodeAt(0)))],
  { type: 'audio/mpeg' }
);
const url = URL.createObjectURL(audioBlob);
// set as <audio src={url} />
```

`atob()` decodes base64 → binary string → `Uint8Array` → `Blob` → object URL.

---

## 5. Audio Evaluation Flow (STT Pipeline)

This is the most technically complex part of the system.

### Step-by-step

```
1. Browser          MediaRecorder captures mic as WebM/Opus (browser's native format)
2. Frontend         On recording stop: collect Blob chunks → single Blob
                    Append to FormData with question text
                    POST multipart/form-data to /api/evaluation/v1/jam
3. FastAPI          File(...) receives bytes, wraps in io.BytesIO
4. Endpoint         service.transcribe(audio_fp)  ← runs BEFORE StreamingResponse
5. speech.py        AudioSegment.from_file(audio_fp)   pydub reads WebM
                    effects.normalize()                 normalize volume
                    .set_channels(1)                    convert to mono
                    export to WAV in memory (BytesIO)   format conversion
                    sr.Recognizer().adjust_for_ambient_noise()
                    recognize_google(audio_data)        → transcribed text
6. Service          Build LLM prompt with question + transcript
7. Stream           Yield tokens back to frontend
```

### Key design choices

**Why WebM → WAV?**
Browsers record in WebM/Opus natively. Google's `SpeechRecognition` library works best with WAV. pydub handles the conversion in memory.

**Why `io.BytesIO` everywhere?**
Keeps audio data in memory — no temporary files on disk. Faster and stateless, which is important for a web service that could handle concurrent requests.

**Why normalize + mono?**
Ambient noise and stereo channels reduce STT accuracy. Normalizing volume and converting to mono gives the STT engine cleaner input.

**Why STT before `StreamingResponse`?**
Once `StreamingResponse` starts, the HTTP 200 header is already sent to the browser. You can't change it to a 400 error after that. Running STT first means bad audio still returns a proper `HTTP 400` with a readable error message.

### Error types from STT

| Exception | HTTP status | Meaning |
|-----------|------------|---------|
| `UnknownValueError` | 400 | Audio was clear but couldn't be understood |
| `RequestError` | 503 | Google's STT API is unreachable |
| `Exception` | 500 | Unexpected failure (corrupt audio, etc.) |

---

## 6. Streaming Architecture

### The problem with blocking responses

Without streaming:
```
Record → Upload → STT (2–3s) → LLM generates full response (3–5s) → JSON → Display
```
User stares at a blank screen for 5–8 seconds.

### The streaming solution

```
Record → Upload → STT (2–3s) → First token appears → tokens keep flowing → Done
```
The transcription appears within milliseconds of STT finishing. Feedback builds visibly.

### Backend: async generator + StreamingResponse

```python
@evaluation_app.post("/jam")
async def evaluate_jam(...):
    user_answer = await service.transcribe(audio)   # STT — errors surface here

    async def generate():
        async for chunk in service.stream_jam_feedback(question, user_answer):
            yield chunk + "\n"

    return StreamingResponse(generate(), media_type="application/x-ndjson")
```

`stream_jam_feedback` is an **async generator** — a Python function with both `async def` and `yield`. It produces NDJSON (newline-delimited JSON), one object per line:

```
{"type": "answer", "value": "what the user said"}\n      ← sent immediately after STT
{"type": "token",  "value": "**Fluency"}\n                ← LLM token 1
{"type": "token",  "value": ": your"}\n                   ← LLM token 2
...
{"type": "error",  "value": "AI failed"}                  ← only if LLM crashes mid-stream
```

### Frontend: Fetch ReadableStream + async iteration

```typescript
const reader = response.body.getReader();
const decoder = new TextDecoder();
let buffer = '';

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  buffer += decoder.decode(value, { stream: true });
  const lines = buffer.split('\n');
  buffer = lines.pop() ?? '';       // keep incomplete line for next iteration
  for (const line of lines) {
    if (line.trim()) yield JSON.parse(line);
  }
}
```

The `buffer` pattern solves **chunk boundaries**: a single TCP packet may contain half a JSON line. Bytes are buffered until a `\n` confirms the line is complete, then parsed.

The page uses `for await (const chunk of streamEvaluateJam(...))` — JavaScript async iteration over the generator.

### Progressive UI states

| State | What the user sees |
|-------|--------------------|
| `evaluating && !userAnswer` | "Transcribing your audio..." (pulsing) |
| `userAnswer !== null` (stream started) | Transcription appears; feedback starts building |
| `evaluating && feedbackText` | "Generating feedback..." below growing markdown |
| `!evaluating` | Full feedback + "Try Another" button |

---

## 7. Jumble Evaluation (No LLM)

Jumble scoring is pure string comparison — no AI involved.

### Character-level accuracy

```python
for j in range(min(len(user), len(correct))):
    if user[j] == correct[j]:
        char_score += 1
accuracy = (total_chars_correct / total_chars) * 100
```

Counts matching characters at the same position. `"cat sat"` vs `"cat ran"` → 4/7 ≈ 57%.

### Exact match (for green/red highlighting)

```python
is_exact = user.strip().lower() == correct.strip().lower()
```

Case-insensitive, whitespace-trimmed. Drives the per-sentence colour coding in the UI.

### Why character-level, not word-level?

More granular. A user who gets 9/10 words right still gets partial credit rather than scoring 0 on that sentence.

### Length mismatch safety

```python
for i in range(min(len(user_answers), len(correct_answers))):
```

`min()` ensures no `IndexError` if the arrays have different lengths (e.g., the user submitted fewer answers than expected).

---

## 8. Speech Evaluation (No LLM)

Pronunciation accuracy is calculated with Python's built-in `difflib`:

```python
translator = str.maketrans('', '', string.punctuation)
clean_question = question.lower().translate(translator)    # remove punctuation, lowercase
clean_user     = user_answer.lower().translate(translator)

similarity = difflib.SequenceMatcher(None, clean_question, clean_user).ratio()
accuracy = f"{similarity * 100:.2f}%"
```

`SequenceMatcher` finds the longest common subsequence between two strings and returns a ratio from 0 to 1. `"Hello, World!"` vs `"hello world"` → 100% after cleaning.

---

## 9. Session History

All history is stored in `localStorage` — no backend, no account needed.

**`src/lib/history.ts` API:**

| Function | What it does |
|----------|-------------|
| `saveEntry(entry)` | Prepends entry with a UUID + timestamp, keeps last 50 |
| `getHistory()` | Reads + parses from localStorage, returns `[]` on any error |
| `clearHistory()` | Removes the localStorage key |

**Why localStorage?**
No backend required. Works offline. The tradeoff is data is per-browser and lost if the user clears storage — acceptable for a practice tool.

**Why max 50 entries?**
Prevents localStorage from growing unbounded. localStorage has a ~5MB limit per origin.

---

## 10. Docker Setup

### Two services

```yaml
services:
  backend:   Python 3.12-slim + uv → port 8000
  frontend:  Node build → nginx     → port 80
```

### Backend Dockerfile

```dockerfile
FROM python:3.12-slim
RUN apt-get install ffmpeg          # required by pydub for audio processing
RUN curl ... | sh                   # install uv
COPY pyproject.toml .
RUN uv sync --no-dev                # install only production deps
COPY . .
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

`.env` is excluded via `.dockerignore` and passed at runtime via `env_file` in docker-compose.

### Frontend Dockerfile (multi-stage)

```dockerfile
# Stage 1: build
FROM node:22-alpine AS build
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL
RUN npm ci && npm run build         # produces dist/

# Stage 2: serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

**Why multi-stage?**
The final image contains only nginx + the static files. No Node.js, no source code, no `node_modules`. The image is significantly smaller and has a smaller attack surface.

**Why bake `VITE_API_URL` at build time?**
Vite replaces `import.meta.env.VITE_*` references at build time — they become string literals in the bundle. There is no runtime config loading. The URL must be known when `npm run build` runs.

**`nginx.conf` — SPA routing:**

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

Without this, refreshing `/history` would return a 404 because nginx would look for a file called `history` that doesn't exist. This rule falls back to `index.html` for any unknown path, letting React Router handle it.

---

## 11. Common Interview Questions

**"Why FastAPI over Flask or Django?"**
FastAPI is built for async from the ground up. `async def` endpoint handlers, `await` for I/O, no threading needed. It also generates OpenAPI docs automatically and uses Pydantic for request validation. Flask requires extensions for all of this; Django is heavier than needed for a pure API.

**"How does the streaming work with error handling?"**
STT runs before `StreamingResponse` is created, so bad audio returns a proper HTTP 400/503. Once the stream starts (200 already sent), LLM errors are sent as `{"type": "error"}` chunks — the frontend reads these and sets the error state. You can't change the HTTP status mid-stream.

**"Why not WebSockets for streaming?"**
Server-Sent Events / chunked HTTP streaming is simpler for one-way data (server → client). WebSockets add bidirectional complexity — you'd need to handle connection management, reconnection, and message framing — none of which this use case needs.

**"What does `@lru_cache` do here?"**
It makes `get_llm_model()` a singleton. No matter how many times `Depends(get_llm_model)` is called across requests, the same `ChatGoogleGenerativeAI` instance is returned. Without it, every request would construct a new API client.

**"How do you test async code?"**
`pytest-asyncio` with `asyncio_mode = "auto"` in `pyproject.toml` — all async test functions are automatically run as asyncio coroutines, no decorator needed. Service dependencies are replaced with `AsyncMock` so no real network calls happen in tests.

**"What's the `buffer` logic in the frontend stream reader?"**
TCP doesn't guarantee that one `read()` call returns exactly one complete NDJSON line. A read might return half a line, or two lines. The buffer accumulates bytes, splits on `\n`, parses complete lines, and keeps the remainder for the next iteration.

**"Why does pydub convert audio to mono?"**
Google's Speech Recognition API accuracy is higher on mono audio. Stereo introduces redundant data and can confuse the STT engine. Normalizing volume ensures quiet recordings aren't rejected as silence.

**"What happens if the LLM is overloaded?"**
`LLMService.get_question()` catches `ResourceExhausted` (Google's rate-limit exception) and raises an `HTTPException(503)` with a user-readable message. The frontend's `parseError()` reads the `detail` field and displays it directly. For streaming endpoints, the same exception is caught inside the generator and sent as an error chunk.
