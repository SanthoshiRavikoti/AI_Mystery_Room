
# AI Mystery Room — Project Specification

Document: `SPEC.md` · Implementation-ready baseline · Primary stack: React, Vite, Tailwind CSS, Node.js, Express, MongoDB, Mongoose, Gemini API

## 1. Project Overview

AI Mystery Room is an AI-powered web application where a player creates and solves a fictional mystery generated using Google's Gemini API. The player supplies a premise, chooses a difficulty level, investigates a story, reviews suspects and clues, requests hints when needed, accuses one suspect, and receives a verdict, explanation, and score.

The application must deliver a complete mystery-solving experience on a deployed website. It must be understandable, responsive, safe against premature solution disclosure, and resilient to invalid AI output and API failures.

### 1.1 Problem statement

Writing a coherent mystery with suspects, clues, hints, and a defensible solution is time-consuming. AI Mystery Room uses Gemini to generate structured mystery content while application rules validate the content, preserve the hidden solution, manage player progress, and calculate scores consistently.

### 1.2 Target users

- People who enjoy detective stories, puzzles, and deduction games.
- Users who want to play a short, interactive mystery without needing to write one themselves.
- Demonstrators/evaluators who need to complete the full flow on the deployed website.

### 1.3 Product goals

1. Generate a playable mystery from a user-provided premise.
2. Support Easy, Medium, and Hard difficulties with the exact counts specified in Section 6.
3. Let players inspect suspects, discover clues, request hints, and submit an accusation.
4. Keep the correct culprit and solution private until an accusation is submitted.
5. Produce an understandable verdict and explanation supported by the clues.
6. Calculate scores on the backend using the fixed scoring rules.
7. Work reliably in local development and on the deployed production website.

### 1.4 Out of scope for the required baseline

Unless implemented as an optional enhancement, the initial version does not require:

- User accounts, social profiles, multiplayer, leaderboards, or payments.
- Real-world investigations, real personal data, or actual surveillance integrations.
- Uploading arbitrary user files as evidence.
- Persistent player identity across devices.
- Any scoring rule that changes the workshop's fixed scoring table.

Optional enhancements must not delay or break the required end-to-end game.

## 2. Technology Stack

Use the following stack as the required baseline.

### Frontend

- React
- Vite
- Tailwind CSS
- React Router for page navigation
- Axios or the native Fetch API for HTTP requests

### Backend

- Node.js
- Express
- Mongoose
- MongoDB Atlas in production
- `@google/genai` for Gemini integration
- Zod for validating request bodies and Gemini-generated structured data
- `dotenv` for environment variables
- `cors` configured for the known frontend origin

### Development and quality

- Git and GitHub
- ESLint or equivalent linting where configured
- Automated tests for validation, game rules, and API behavior
- A suitable backend hosting provider
- Vercel for the frontend deployment

Do not use a different framework or database without first updating this specification and documenting why.

## 3. User Journey

The complete player journey is:

1. The user opens the website and sees the project introduction and a clear start action.
2. The user opens Create Mystery.
3. The user enters a mystery premise and selects Easy, Medium, or Hard.
4. The frontend sends the premise and difficulty to the backend.
5. The backend validates the request and asks Gemini to generate structured mystery data.
6. The backend validates the AI response for schema correctness, required counts, valid suspect/clue references, and solution consistency.
7. If the response is invalid, the backend may retry a limited number of times or return a safe, useful error. It must not save malformed data as a playable case.
8. The backend stores the mystery, including the hidden solution, in MongoDB.
9. The frontend receives only the public, player-safe representation of the new case.
10. The player enters the Investigation Room, reads the story, inspects suspects, and discovers clues.
11. The player may request hints. Each successfully granted hint is recorded and affects the score.
12. The player selects a suspect and submits an accusation.
13. The backend validates the accusation, marks the case complete, calculates the score, and returns the verdict.
14. The Results page shows whether the accusation was correct, the culprit, the explanation, and the final score.
15. The player can start another mystery.

