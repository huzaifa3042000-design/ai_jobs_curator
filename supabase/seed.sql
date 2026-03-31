-- Seed data for Upwork AI Agent
-- User ID: 00000000-0000-0000-0000-000000000001

-- 1. Saved Searches
INSERT INTO saved_searches (id, user_id, name, skills, budget_min, hourly_rate_min, experience_level, weight_high_budget, weight_client_quality, risk_tolerance, instructions)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'React / AI Expert',
  ARRAY['React', 'Node.js', 'PostgreSQL', 'AI', 'Tailwind', 'TypeScript'],
  1000,
  50,
  'EXPERT',
  2,
  3,
  2,
  'Focus on high-quality clients with verified payment. Prefer long-term projects or AI/ML integrations.'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  skills = EXCLUDED.skills,
  budget_min = EXCLUDED.budget_min,
  hourly_rate_min = EXCLUDED.hourly_rate_min,
  instructions = EXCLUDED.instructions;

-- 2. Jobs
INSERT INTO jobs (id, title, description, budget_min, budget_max, hourly_min, hourly_max, client_country, client_rating, client_hires, client_total_spent, client_payment_verified, proposal_count, job_type, experience_level, skills, posted_at, is_active, ciphertext)
VALUES
('~01111111', 'Senior React Developer for AI Dashboard', 'Looking for an expert React developer to build a complex dashboard with real-time data visualization and AI insights integration.', 5000, 8000, NULL, NULL, 'United States', 4.9, 120, '$500k+', true, 12, 'FIXED', 'EXPERT', ARRAY['React', 'D3.js', 'AI', 'TypeScript'], NOW() - INTERVAL '2 hours', true, '01111111'),
('~02222222', 'Node.js API Specialist - Postgres Optimization', 'Seeking 10 hours a week for database tuning and API optimization for a growing SaaS application.', NULL, NULL, 60, 90, 'United Kingdom', 5.0, 45, '$80k+', true, 8, 'HOURLY', 'EXPERT', ARRAY['Node.js', 'PostgreSQL', 'Redis'], NOW() - INTERVAL '5 hours', true, '02222222'),
('~03333333', 'Full Stack Engineer - Next.js & Supabase', 'Build a MVP for a fintech startup. Must be fast and reliable.', 2000, 3500, NULL, NULL, 'Germany', 4.8, 12, '$20k+', true, 45, 'FIXED', 'INTERMEDIATE', ARRAY['Next.js', 'Supabase', 'Tailwind'], NOW() - INTERVAL '1 hour', true, '03333333'),
('~04444444', 'AI Prompt Engineer for Marketing Automation', 'Help us automate our marketing workflows using LLMs and Python.', NULL, NULL, 40, 70, 'Canada', 4.7, 5, '$5k+', false, 60, 'HOURLY', 'INTERMEDIATE', ARRAY['Python', 'AI', 'LLM'], NOW() - INTERVAL '45 minutes', true, '04444444'),
('~05555555', 'Junior Frontend Dev - Bug fixes', 'Help fix CSS and small React bugs in our existing app.', 500, 500, NULL, NULL, 'India', 4.5, 200, '$10k+', true, 5, 'FIXED', 'ENTRY_LEVEL', ARRAY['React', 'CSS'], NOW() - INTERVAL '10 hours', true, '05555555'),
('~06666666', 'TypeScript Migration - Large Codebase', 'Looking for someone to migrate our JS codebase to TS.', NULL, NULL, 50, 75, 'France', 4.9, 30, '$150k+', true, 15, 'HOURLY', 'EXPERT', ARRAY['TypeScript', 'JavaScript'], NOW() - INTERVAL '1 day', true, '06666666'),
('~07777777', 'Custom AI Agent Development', 'Develop a custom agent using LangChain and Gemini.', 3000, 6000, NULL, NULL, 'Australia', 5.0, 2, '$10k+', true, 20, 'FIXED', 'EXPERT', ARRAY['Python', 'AI', 'LangChain'], NOW() - INTERVAL '3 hours', true, '07777777'),
('~08888888', 'Postgres Database Administrator', 'Need a part-time DBA for performance tuning.', NULL, NULL, 80, 120, 'United States', 4.9, 80, '$200k+', true, 2, 'HOURLY', 'EXPERT', ARRAY['PostgreSQL'], NOW() - INTERVAL '30 minutes', true, '08888888'),
('~09000000', 'Mobile App with React Native', 'Seeking dev for a 6 month project building a fitness app.', 10000, 20000, NULL, NULL, 'Israel', 4.8, 15, '$100k+', true, 50, 'FIXED', 'EXPERT', ARRAY['React Native', 'Firebase'], NOW() - INTERVAL '4 hours', true, '09000000'),
('~10000000', 'Simple Landing Page with HTML/CSS', 'Fast turnaround needed for a single page site.', 100, 200, NULL, NULL, 'Brazil', 3.5, 1, '$150', false, 100, 'FIXED', 'ENTRY_LEVEL', ARRAY['HTML', 'CSS'], NOW() - INTERVAL '12 hours', true, '10000000'),
('~11000000', 'Cloud Architect - AWS Specialist', 'Architecture review for a serverless application.', NULL, NULL, 100, 150, 'Singapore', 5.0, 10, '$1M+', true, 3, 'HOURLY', 'EXPERT', ARRAY['AWS', 'Lambda', 'Node.js'], NOW() - INTERVAL '6 hours', true, '11000000'),
('~12000000', 'E-commerce Theme Customization', 'Custom child theme for Shopify.', 800, 1500, NULL, NULL, 'Netherlands', 4.6, 25, '$40k+', true, 12, 'FIXED', 'INTERMEDIATE', ARRAY['Liquid', 'Shopify', 'JS'], NOW() - INTERVAL '8 hours', true, '12000000'),
('~13000000', 'Real-time Chat with Socket.io', 'Integrate a chat feature into our Node backend.', NULL, NULL, 60, 80, 'Spain', 4.9, 50, '$300k+', true, 18, 'HOURLY', 'EXPERT', ARRAY['Node.js', 'Socket.io', 'React'], NOW() - INTERVAL '2 hours', true, '13000000'),
('~14000000', 'Data Science - Python/Pandas', 'Analyze our sales data and provide reports.', 1500, 2500, NULL, NULL, 'Canada', 4.7, 18, '$60k+', true, 22, 'FIXED', 'INTERMEDIATE', ARRAY['Python', 'Pandas', 'Data Analysis'], NOW() - INTERVAL '1 day', true, '14000000'),
('~15000000', 'Cybersecurity Audit', 'Security assessment for a web application.', 2000, 5000, NULL, NULL, 'United States', 5.0, 5, '$30k+', true, 6, 'FIXED', 'EXPERT', ARRAY['Security', 'Node.js'], NOW() - INTERVAL '3 hours', true, '15000000')
ON CONFLICT (id) DO NOTHING;

