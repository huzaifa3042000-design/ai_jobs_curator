# Editorial Intelligence — Upwork AI Job Curator

An AI-assisted Upwork job discovery and evaluation tool that helps freelancers find, score, and respond to the most relevant opportunities.

## Quick Start

### 1. Environment Setup

```bash
# Copy environment template
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your credentials:

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Supabase service role key |
| `UPWORK_CLIENT_ID` | Upwork OAuth2 client ID |
| `UPWORK_CLIENT_SECRET` | Upwork OAuth2 client secret |
| `UPWORK_REDIRECT_URI` | `http://localhost:3001/api/auth/callback` |
| `OPENROUTER_API_KEY` | OpenRouter API key |
| `OPENROUTER_MODEL` | LLM model (default: `google/gemini-2.0-flash-001`) |

### 2. Database Setup

Run `backend/src/db/schema.sql` in your Supabase SQL Editor to create the tables.

### 3. Install & Run

```bash
# Install all dependencies
npm run install:all

# Start both backend and frontend
npm run dev
```

- **Backend**: http://localhost:3001
- **Frontend**: http://localhost:5173

### 4. Authenticate with Upwork

1. Visit http://localhost:3001/api/auth/url to get the OAuth authorization URL
2. Open the URL in your browser and authorize the app
3. The callback will store your tokens automatically

## Architecture

```
/backend          Express.js API server
  /src/api        Route controllers (auth, jobs, preferences, feedback)
  /src/services   Business logic (upwork, llm, scoring, job orchestration)
  /src/workers    Cron workers (fetch, score, cleanup)
  /src/db         Supabase client and queries

/frontend         React + Vite SPA
  /src/pages      Dashboard, JobDetails, Preferences
  /src/components JobCard, ScoreBadge, FeedbackButtons, Layout
  /src/hooks      React Query hooks
  /src/services   API client

/shared           Shared constants and validation schemas
```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/auth/url` | Get Upwork OAuth URL |
| GET | `/api/auth/callback` | OAuth callback handler |
| GET | `/api/me` | Current user info |
| GET | `/api/preferences` | Get preferences |
| POST | `/api/preferences` | Update preferences |
| GET | `/api/jobs` | List jobs (sorted, paginated) |
| GET | `/api/jobs/:id` | Job details with scores |
| POST | `/api/jobs/fetch` | Trigger Upwork fetch |
| POST | `/api/jobs/score` | Trigger LLM scoring |
| POST | `/api/jobs/pipeline` | Full fetch + score pipeline |
| POST | `/api/jobs/:id/refresh` | Re-score a job |
| POST | `/api/jobs/:id/proposal` | Generate AI proposal |
| POST | `/api/jobs/:id/feedback` | Submit feedback (GOOD/BAD) |

## Background Workers

| Worker | Interval | Description |
|---|---|---|
| Job Fetcher | 10 min | Fetches jobs from Upwork API |
| Scoring Engine | 5 min | Scores unscored jobs via LLM |
| Cleanup | 30 min | Marks stale jobs inactive |