The application must show loading, empty, success, and error states for relevant actions. Navigation should not expose the solution by changing URLs or reading client-side state.

## 4. Pages and UI Requirements

### 4.1 Home

- Project name and concise explanation.
- Primary action to start/create a mystery.
- Brief explanation of how to play.
- Responsive layout for desktop, tablet, and mobile.

### 4.2 Create Mystery

- Text field or textarea for the premise.
- Difficulty selector: Easy, Medium, Hard.
- Submit action.
- Input validation and a useful message for empty or excessively long premises.
- Loading state while generating a case.
- Error state with a retry action if generation fails.

### 4.3 Investigation Room

- Mystery title and story.
- Difficulty and progress indicator.
- Suspect cards with their public profiles and relevant details.
- Clue list with discovered/undiscovered state.
- Action to discover a clue.
- Hint request action and clear indication of hints used/available.
- No hidden culprit field, private solution, or answer-bearing metadata in the client payload.
- Loading, disabled, and error states for clue and hint actions.
- Prevent duplicate clue rewards and invalid repeated actions.

### 4.4 Accusation

- List/select the available suspects.
- Require a valid suspect selection before submission.
- Confirmation step is recommended to avoid accidental accusations.
- Disable repeated submissions while an accusation is processing.
- Handle invalid suspect IDs, already completed cases, and network failures.

### 4.5 Results

- Verdict: correct or incorrect.
- Correct culprit.
- Explanation of the solution and how the evidence supports it.
- Final score and, where useful, a score breakdown.
- Action to start a new mystery.
- Results must be retrieved only after the case has been completed.

### 4.6 Shared UI behavior

- Responsive layout and accessible labels, focus states, and keyboard-operable controls.
- Consistent navigation and visual hierarchy.
- Clear messages for API errors; do not show stack traces or secrets.
- Do not leave buttons appearing active when an operation is pending.
- Use environment-based API configuration rather than hard-coded production URLs.
- If a case cannot be loaded, show a recoverable error rather than a blank screen.

### 4.7 Distinctive Product Identity and Experience

This section defines the project's differentiating experience. These design choices must not change the workshop's mandatory game rules.

Product concept: Digital Detective Casefile

The application should feel like opening and working through a fictional detective's casefile. Use a coherent visual language—deep navy/charcoal surfaces, restrained evidence-board accents, readable typography, clear status labels, and strong contrast. Avoid visual clutter that makes evidence difficult to read. The interface should remain accessible and responsive rather than sacrificing usability for atmosphere.

Signature experience

- Case Brief: Present the case title, premise, incident summary, and objective in a clear case-file introduction.
- Suspect Dossiers: Give each suspect a profile with public information such as motive, opportunity, and stated alibi. Do not label the real culprit before the accusation.
- Evidence Desk: Present clues as readable evidence artifacts. Depending on the generated case, these may be fictional witness statements, mock chat excerpts, CCTV-style event logs, documents, physical-evidence notes, or timeline entries.
- Investigation Progress: Show discovered clues, available hints, and overall progress. Progress indicators must not reveal the hidden solution.
- Timeline and Contradictions: Where generated data supports it, display a chronological sequence of events and allow players to compare it with suspect statements. Do not invent facts in the frontend; render validated case data.
- Case Resolution: After the accusation, present the verdict, score breakdown, culprit, and a clue-by-clue explanation of how the evidence supports the solution.

Design and gameplay guardrails

- Treat these features as presentation and investigation improvements, not new mandatory scoring rules.
- Do not add penalties for wrong accusations unless the product specification is deliberately revised and the workshop's required scoring remains satisfied.
- Do not let an evidence-board UI, timeline, or animation expose the hidden culprit before the accusation.
- Keep the core flow simple enough that a first-time player can understand how to start, investigate, use a hint, accuse, and view results.
- Prefer meaningful evidence interactions and clear reasoning over decorative animations.
- If a signature feature cannot be completed reliably within the project timeline, preserve the required end-to-end game first and simplify the optional feature.

