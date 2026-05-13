# TalkCouch Frontend

React + TypeScript SPA for the TalkCouch communication skills practice app.

## Requirements

- Node.js v18+
- npm
- The backend server running at `http://localhost:8000`

## Setup

```bash
npm install
```

Create a `.env` file in this directory:
```
VITE_API_URL=http://localhost:8000
```

## Running

```bash
npm run dev      # development server at http://localhost:5173
npm run build    # production build
npm run preview  # preview production build locally
```

## Features

| Page | What it does |
|------|-------------|
| **JAM** | Fetches a random topic, records the user's audio, sends to backend for LLM evaluation |
| **Jumble** | Fetches 10 shuffled sentences, accepts typed answers, scores character-level accuracy |
| **Scenario** | Fetches a scenario, records the user's spoken response, sends for LLM evaluation |
| **Speech** | Fetches a sentence + plays TTS audio, records the user repeating it, shows similarity score |
| **Summary** | Fetches a paragraph + plays TTS audio, records the user's verbal explanation, sends for LLM evaluation |

Feedback from the LLM is rendered as formatted markdown (bold, bullet points).

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   └── app-sidebar.tsx  # Navigation sidebar
│   ├── pages/
│   │   ├── JamPage.tsx
│   │   ├── JumblePage.tsx
│   │   ├── ScenarioPage.tsx
│   │   ├── SpeechPage.tsx
│   │   └── SummaryPage.tsx
│   ├── services/
│   │   └── api.ts           # All backend API calls
│   ├── lib/
│   │   └── utils.ts         # shadcn cn() utility
│   ├── App.tsx              # Layout + sidebar-based navigation
│   ├── Home.tsx             # Landing page
│   └── main.tsx             # Entry point
├── components.json          # shadcn/ui config
├── vite.config.ts           # Vite config + @ path alias
├── tsconfig.app.json        # TypeScript config (strict mode)
└── .env                     # VITE_API_URL
```

## Tech Stack

- **React 19** — UI framework
- **TypeScript** — strict mode enabled (`noUnusedLocals`, `noUnusedParameters`)
- **Vite** — build tool with `@tailwindcss/vite` plugin
- **Tailwind CSS v4** — utility-first styling
- **shadcn/ui** — component library (new-york style, neutral base)
- **react-markdown** + **@tailwindcss/typography** — renders LLM feedback as formatted markdown
- **lucide-react** — icons

## API Communication

All requests go through `src/services/api.ts`.

- Audio evaluation requests use `multipart/form-data` (audio blob + text fields)
- Jumble evaluation uses a JSON body
- Backend errors are read from the `detail` field of the JSON response and shown directly to the user

Audio received from the backend (for Speech and Summary) is base64-encoded MP3, decoded in the browser and played via an `<audio>` element.
