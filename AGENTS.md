# Agent Project Guide: Upwork AI Agent

## Project Overview
AI-powered job curator for Upwork. Fetches jobs via Upwork GraphQL API, scores them against user preferences using OpenRouter (LLM), and displays them with AI-generated reasoning in a React dashboard.

## Tech Stack
-   **Frontend**: React, Vite, TanStack Query, React Router, Vanilla CSS.
-   **Backend**: Node.js, Express, Supabase (PostgreSQL).
-   **Shared**: `/shared` (constants, schemas).
-   **Services**: Upwork (Jobs), OpenRouter (Scoring/Proposals).

## High-Level Architecture
-   **Frontend**: `App.jsx` → `Dashboard.jsx` / `JobDetails.jsx` → `hooks/` → `services/api.js`.
-   **Backend**: `app.js` → `routes/` → `api/` (controllers) → `services/` → `db/queries.js` → Supabase.
-   **Automation**: Background workers in `backend/src/workers/` scheduled via `node-cron` in `app.js`.

## Directory Map
-   `/backend/src/api`: Controller-like route handlers.
-   `/backend/src/services`: Core logic (Upwork, LLM, Scoring).
-   `/backend/src/db`: Database client and abstracted query functions.
-   `/frontend/src/hooks`: React Query hooks for state management.
-   `/examples`: Refence patterns for controllers, queries, and hooks.

## Coding Conventions
-   **Query Pattern**: Always put database logic in `db/queries.js`. Throw errors from queries, catch in controllers.
-   **Single Tenant**: System currently uses `DEFAULT_USER_ID` from `shared/constants.js`. Do not implement complex multi-tenancy yet.
-   **Validation**: Use `shared/schemas.js` for validating preferences and feedback.
-   **Styling**: Use Vanilla CSS in `index.css`. Favor modern, dark-themed, glassmorphism aesthetics.
-   **IDs**: Use ciphertext for Upwork job URLs where possible (e.g., `job.ciphertext`).

## Critical Workflows
-   **Run Dev**: `npm run dev` (starts both frontend and backend).
-   **Fetch & Score**: Manually triggered via `/api/jobs/pipeline` or via cron every 10 min.
-   **Schema Updates**: Migrations are in `/supabase/migrations`.

## Reference Patterns
See the `/examples` directory for:
-   `backend-controller.js`: Unified route and error handling.
-   `backend-query.js`: Standard Supabase query structure.
-   `frontend-hook.js`: TanStack Query implementation.