## 5. Architecture and Repository Layout

Keep frontend and backend as separate applications.

Suggested structure:

```
ai-mystery-room/
├── client/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   │   ├── geminiService.js
│   │   │   ├── caseGenerationService.js
│   │   │   └── scoringService.js
│   │   ├── validators/
│   │   ├── utils/
│   │   └── app.js
│   ├── server.js
│   ├── .env.example
│   └── package.json
├── SPEC.md
├── README.md
└── .gitignore
```

Codex may adapt filenames where helpful, but keep a clear separation between routes/controllers, business logic, AI integration, data models, and validation.

### 5.1 Backend responsibilities

- Validate requests.
- Call Gemini using the official `@google/genai` SDK.
- Validate generated mystery data before saving.
- Persist the case and player progress.
- Filter hidden solution fields out of active-case responses.
- Process clue discovery, hint requests, accusations, and scoring.
- Return consistent HTTP status codes and error shapes.

### 5.2 Frontend responsibilities

- Collect user input and show the game interface.
- Call the backend API.
- Render only data returned for the player's current state.
- Track presentation state, not authoritative scoring or the true culprit.
- Display errors and loading states.

## 6. Difficulty Rules (Mandatory)

The generated mystery must contain the exact counts below.

| Difficulty | Suspects | Clues | Hints |
| ---------- | -------- | ----- | ----- |
| Easy       | 3        | 5     | 2     |
| Medium     | 4        | 7     | 3     |
| Hard       | 5        | 9     | 3     |

These counts are required acceptance criteria, not suggestions.

The backend must validate the selected difficulty and generated counts before saving a case. The AI prompt should include the exact counts, but prompt instructions alone are not sufficient validation.

## 7. AI Generation and Mystery Quality

### 7.1 Gemini integration

- Call Gemini from the backend only.
- Use the official `@google/genai` SDK.
- Read the API key from `GEMINI_API_KEY`.
- Request structured JSON output where supported.
- Parse and validate the response with Zod or an equivalent schema validator.
- Treat model output as untrusted input, even when it appears to be valid JSON.
- Set reasonable timeouts and a limited retry policy.
- Do not return provider error details or API credentials to the browser.

### 7.2 Generated case structure

A case should include, at minimum:

- Title.
- Premise and story.
- Difficulty.
- Suspects, each with a stable ID, name, public profile, and motive/opportunity/alibi information appropriate to the story.
- Clues, each with a stable ID, description, discovery state, and evidence content.
- Hints, ordered from less revealing to more revealing.
- A hidden culprit identifier.
- A hidden solution explanation.
- A clue-to-solution rationale explaining how the evidence supports the culprit.
- Any optional timeline or supporting evidence artifacts that improve the investigation.

Evidence artifacts may include fictional witness statements, mock chat messages, CCTV-style event records/transcripts, documents, physical evidence descriptions, and a timeline. They must be internally consistent and must not depend on real private data or actual surveillance systems.

### 7.3 Consistency requirements

A generated case is playable only if:

- The culprit ID matches one of the generated suspects.
- Suspect, clue, and hint counts match the chosen difficulty.
- IDs are unique within their respective collections.
- All clue references point to valid suspects or evidence items when references are used.
- The solution is logically supported by the clues.
- The story, alibis, timeline, hints, and final explanation do not contradict one another.
- Hints help the player reason toward the solution without accidentally revealing the answer too early.
- The final explanation identifies the important clues and explains why the culprit fits better than the alternatives.

The backend should reject invalid output and optionally retry generation a limited number of times. If retries fail, return a safe error and let the user try again. Do not quietly save a broken case.

### 7.4 Example conceptual output shape

