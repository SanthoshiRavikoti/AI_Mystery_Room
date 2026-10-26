# AI Mystery Room — Casefile

A detective story game built with React, Vite, Tailwind CSS, Express, MongoDB, and Gemini. Players create a fictional premise, inspect suspects and evidence, use optional hints, make one final accusation, and receive a clue-based resolution.

## Requirements

- Node.js 20 or newer
- MongoDB locally or a MongoDB Atlas connection string
- A Gemini API key for case generation

## Local setup

1. Copy `server/.env.example` to `server/.env` and set `MONGODB_URI` and `GEMINI_API_KEY`. The sample MongoDB URI works with a local MongoDB service.
2. Copy `client/.env.example` to `client/.env` if the API is not at `http://localhost:5000/api`.
3. Install all workspace dependencies and start both apps from the repository root:

   ```sh
   npm install
   npm run dev
   ```

The client runs at `http://localhost:5173`; the API runs at `http://localhost:5000`. The API health check is `GET /api/health`. Build the frontend with `npm run build` and run the server tests with `npm test`.

## Environment variables

Backend variables are listed in `server/.env.example`: `PORT`, `MONGODB_URI`, `GEMINI_API_KEY`, `CLIENT_URL`, and `NODE_ENV`. The only browser-exposed variable is `VITE_API_BASE_URL` in `client/.env.example`. Never put the Gemini key in a `VITE_` variable or commit real `.env` files.

## API overview

- `POST /api/cases` — validate a premise and difficulty, generate and validate a mystery, then return safe case data.
- `GET /api/cases/:id` — return public case data and progress while keeping the solution private.
- `POST /api/cases/:id/clues/:clueId/discover` — reveal one clue; repeat requests do not grant additional points.
- `POST /api/cases/:id/hints` — reveal the next available hint and record its use.
- `POST /api/cases/:id/accuse` — accept one valid accusation, calculate the score, and complete the case.
- `GET /api/cases/:id/result` — return the solution only after case completion.
- `GET /api/health` — deployment health check.

Difficulty sizes are fixed: Easy 3 suspects / 5 clues / 2 hints; Medium 4 / 7 / 3; Hard 5 / 9 / 3. Scoring is calculated on the server: correct accusation base (100/150/200 by difficulty), +5 per unique clue, −10 per used hint, with a zero floor. Wrong accusations have no additional penalty.

## Deployment

Deploy the Express server to a Node hosting provider and set its environment variables, including a production `MONGODB_URI`, `GEMINI_API_KEY`, and frontend `CLIENT_URL`. Deploy `client` to Vercel with `VITE_API_BASE_URL` set to the deployed API plus `/api`. Add the production frontend origin to the server's CORS configuration. Confirm `/api/health` and play a complete case on the live site. Cases are not tied to verified users; the application does not implement accounts or case ownership.

## Project layout

- `client/` — React/Vite UI, routing, API client, and responsive casefile styling.
- `server/src/` — Express app, API routes, controllers, Mongoose model, Gemini generation, validation, and scoring.
- `spec.md` — project requirements and acceptance criteria.
