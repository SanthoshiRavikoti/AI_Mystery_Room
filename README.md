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

Backend variables are listed in `server/.env.example`: `PORT`, `MONGODB_URI`, `GEMINI_API_KEY`, `GEMINI_MODEL`, `CLIENT_URL`, and `NODE_ENV`. The only browser-exposed variable is `VITE_API_BASE_URL` in `client/.env.example`. Never put the Gemini key in a `VITE_` variable or commit real `.env` files.

## API overview

- `POST /api/cases` — validate a premise and difficulty, generate and validate a mystery, then return safe case data.
- `GET /api/cases/:id` — return public case data and progress while keeping the solution private.
- `POST /api/cases/:id/clues/:clueId/discover` — reveal one clue; repeat requests do not grant additional points.
- `POST /api/cases/:id/hints` — reveal the next available hint and record its use.
- `POST /api/cases/:id/accuse` — accept one valid accusation, calculate the score, and complete the case.
- `GET /api/cases/:id/result` — return the solution only after case completion.
- `GET /api/health` — deployment health check.

Difficulty sizes are fixed: Easy 3 suspects / 5 clues / 2 hints; Medium 4 / 7 / 3; Hard 5 / 9 / 3. Scoring is calculated on the server: correct accusation base (100/150/200 by difficulty), +5 per unique clue, −10 per used hint, with a zero floor. Wrong accusations have no additional penalty.

## Deployment walkthrough (Render + Vercel + MongoDB Atlas)

The repository includes `render.yaml` for the API and `client/vercel.json` for client-side routes. The Render blueprint uses its Free web-service plan for a demo deployment. Render Free services spin down after 15 minutes without traffic and can take about a minute to wake up; choose a paid always-on instance if that delay is unsuitable.

### 1. Push the repository to GitHub

Create a GitHub repository, then push this project. Before pushing, confirm the local environment files are ignored:

```sh
git check-ignore server/.env client/.env
```

This should print both paths. Do not commit `.env` files or paste API keys into source files.

### 2. Create the MongoDB Atlas database

1. In Atlas, create a project and cluster, then create a **database user** for the app (this is separate from your Atlas login).
2. In the cluster's **Connect** dialog, choose the Drivers connection string. Put the database name `ai-mystery-room` in the URI and URL-encode any special characters in the database user's password.
3. Keep the URI private. Atlas accepts connections only from IPs in the project's network access list. For the restricted setup, add Render's current outbound CIDR ranges after the Render service has been created (see step 3). Atlas documents the user and IP access-list setup in its [security quickstart](https://www.mongodb.com/docs/atlas/security/quick-start/); Render shows service ranges under **Connect → Outbound** ([Render outbound IPs](https://render.com/docs/outbound-ip-addresses)).

### 3. Deploy the backend on Render

1. In Render, choose **New → Blueprint**, connect the GitHub repository, and select it. Render reads `render.yaml`; the service root is `server`, with `npm install`, `npm start`, and `/api/health` as the health check.
2. Enter the requested environment values in Render's secure environment prompt:
   - `MONGODB_URI`: the Atlas URI from step 2.
   - `GEMINI_API_KEY`: your Gemini API key.
   - `CLIENT_URL`: temporarily `http://localhost:5173`; replace it after step 4.
   - `GEMINI_MODEL` is set by the blueprint to `gemini-3.5-flash-lite`.
3. Apply the blueprint. If Atlas has not yet allowlisted Render, the first service start may fail to connect. Open the service's **Connect → Outbound** panel, add the displayed CIDR ranges in Atlas **Network Access**, then redeploy the Render service.
4. When Render reports the service is live, copy its URL, for example `https://ai-mystery-room-api.onrender.com`. Check `https://<your-render-host>/api/health`; it should return `{"status":"ok"}`.

### 4. Deploy the frontend on Vercel

1. In Vercel, choose **Add New → Project**, import the same GitHub repository, and set **Root Directory** to `client`.
2. Use the Vite defaults: build command `npm run build`, output directory `dist`. `client/vercel.json` rewrites deep links such as `/case/:id/result` to the SPA entry page.
3. Add this environment variable for the Production environment:

   ```text
   VITE_API_BASE_URL=https://<your-render-host>/api
   ```

4. Deploy and copy the production site origin, for example `https://your-project.vercel.app` (no path or trailing slash).

### 5. Connect production CORS and redeploy

In Render, change `CLIENT_URL` to the exact Vercel production origin from step 4, then save and redeploy/restart the API. The server permits that configured origin plus local development at `http://localhost:5173`.

### 6. Verify the live game

1. Open the Vercel production URL and confirm a hard refresh on a nested route loads the app.
2. Open `<your-render-host>/api/health` and confirm it returns `{"status":"ok"}`.
3. Create and solve a case on the deployed site. Try clue discovery, a hint, accusation, and results; then repeat with each difficulty.
4. In browser developer tools, confirm active-case responses do not contain `solution` or the culprit ID. Results should appear only after accusation.
5. If creation fails, check Render service logs. Gemini `503`/`504` errors are provider availability or timeout errors; a MongoDB connection error usually points to the URI, database user, or Atlas IP access list.

The API URL is public, but `GEMINI_API_KEY` and `MONGODB_URI` belong only in Render's server environment. Do not add them to Vercel. Cases are not tied to verified users; the application does not implement accounts or case ownership.

## Project layout

- `client/` — React/Vite UI, routing, API client, and responsive casefile styling.
- `server/src/` — Express app, API routes, controllers, Mongoose model, Gemini generation, validation, and scoring.
- `spec.md` — project requirements and acceptance criteria.