The following is a conceptual shape, not a requirement to use these exact property names if the implementation consistently maps equivalent fields.

```
{
  "title": "The Missing Prototype",
  "premise": "A prototype disappears during a private demonstration.",
  "story": "The full narrative shown to the player...",
  "difficulty": "medium",
  "suspects": [
    {
      "id": "suspect-1",
      "name": "Example Suspect",
      "profile": "Publicly visible profile...",
      "motive": "Potential motive...",
      "alibi": "Claimed alibi..."
    }
  ],
  "clues": [
    {
      "id": "clue-1",
      "title": "Entry Log",
      "description": "A player-visible clue...",
      "content": "The evidence detail...",
      "relatedSuspectIds": ["suspect-1"]
    }
  ],
  "hints": [
    "A subtle hint...",
    "A more direct hint..."
  ],
  "solution": {
    "culpritId": "suspect-1",
    "explanation": "Private explanation...",
    "clueRationale": ["How clue 1 supports the solution..."]
  }
}
```

The actual stored document must keep `solution` private while the case is active. Never send the complete object above directly to the frontend.

## 8. Data Model and Player Progress

Use Mongoose models. A single Case document can contain the generated case and its progress for the baseline version, provided fields are consistently validated and response filtering is reliable.

### 8.1 Case model fields

- `title`: string, required.
- `premise`: string, required.
- `story`: string, required.
- `difficulty`: enum `easy | medium | hard`, required.
- `suspects`: array of structured suspect objects.
- `clues`: array of structured clue objects.
- `hints`: array of strings or structured hint objects.
- `solution`: private object containing culprit ID, explanation, and rationale.
- `discoveredClueIds`: array of clue IDs discovered by the player.
- `usedHintCount` or `usedHintIds`: records hint usage.
- `accusation`: selected suspect ID and submission timestamp, initially absent.
- `score`: authoritative server-calculated score.
- `status`: `active | completed`.
- `createdAt` and `updatedAt`.

Use schema validation and sensible length limits. Add indexes if useful for common lookup patterns. If accounts are not implemented, use a non-guessable case ID and do not claim that this provides full user authentication or ownership control.

### 8.2 State transitions

- New valid case: `active`.
- Valid clue discovery: remains `active`.
- Valid hint request: remains `active`.
- First valid accusation: becomes `completed`.
- A completed case cannot accept more clues, hints, or accusations.
- Repeated clue discovery must not award points again.
- A hint must not be charged more than once for a single successful hint grant.
- A failed request must not partially update progress or score.

## 9. REST API Contract (Mandatory Baseline)

Use a common JSON error shape such as:

```
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "A clear, safe explanation for the user."
  }
}
```

Do not expose stack traces, hidden solutions, secrets, or raw provider errors.

### 9.1 `POST /api/cases`

Creates a mystery.

Example request:

```
{
  "premise": "A valuable painting disappears during a museum event.",
  "difficulty": "easy"
}
```

Behavior:

1. Validate the premise and difficulty.
2. Generate case content with Gemini.
3. Validate schema, exact counts, references, and logical consistency checks.
4. Save the valid case as active.
5. Return case ID and player-safe case data only.

Expected success: `201 Created`. Use a suitable `4xx` for invalid input and `5xx`/`503` for generation or service failures.

### 9.2 `GET /api/cases/:id`

Retrieves an active case.

Return the title, story, difficulty, public suspect data, clue metadata and discovery state, available progress, and safe hint usage information.

Do not include the culprit ID, hidden solution explanation, private rationale, or any other answer-bearing field.

Expected success: `200 OK`. Unknown ID: `404 Not Found`.

### 9.3 `POST /api/cases/:id/clues/:clueId/discover`

Discovers a clue.

Behavior:

- Confirm the case exists and is active.
- Confirm the clue belongs to the case.
- Record the clue only once.
- Award +5 points for a newly discovered clue according to the scoring rules.
- Return the clue content and updated progress without private solution fields.

