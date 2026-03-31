-- Upwork AI Agent Schema
-- Run this in your Supabase SQL Editor

-- Saved Searches
CREATE TABLE IF NOT EXISTS saved_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL DEFAULT 'Default Search',

  skills text[],
  categories text[],
  subcategories text[],

  job_type text,
  experience_level text,

  budget_min numeric,
  budget_max numeric,

  hourly_rate_min numeric,
  hourly_rate_max numeric,

  proposal_min int,
  proposal_max int,

  client_hires_min int,
  client_hires_max int,

  verified_payment_only boolean DEFAULT false,

  locations text[],
  timezone text,

  engagement_type text,

  instructions text,

  weight_high_budget int DEFAULT 1,
  weight_low_competition int DEFAULT 1,
  weight_client_quality int DEFAULT 1,
  weight_long_term int DEFAULT 1,

  risk_tolerance int DEFAULT 2,

  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Jobs (Upwork cache)
CREATE TABLE IF NOT EXISTS jobs (
  id text PRIMARY KEY,

  title text,
  description text,

  budget_min numeric,
  budget_max numeric,
  hourly_min numeric,
  hourly_max numeric,

  client_name text,
  client_country text,
  client_rating numeric,
  client_hires int,
  client_total_spent text,
  client_payment_verified boolean,

  proposal_count int,

  job_type text,
  experience_level text,

  skills text[],
  category text,
  subcategory text,

  duration text,
  engagement text,
  ciphertext text,

  posted_at timestamp,
  expires_at timestamp,

  source_hash text,
  last_fetched_at timestamp DEFAULT now(),
  is_active boolean DEFAULT true,

  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Job Scores
CREATE TABLE IF NOT EXISTS job_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  job_id text REFERENCES jobs(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  saved_search_id uuid REFERENCES saved_searches(id) ON DELETE CASCADE,

  score numeric,
  reasoning text,
  risk_score numeric,
  skill_match_score numeric,
  budget_match_score numeric,
  client_quality_score numeric,

  computed_at timestamp DEFAULT now(),

  UNIQUE(job_id, saved_search_id)
);

-- User Feedback
CREATE TABLE IF NOT EXISTS user_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id uuid NOT NULL,
  job_id text REFERENCES jobs(id),

  feedback text,
  note text,

  created_at timestamp DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_jobs_posted_at ON jobs(posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_is_active ON jobs(is_active);
CREATE INDEX IF NOT EXISTS idx_job_scores_job_search ON job_scores(job_id, saved_search_id);
CREATE INDEX IF NOT EXISTS idx_job_scores_score ON job_scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_user_feedback_user_job ON user_feedback(user_id, job_id);
