import supabase from './supabase.js';
import { DEFAULT_USER_ID } from '../../../shared/constants.js';

async function seed() {
  console.log('🌱 Starting database seeding...');

  try {
    // 1. Saved Searches
    const SEARCH_ID = '00000000-0000-0000-0000-000000000002';
    const { error: prefError } = await supabase
      .from('saved_searches')
      .upsert({
        id: SEARCH_ID,
        user_id: DEFAULT_USER_ID,
        name: 'React / AI Expert',
        skills: ['React', 'Node.js', 'PostgreSQL', 'AI', 'Tailwind', 'TypeScript'],
        budget_min: 1000,
        hourly_rate_min: 50,
        experience_level: 'EXPERT',
        weight_high_budget: 2,
        weight_client_quality: 3,
        risk_tolerance: 2,
        instructions: 'Focus on high-quality clients with verified payment. Prefer long-term projects or AI/ML integrations.',
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (prefError) throw new Error(`Searches: ${prefError.message}`);
    console.log('✅ Saved searches seeded');

    // 2. Jobs
    const jobs = [
      { id: '~01111111', title: 'Senior React Developer for AI Dashboard', description: 'Looking for an expert React developer...', budget_min: 5000, budget_max: 8000, client_country: 'United States', client_rating: 4.9, client_hires: 120, client_total_spent: '$500k+', client_payment_verified: true, proposal_count: 12, job_type: 'FIXED', experience_level: 'EXPERT', skills: ['React', 'D3.js', 'AI', 'TypeScript'], posted_at: new Date(Date.now() - 7200000).toISOString(), ciphertext: '01111111' },
      { id: '~02222222', title: 'Node.js API Specialist - Postgres Optimization', description: 'Seeking 10 hours a week for database tuning...', hourly_min: 60, hourly_max: 90, client_country: 'United Kingdom', client_rating: 5.0, client_hires: 45, client_total_spent: '$80k+', client_payment_verified: true, proposal_count: 8, job_type: 'HOURLY', experience_level: 'EXPERT', skills: ['Node.js', 'PostgreSQL', 'Redis'], posted_at: new Date(Date.now() - 18000000).toISOString(), ciphertext: '02222222' },
      { id: '~03333333', title: 'Full Stack Engineer - Next.js & Supabase', description: 'Build a MVP for a fintech startup...', budget_min: 2000, budget_max: 3500, client_country: 'Germany', client_rating: 4.8, client_hires: 12, client_total_spent: '$20k+', client_payment_verified: true, proposal_count: 45, job_type: 'FIXED', experience_level: 'INTERMEDIATE', skills: ['Next.js', 'Supabase', 'Tailwind'], posted_at: new Date(Date.now() - 3600000).toISOString(), ciphertext: '03333333' },
      { id: '~04444444', title: 'AI Prompt Engineer for Marketing Automation', description: 'Help us automate our marketing workflows...', hourly_min: 40, hourly_max: 70, client_country: 'Canada', client_rating: 4.7, client_hires: 5, client_total_spent: '$5k+', client_payment_verified: false, proposal_count: 60, job_type: 'HOURLY', experience_level: 'INTERMEDIATE', skills: ['Python', 'AI', 'LLM'], posted_at: new Date(Date.now() - 2700000).toISOString(), ciphertext: '04444444' },
      { id: '~05555555', title: 'Junior Frontend Dev - Bug fixes', description: 'Help fix CSS and small React bugs...', budget_min: 500, budget_max: 500, client_country: 'India', client_rating: 4.5, client_hires: 200, client_total_spent: '$10k+', client_payment_verified: true, proposal_count: 5, job_type: 'FIXED', experience_level: 'ENTRY_LEVEL', skills: ['React', 'CSS'], posted_at: new Date(Date.now() - 36000000).toISOString(), ciphertext: '05555555' },
      { id: '~06666666', title: 'TypeScript Migration - Large Codebase', description: 'Migrate our large JS codebase to TS...', hourly_min: 50, hourly_max: 75, client_country: 'France', client_rating: 4.9, client_hires: 30, client_total_spent: '$150k+', client_payment_verified: true, proposal_count: 15, job_type: 'HOURLY', experience_level: 'EXPERT', skills: ['TypeScript', 'JavaScript'], posted_at: new Date(Date.now() - 86400000).toISOString(), ciphertext: '06666666' },
      { id: '~07777777', title: 'Custom AI Agent Development', description: 'Develop a custom agent using LangChain...', budget_min: 3000, budget_max: 6000, client_country: 'Australia', client_rating: 5.0, client_hires: 2, client_total_spent: '$10k+', client_payment_verified: true, proposal_count: 20, job_type: 'FIXED', experience_level: 'EXPERT', skills: ['Python', 'AI', 'LangChain'], posted_at: new Date(Date.now() - 10800000).toISOString(), ciphertext: '07777777' },
      { id: '~08888888', title: 'Postgres Database Administrator', description: 'Part-time DBA for performance tuning...', hourly_min: 80, hourly_max: 120, client_country: 'United States', client_rating: 4.9, client_hires: 80, client_total_spent: '$200k+', client_payment_verified: true, proposal_count: 2, job_type: 'HOURLY', experience_level: 'EXPERT', skills: ['PostgreSQL'], posted_at: new Date(Date.now() - 1800000).toISOString(), ciphertext: '08888888' },
      { id: '~09000000', title: 'Mobile App with React Native', description: 'Build a fitness app for 6 months...', budget_min: 10000, budget_max: 20000, client_country: 'Israel', client_rating: 4.8, client_hires: 15, client_total_spent: '$100k+', client_payment_verified: true, proposal_count: 50, job_type: 'FIXED', experience_level: 'EXPERT', skills: ['React Native', 'Firebase'], posted_at: new Date(Date.now() - 14400000).toISOString(), ciphertext: '09000000' },
      { id: '~10000000', title: 'Simple Landing Page with HTML/CSS', description: 'Fast turnaround for a single page...', budget_min: 100, budget_max: 200, client_country: 'Brazil', client_rating: 3.5, client_hires: 1, client_total_spent: '$150', client_payment_verified: false, proposal_count: 100, job_type: 'FIXED', experience_level: 'ENTRY_LEVEL', skills: ['HTML', 'CSS'], posted_at: new Date(Date.now() - 43200000).toISOString(), ciphertext: '10000000' },
      { id: '~11000000', title: 'Cloud Architect - AWS Specialist', description: 'Architecture review for serverless...', hourly_min: 100, hourly_max: 150, client_country: 'Singapore', client_rating: 5.0, client_hires: 10, client_total_spent: '$1M+', client_payment_verified: true, proposal_count: 3, job_type: 'HOURLY', experience_level: 'EXPERT', skills: ['AWS', 'Lambda', 'Node.js'], posted_at: new Date(Date.now() - 21600000).toISOString(), ciphertext: '11000000' },
      { id: '~12000000', title: 'E-commerce Theme Customization', description: 'Custom child theme for Shopify...', budget_min: 800, budget_max: 1500, client_country: 'Netherlands', client_rating: 4.6, client_hires: 25, client_total_spent: '$40k+', client_payment_verified: true, proposal_count: 12, job_type: 'FIXED', experience_level: 'INTERMEDIATE', skills: ['Liquid', 'Shopify', 'JS'], posted_at: new Date(Date.now() - 28800000).toISOString(), ciphertext: '12000000' },
      { id: '~13000000', title: 'Real-time Chat with Socket.io', description: 'Integrate chat into Node backend...', hourly_min: 60, hourly_max: 80, client_country: 'Spain', client_rating: 4.9, client_hires: 50, client_total_spent: '$300k+', client_payment_verified: true, proposal_count: 18, job_type: 'HOURLY', experience_level: 'EXPERT', skills: ['Node.js', 'Socket.io', 'React'], posted_at: new Date(Date.now() - 7200000).toISOString(), ciphertext: '13000000' },
      { id: '~14000000', title: 'Data Science - Python/Pandas', description: 'Analyze sales data and reports...', budget_min: 1500, budget_max: 2500, client_country: 'Canada', client_rating: 4.7, client_hires: 18, client_total_spent: '$60k+', client_payment_verified: true, proposal_count: 22, job_type: 'FIXED', experience_level: 'INTERMEDIATE', skills: ['Python', 'Pandas', 'Data Analysis'], posted_at: new Date(Date.now() - 86400000).toISOString(), ciphertext: '14000000' },
      { id: '~15000000', title: 'Cybersecurity Audit', description: 'Security assessment for web app...', budget_min: 2000, budget_max: 5000, client_country: 'United States', client_rating: 5.0, client_hires: 5, client_total_spent: '$30k+', client_payment_verified: true, proposal_count: 6, job_type: 'FIXED', experience_level: 'EXPERT', skills: ['Security', 'Node.js'], posted_at: new Date(Date.now() - 10800000).toISOString(), ciphertext: '15000000' }
    ];

    const { error: jobError } = await supabase
      .from('jobs')
      .upsert(jobs.map(j => ({
        ...j,
        last_fetched_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })), { onConflict: 'id' });

    if (jobError) throw new Error(`Jobs: ${jobError.message}`);
    console.log(`✅ ${jobs.length} jobs seeded`);

    // 3. Job Scores
    const scores = [
      { job_id: '~01111111', user_id: DEFAULT_USER_ID, saved_search_id: SEARCH_ID, score: 94, reasoning: 'Perfect match for your React and AI skills. High budget and verified client with massive spend history.', risk_score: 10, skill_match_score: 95, budget_match_score: 90, client_quality_score: 98 },
      { job_id: '~02222222', user_id: DEFAULT_USER_ID, saved_search_id: SEARCH_ID, score: 88, reasoning: 'Strong match on Node/Postgres stack. Hourly rate is within your premium range and client is highly rated.', risk_score: 15, skill_match_score: 85, budget_match_score: 90, client_quality_score: 90 },
      { job_id: '~03333333', user_id: DEFAULT_USER_ID, saved_search_id: SEARCH_ID, score: 75, reasoning: 'Good fit for Supabase/Next.js, but budget is a bit on the lower side for your preferences.', risk_score: 20, skill_match_score: 90, budget_match_score: 60, client_quality_score: 80 },
      { job_id: '~04444444', user_id: DEFAULT_USER_ID, saved_search_id: SEARCH_ID, score: 52, reasoning: 'Risky due to unverified payment and very high competition already (60+ proposals).', risk_score: 65, skill_match_score: 80, budget_match_score: 70, client_quality_score: 20 },
      { job_id: '~05555555', user_id: DEFAULT_USER_ID, saved_search_id: SEARCH_ID, score: 30, reasoning: 'Below your experience level and minimum budget. Client hires a lot but rates are very low.', risk_score: 25, skill_match_score: 40, budget_match_score: 20, client_quality_score: 50 },
      { job_id: '~06666666', user_id: DEFAULT_USER_ID, saved_search_id: SEARCH_ID, score: 82, reasoning: 'Excellent technical match for TS migration. High client quality and manageable competition.', risk_score: 18, skill_match_score: 95, budget_match_score: 80, client_quality_score: 85 },
      { job_id: '~07777777', user_id: DEFAULT_USER_ID, saved_search_id: SEARCH_ID, score: 91, reasoning: 'Perfect alignment with AI/Gemini focus. High budget and expert level requirement.', risk_score: 12, skill_match_score: 98, budget_match_score: 90, client_quality_score: 75 },
      { job_id: '~08888888', user_id: DEFAULT_USER_ID, saved_search_id: SEARCH_ID, score: 85, reasoning: 'Premium rate match for Postgres optimization. Low competition (only 2 proposals).', risk_score: 10, skill_match_score: 85, budget_match_score: 95, client_quality_score: 90 },
      { job_id: '~09000000', user_id: DEFAULT_USER_ID, saved_search_id: SEARCH_ID, score: 68, reasoning: 'High budget but React Native is not your primary core skill.', risk_score: 35, skill_match_score: 60, budget_match_score: 95, client_quality_score: 85 },
      { job_id: '~10000000', user_id: DEFAULT_USER_ID, saved_search_id: SEARCH_ID, score: 20, reasoning: 'Not a professional match. Low budget, unverified payment, and high competition.', risk_score: 80, skill_match_score: 30, budget_match_score: 10, client_quality_score: 10 },
      { job_id: '~11000000', user_id: DEFAULT_USER_ID, saved_search_id: SEARCH_ID, score: 90, reasoning: 'High-end architecture role on AWS/Node. Exceptional budget match and client quality.', risk_score: 5, skill_match_score: 80, budget_match_score: 98, client_quality_score: 98 },
      { job_id: '~12000000', user_id: DEFAULT_USER_ID, saved_search_id: SEARCH_ID, score: 45, reasoning: 'Limited alignment with core JS/Node skills. Mostly Shopify specific.', risk_score: 30, skill_match_score: 40, budget_match_score: 60, client_quality_score: 70 },
      { job_id: '~13000000', user_id: DEFAULT_USER_ID, saved_search_id: SEARCH_ID, score: 84, reasoning: 'Solid match for Node.js and Socket.io. Good client and hourly rate.', risk_score: 20, skill_match_score: 90, budget_match_score: 85, client_quality_score: 80 },
      { job_id: '~14000000', user_id: DEFAULT_USER_ID, saved_search_id: SEARCH_ID, score: 72, reasoning: 'Good fit for Python automation, but not focused on your primary web stack.', risk_score: 25, skill_match_score: 75, budget_match_score: 70, client_quality_score: 75 },
      { job_id: '~15000000', user_id: DEFAULT_USER_ID, saved_search_id: SEARCH_ID, score: 87, reasoning: 'Security review roles pays well and matches your technical expertise in Node.js backends.', risk_score: 15, skill_match_score: 80, budget_match_score: 90, client_quality_score: 95 }
    ];

    const { error: scoreError } = await supabase
      .from('job_scores')
      .upsert(scores.map(s => ({
        ...s,
        computed_at: new Date().toISOString()
      })), { onConflict: 'job_id,saved_search_id' });

    if (scoreError) throw new Error(`Scores: ${scoreError.message}`);
    console.log(`✅ ${scores.length} job scores seeded`);

    // 4. User Feedback
    const feedbacks = [
      { user_id: DEFAULT_USER_ID, job_id: '~01111111', feedback: 'GOOD', note: 'Excellent project, sending proposal now.' },
      { user_id: DEFAULT_USER_ID, job_id: '~04444444', feedback: 'BAD', note: 'Unverified payment and too many proposals.' },
      { user_id: DEFAULT_USER_ID, job_id: '~05555555', feedback: 'BAD', note: 'Way too entry level.' },
      { user_id: DEFAULT_USER_ID, job_id: '~07777777', feedback: 'GOOD', note: 'AI agents are exactly what I want to work on.' },
      { user_id: DEFAULT_USER_ID, job_id: '~10000000', feedback: 'BAD', note: 'Scammy vibe.' }
    ];

    // Delete existing to avoid conflicts since unique constraint might be missing
    await supabase.from('user_feedback').delete().eq('user_id', DEFAULT_USER_ID).in('job_id', feedbacks.map(f => f.job_id));

    const { error: feedbackError } = await supabase
      .from('user_feedback')
      .insert(feedbacks);

    if (feedbackError) throw new Error(`Feedback: ${feedbackError.message}`);
    console.log(`✅ ${feedbacks.length} user feedbacks seeded`);

    console.log('\n🚀 Database seeding complete!');
  } catch (err) {
    console.error('\n❌ Seeding failed:', err.message);
    process.exit(1);
  }
}

seed();
