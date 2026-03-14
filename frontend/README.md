# Talk Couch Frontend

This is the frontend for the Talk Couch application, a platform for practicing and improving communication skills.

## Features

- **Interactive Sidebar Navigation:** Easily switch between different practice modules.
- **Home Dashboard:** A welcoming page with an overview of the available tools.
- **Practice Modules:**
    - **Just a Minute (JAM):** Get a random topic and practice speaking for one minute. Your speech is recorded and evaluated.
    - **Jumble:** Unscramble sentences to improve grammar and sentence structure. Your answers are scored for accuracy.
    - **Scenario:** Respond to a given real-life scenario. Your response is recorded and evaluated.
    - **Speech:** Get a topic and an inspirational audio clip, then deliver and record your own speech for evaluation.
    - **Summary:** Read a piece of text and provide a summary, which is then evaluated.
- **Responsive Design:** The layout adapts to different screen sizes for a good user experience.

## Technologies Used

- **React:** A JavaScript library for building user interfaces.
- **Vite:** A fast build tool and development server for modern web projects.
- **TypeScript:** A typed superset of JavaScript that compiles to plain JavaScript.
- **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
- **shadcn/ui:** A collection of re-usable components built with Radix UI and Tailwind CSS.

## Project Structure

The project follows a standard React application structure:

```
frontend/
├── public/              # Static assets
├── src/
│   ├── components/      # Shared UI components
│   │   ├── ui/          # Components from shadcn/ui
│   │   └── app-sidebar.tsx
│   ├── pages/           # Page components for each feature
│   │   ├── JamPage.tsx
│   │   ├── JumblePage.tsx
│   │   ├── ScenarioPage.tsx
│   │   ├── SpeechPage.tsx
│   │   └── SummaryPage.tsx
│   ├── services/        # API service for backend communication
│   │   └── api.ts
│   ├── App.tsx          # Main application component with layout and routing logic
│   ├── Home.tsx         # Home page component
│   └── main.tsx         # Main entry point of the application
├── .env                 # Environment variables (e.g., API URL)
└── README.md            # This file
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1.  Clone the repository.
2.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
3.  Install the dependencies:
    ```bash
    npm install
    ```

### Running the Development Server

1.  Make sure the backend server is running.
2.  Create a `.env` file in the `frontend` directory and add the backend API URL:
    ```
    VITE_API_URL=http://localhost:8000
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
4.  Open your browser and navigate to the URL provided by Vite (usually `http://localhost:5173`).

## API Integration

The frontend communicates with the backend server for two main purposes:

1.  **Fetching Questions:** Each practice module fetches a relevant question or task from the backend.
2.  **Submitting for Evaluation:** User answers (text or recorded audio) are sent to the backend for evaluation, and feedback is displayed.

All API communication is handled by the functions in `src/services/api.ts`. The base URL for the API is configured in the `.env` file using the `VITE_API_URL` variable.