-- 3. Job Scores
INSERT INTO job_scores (job_id, user_id, saved_search_id, score, reasoning, risk_score, skill_match_score, budget_match_score, client_quality_score)
VALUES
('~01111111', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 94, 'Perfect match for your React and AI skills. High budget and verified client with massive spend history.', 10, 95, 90, 98),
('~02222222', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 88, 'Strong match on Node/Postgres stack. Hourly rate is within your premium range and client is highly rated.', 15, 85, 90, 90),
('~03333333', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 75, 'Good fit for Supabase/Next.js, but budget is a bit on the lower side for your preferences.', 20, 90, 60, 80),
('~04444444', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 52, 'Risky due to unverified payment and very high competition already (60+ proposals). Match on AI/Python is good though.', 65, 80, 70, 20),
('~05555555', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 30, 'Below your experience level and minimum budget. Client hires a lot but rates are very low.', 25, 40, 20, 50),
('~06666666', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 82, 'Excellent technical match for TS migration. High client quality and manageable competition.', 18, 95, 80, 85),
('~07777777', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 91, 'Perfect alignment with AI/Gemini focus. High budget and expert level requirement.', 12, 98, 90, 75),
('~08888888', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 85, 'Premium rate match for Postgres optimization. Low competition (only 2 proposals).', 10, 85, 95, 90),
('~09000000', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 68, 'High budget but React Native is not your primary core skill. High competition is a deterrent.', 35, 60, 95, 85),
('~10000000', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 20, 'Not a professional match. Low budget, unverified payment, and high competition.', 80, 30, 10, 10),
('~11000000', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 90, 'High-end architecture role on AWS/Node. Exceptional budget match and client quality.', 5, 80, 98, 98),
('~12000000', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 45, 'Limited alignment with core JS/Node skills. Mostly Shopify specific.', 30, 40, 60, 70),
('~13000000', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 84, 'Solid match for Node.js and Socket.io. Good client and hourly rate.', 20, 90, 85, 80),
('~14000000', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 72, 'Good fit for Python automation, but not focused on your primary web stack.', 25, 75, 70, 75),
('~15000000', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 87, 'Security review roles pays well and matches your technical expertise in Node.js backends.', 15, 80, 90, 95)
ON CONFLICT (job_id, saved_search_id) DO NOTHING;

-- 4. User Feedback
INSERT INTO user_feedback (user_id, job_id, feedback, note)
VALUES
('00000000-0000-0000-0000-000000000001', '~01111111', 'GOOD', 'Excellent project, sending proposal now.'),
('00000000-0000-0000-0000-000000000001', '~04444444', 'BAD', 'Unverified payment and too many proposals.'),
('00000000-0000-0000-0000-000000000001', '~05555555', 'BAD', 'Way too entry level.'),
('00000000-0000-0000-0000-000000000001', '~07777777', 'GOOD', 'AI agents are exactly what I want to work on.'),
('00000000-0000-0000-0000-000000000001', '~10000000', 'BAD', 'Scammy vibe.')
ON CONFLICT (user_id, job_id) DO NOTHING;