A repeated discovery must not award additional points. Define whether a repeated request returns the existing clue with no score change or a clear conflict response, and test that behavior.

### 9.4 `POST /api/cases/:id/hints`

Requests the next available hint.

Behavior:

- Confirm the case exists and is active.
- Confirm a hint remains available.
- Return only the next eligible hint.
- Record its use and apply −10 points once.
- Do not expose later hints unless the player requests them and the rules permit them.
- Never return the solution object as part of a hint response.

If no hints remain, return a clear response without deducting points.

### 9.5 `POST /api/cases/:id/accuse`

Submits an accusation.

Example request:

```
{
  "suspectId": "suspect-2"
}
```

Behavior:

- Confirm the case exists and is active.
- Validate that `suspectId` belongs to this case.
- Process only one final accusation for the case.
- Compare the accusation to the private culprit ID on the backend.
- Calculate and persist the final score on the backend.
- Mark the case completed.
- Return the verdict and result fields permitted after accusation.

### 9.6 `GET /api/cases/:id/result`

Retrieves the completed result.

- Return the result only if the case is completed.
- Include verdict, correct culprit, explanation, final score, and an optional score breakdown.
- Do not make the hidden result available for an active case.
- An active case should receive a suitable conflict response, such as `409 Conflict`.

### 9.7 Additional operational endpoints

A health endpoint such as `GET /api/health` may be added for deployment checks. Any additional endpoints must preserve the same validation and solution-privacy rules.

## 10. Scoring Rules (Mandatory)

Use exactly the workshop scoring rules.

| Event                       | Score change |
| --------------------------- | ------------ |
| Correct accusation — Easy   | +100         |
| Correct accusation — Medium | +150         |
| Correct accusation — Hard   | +200         |
| Each newly discovered clue  | +5           |
| Each hint used              | −10          |
| Minimum final score         | 0            |

Calculate the score on the backend. A clear baseline formula is:

```
finalScore = max(
  0,
  difficultyBasePoints
  + (uniqueDiscoveredClueCount × 5)
  - (usedHintCount × 10)
)
```

Where the difficulty base is awarded only for a correct accusation. If the accusation is incorrect, the base is zero. Do not add an incorrect-accusation penalty unless it is explicitly approved as an optional rule; it is not part of the workshop's required scoring table.

The score must be derived from persisted server-side progress, not from values sent by the client. Avoid double-counting clue discoveries or hint requests. Test the formula for all difficulties, correct and incorrect accusations, and the minimum-score floor.

## 11. Security, Privacy, and Reliability

- Keep Gemini API keys, MongoDB credentials, and other secrets on the backend.
- Never commit `.env` files or secrets to GitHub.
- Include `.env.example` files with placeholder values only.
- Configure CORS to allow the deployed frontend origin and required local development origin.
- Validate and sanitize user input; impose reasonable request and text-length limits.
- Validate all route parameters and IDs.
- Filter private fields at the server response layer; do not rely on frontend hiding.
- Do not return the solution in active-case JSON, error messages, logs visible to the client, or embedded frontend assets.
- Use safe, consistent errors and avoid leaking internal stack traces.
- Consider rate limiting for case generation and hint requests to prevent abuse.
- Use a limited retry policy for Gemini errors and handle timeouts.
- Ensure state changes are atomic enough to prevent repeated requests from double-awarding points.
- Do not store or request real personal data as part of fictional evidence.
- If no authentication is implemented, document that limitation rather than implying cases are tied to verified users.

## 12. Environment Variables

### Backend `.env`

```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend `.env` (only if needed for the API base URL)

```
VITE_API_BASE_URL=http://localhost:5000/api
```

Use the production equivalents in the hosting provider's environment settings. Only variables explicitly intended for Vite may be exposed to the browser. Never place `GEMINI_API_KEY` in a `VITE_` variable.

## 13. Testing Plan

Test the application incrementally. At minimum, include the following.

### 13.1 Validation and generation

- Empty or oversized premise is rejected.
- Invalid difficulty is rejected.
- Each difficulty produces the required suspect, clue, and hint counts.
- Invalid JSON or schema-invalid Gemini output is not saved.
- Unknown suspect/clue references are rejected.
- A culprit ID not present in the suspect list is rejected.
- Contradictory or insufficiently supported solutions are rejected where validation can detect them; do not assume a schema validator alone proves narrative logic.

### 13.2 Game mechanics

- A player can discover a valid clue.
- A clue cannot award points repeatedly.
- A player can request available hints.
- A hint penalty is applied exactly once per granted hint.
- No hint remains: the response is clear and score does not change.
- Invalid suspect accusation is rejected.
- Correct and incorrect accusations return the appropriate verdict.
- A completed case cannot be modified through clue, hint, or accusation endpoints.
- Result endpoint does not reveal a result before completion.
- Score never falls below zero.

### 13.3 Security and API behavior

- Active-case responses contain no hidden solution fields.
- API errors do not expose secrets or stack traces.
- Missing cases return `404`.
- Malformed request bodies return safe validation errors.
- Gemini unavailable/timeout errors are handled gracefully.
- MongoDB connection failures are handled safely.
- CORS permits the intended frontend origin.

### 13.4 UI and production

- All five pages work and are responsive.
- Loading and error states are visible and useful.
- The full flow works from creating a case through viewing the result.
- All three difficulty levels work on the deployed site.
- Production environment variables and API URLs are correct.
- Create and solve at least one mystery on the live website before submission.

## 14. Acceptance Criteria / Definition of Done

The project is complete only when all required criteria are met.

- The Home page introduces the project and lets the player start.
- The player can enter a premise and choose Easy, Medium, or Hard.
- Gemini generates a mystery and the backend validates it before saving.
- The generated suspect, clue, and hint counts match the chosen difficulty exactly.
- The Investigation Room displays the story, suspects, clues, hints, and progress.
- Players can discover clues and request hints.
- Players can submit an accusation against a valid suspect.
- The culprit and solution remain private until the accusation is submitted.
- The backend calculates and validates scores using the mandatory scoring rules.
- The result shows the correct verdict, culprit, explanation, and score.
- A player can start another mystery.
- Invalid AI output and API failures are handled safely.
- The UI has useful loading/error states and responsive behavior.
- Secrets are not exposed in frontend code or committed to GitHub.
- The full mystery-solving flow works on the deployed website.
- The GitHub repository and live website URL are ready for submission.

## 15. Build and Deployment Plan

Implement in small, verifiable phases. Do not generate the entire application in one step.

### Phase 1 — Project setup

- Create separate `client` and `server` apps.
- Set up React/Vite/Tailwind and Express.
- Add environment examples and `.gitignore`.
- Verify the frontend can call the backend health endpoint.

### Phase 2 — Database and API skeleton

- Connect Mongoose to MongoDB.
- Create and validate the Case model.
- Implement the six required API routes with request/response schemas.
- Test route behavior before adding AI generation.

### Phase 3 — Gemini generation

- Integrate `@google/genai` on the backend.
- Write a structured mystery-generation prompt.
- Validate the response, counts, references, and solution fields.
- Add bounded retry and failure handling.
- Verify the solution is filtered from active-case responses.

### Phase 4 — Game mechanics

- Implement clue discovery, hint use, accusation, state transitions, and backend scoring.
- Test duplicate requests and completed-case restrictions.

### Phase 5 — Frontend pages

- Build Home, Create Mystery, Investigation Room, Accusation, and Results.
- Connect the UI to the API.
- Add responsive layout, loading states, error states, and progress feedback.

### Phase 6 — End-to-end testing

- Test all difficulty levels.
- Test correct and incorrect accusations.
- Inspect network responses to ensure the solution is not leaked before accusation.
- Test invalid AI output and service failures.

### Phase 7 — Deployment

- Create/configure MongoDB Atlas.
- Deploy the backend to a suitable host.
- Configure backend environment variables and production CORS.
- Deploy the frontend to Vercel.
- Set `VITE_API_BASE_URL` to the deployed backend API.
- Run the complete game on the production URL.

### Phase 8 — Submission

- Ensure the GitHub repository contains the complete source code and setup instructions.
- Ensure secrets and `.env` files are excluded.
- Add a README with local setup, environment variables, scripts, API overview, and deployment notes.
- Confirm the live website URL works and a mystery can be created and solved.
- Submit the GitHub repository and live website URL using the workshop submission form.

## 16. Local Setup Expectations

The workshop guide's baseline commands are:

### Frontend

```
npm create vite@latest client -- --template react
cd client
npm install
npm install react-router-dom axios
```

Install and configure Tailwind CSS using the instructions for the Tailwind version selected by the project.

### Backend

```
mkdir server
cd server
npm init -y
npm install express cors dotenv mongoose @google/genai zod
npm install --save-dev nodemon
```

Use a supported Node.js version and document the actual run scripts in each `package.json`. Do not assume that these initial commands complete the application; configure the entry points, environment variables, scripts, and database connection.

## 17. Instructions for Codex

Treat this `SPEC.md` as the primary source of truth.

1. Read the entire spec before editing files.
2. Inspect the existing repository before creating, moving, or replacing files.
3. If the repository already contains work, preserve it unless a change is required and explained.
4. Implement one phase at a time in the order in Section 15.
5. Before each phase, state the files you intend to create/change and the acceptance criteria being addressed.
6. After each phase, run the relevant tests or verification commands and report the actual results.
7. Do not claim that a command or test passed unless it was actually run and passed.
8. Do not silently change the mandatory difficulty counts, scoring rules, API contract, technology stack, or solution-privacy rules.
9. Do not expose the culprit or solution in any active-case API response.
10. Keep Gemini integration on the backend and use environment variables for secrets.
11. Prefer simple, readable code with clear separation of concerns over unnecessary abstractions.
12. If a requirement is ambiguous, ask a focused question or state a conservative assumption before implementing it.
13. If a requirement cannot be completed, explain the blocker and leave the project in a working state.
14. Keep `SPEC.md` updated if an agreed design change alters the documented behavior.
15. Do not attempt to implement all phases in one giant code-generation step.


## 18. Change Management and Final Priorities

Priority order:

1. Satisfy the workshop's mandatory requirements.
2. Keep the mystery logically consistent and the solution private.
3. Ensure the full game flow and scoring work correctly.
4. Make the UI responsive and understandable.
5. Add optional visual polish or enhancements only after the required flow works.

Any proposed change to the mandatory counts, scoring, required routes, technology stack, or backend solution protection must be explicitly reviewed before implementation.

Final principle: A smaller, thoroughly tested, deployed mystery game that meets every workshop acceptance criterion is preferable to a larger feature set that is incomplete or unreliable.

## 19. Mandatory Requirements vs. Differentiators


The following cannot be omitted or silently changed:

- Required technology stack.
- Five required pages.
- Six API endpoints.
- Exact difficulty counts.
- Exact scoring rules.
- Backend-side scoring.
- Backend-only solution protection.
- AI output validation.
- Acceptance criteria.
- Deployment verification.
- GitHub/live URL submission.

### Intended differentiators

The digital detective casefile presentation, suspect dossiers, evidence desk, optional timeline/contradiction view, progress display, and evidence-based result explanation are the project's distinctive product direction.

Implement these on top of the mandatory game flow without changing required counts, scores, or solution privacy.

Definition of success: A unique, polished detective investigation experience that still passes every workshop acceptance criterion.

