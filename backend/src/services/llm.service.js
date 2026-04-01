import { logger } from '../utils/logger.js';
import { OPENROUTER_API_URL } from '../../../shared/constants.js';

const MODEL = process.env.OPENROUTER_MODEL || 'google/gemini-2.0-flash-001';

async function callOpenRouter(messages, options = {}) {
  const res = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://editorial-intelligence.app',
      'X-OpenRouter-Title': 'Editorial Intelligence',
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: options.temperature ?? 0.3,
      max_tokens: options.maxTokens ?? 2000,
      response_format: options.responseFormat,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    logger.error('OpenRouter API error', { status: res.status, body: err });
    throw new Error(`OpenRouter error: ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

// ── Score a Job ──────────────────────────────────────────────────

export async function scoreJob(job, preferences) {
  const systemPrompt = `You are an expert freelancer career advisor analyzing Upwork job postings.
You will evaluate a job posting against a freelancer's preferences and return a JSON assessment.

SCORING CRITERIA:
- skill_match_score (0-100): How well the job's required skills match the freelancer's skills
- budget_match_score (0-100): How well the budget/rate fits the freelancer's range
- client_quality_score (0-100): Client reliability based on payment verification, hire history, rating, total spent
- score (0-100): Overall fit score combining all factors with preference weights
- risk_score (0-100): Risk of scam/low-quality (100 = very risky). Look for: unverified payment, new accounts, vague descriptions, unrealistic budgets, too many proposals quickly
- reasoning: 2-3 sentence explanation of the score

WEIGHT PREFERENCES (1=low priority, 3=high priority):
- High Budget Priority: ${preferences?.weight_high_budget || 1}
- Low Competition Priority: ${preferences?.weight_low_competition || 1}
- Client Quality Priority: ${preferences?.weight_client_quality || 1}
- Long Term Priority: ${preferences?.weight_long_term || 1}

Risk Tolerance: ${preferences?.risk_tolerance || 2} (1=conservative, 2=balanced, 3=aggressive)

Respond ONLY with valid JSON, no markdown.`;

  const userPrompt = `FREELANCER PREFERENCES:
Skills: ${(preferences?.skills || []).join(', ') || 'Not specified'}
Budget Range: $${preferences?.budget_min || 0} - $${preferences?.budget_max || '∞'}
Hourly Rate: $${preferences?.hourly_rate_min || 0} - $${preferences?.hourly_rate_max || '∞'}/hr
Experience Level: ${preferences?.experience_level || 'Any'}
Instructions: ${preferences?.instructions || 'None'}

JOB POSTING:
Title: ${job.title}
Description: ${job.description?.slice(0, 2000) || 'No description'}
Job Type: ${job.job_type || 'Unknown'}
Budget: $${job.budget_min || 0} - $${job.budget_max || 'Not specified'}
Hourly Rate: $${job.hourly_min || 0} - $${job.hourly_max || 'Not specified'}/hr
Required Skills: ${(job.skills || []).join(', ') || 'Not specified'}
Experience Level: ${job.experience_level || 'Not specified'}
Proposals: ${job.proposal_count || 0}
Client Country: ${job.client_country || 'Unknown'}
Client Rating: ${job.client_rating || 'No rating'}
Client Hires: ${job.client_hires || 0}
Client Total Spent: ${job.client_total_spent || 'Unknown'}
Payment Verified: ${job.client_payment_verified ? 'Yes' : 'No'}
Duration: ${job.duration || 'Not specified'}
Posted: ${job.posted_at || 'Unknown'}

Return JSON: {"score", "skill_match_score", "budget_match_score", "client_quality_score", "risk_score", "reasoning"}`;

  try {
    const response = await callOpenRouter(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      { temperature: 0.2, maxTokens: 500 }
    );

    // Parse JSON from response
    const jsonStr = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(jsonStr);

    return {
      score: Math.round(Number(parsed.score) || 50),
      skill_match_score: Math.round(Number(parsed.skill_match_score) || 50),
      budget_match_score: Math.round(Number(parsed.budget_match_score) || 50),
      client_quality_score: Math.round(Number(parsed.client_quality_score) || 50),
      risk_score: Math.round(Number(parsed.risk_score) || 30),
      reasoning: parsed.reasoning || 'Unable to generate reasoning.',
    };
  } catch (err) {
    logger.error('LLM scoring failed', { jobId: job.id, error: err.message });
    return {
      score: 50,
      skill_match_score: 50,
      budget_match_score: 50,
      client_quality_score: 50,
      risk_score: 50,
      reasoning: 'Scoring temporarily unavailable.',
    };
  }
}

// ── Generate Proposal ────────────────────────────────────────────

export async function generateProposal(job, preferences) {
  const systemPrompt = `You are an expert freelance proposal writer. Write a compelling, personalized Upwork proposal.

RULES:
- Keep it under 200 words
- Start with a personalized hook referencing the specific project
- Highlight 2-3 relevant skills/experiences
- Show understanding of the client's needs
- End with a clear call to action
- Be professional but warm
- Do NOT use generic templates
- Use [Your Name] as the sign-off name placeholder`;

  const userPrompt = `Write a proposal for this job:

Title: ${job.title}
Description: ${job.description?.slice(0, 2000) || 'No description'}
Required Skills: ${(job.skills || []).join(', ')}

Freelancer's Skills: ${(preferences?.skills || []).join(', ')}
Freelancer's Instructions: ${preferences?.instructions || 'None'}`;

  const response = await callOpenRouter(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    { temperature: 0.7, maxTokens: 800 }
  );

  return response;
}

// ── Improve Skills with AI ───────────────────────────────────────
 
export async function improveSkillsWithAI(profileName,currentSkills = []) {
  const systemPrompt = `You are an expert in freelance skill optimization.

Your task is to IMPROVE and SLIGHTLY EXPAND a given set of skills.

STRICT RULES:
- Stay within the SAME DOMAIN as the provided skills
- You may:
  • Refine wording (e.g., "react" → "React.js")
  • Expand into closely related skills (e.g., "React" → "React Hooks", "Redux")
  • Add adjacent tools/frameworks that are commonly used TOGETHER
- DO NOT introduce unrelated fields or technologies
- DO NOT change career direction
- All suggestions must logically follow from the existing skills

SCOPE GUIDELINE:
- If input is frontend → stay frontend
- If input is backend → stay backend
- If input is data → stay data
- Never cross domains unless it's naturally connected

GOOD:
Input: ["react", "javascript"]
Output: ["React.js", "React Hooks", "Redux", "Modern JavaScript (ES6+)"]

BAD:
Input: ["react"]
Output: ["Python", "Machine Learning"] ❌

Return ONLY valid JSON.`;

  const userPrompt = `Current Skills:
${currentSkills.length > 0 ? currentSkills.join(', ') : 'None'}

Return:
{
  "suggestedSkills": ["skill1", "skill2", "skill3"]
}`;

  try {
    const response = await callOpenRouter(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      { temperature: 0.4, // lower = more controlled
        maxTokens: 300 }
    );

    logger.info('AI Response', { response });

    const jsonStr = response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const parsed = JSON.parse(jsonStr);

    return {
      suggestedSkills: Array.isArray(parsed.suggestedSkills)
        ? parsed.suggestedSkills
        : [],
    };
  } catch (err) {
    logger.error('Skill improvement failed', {
      error: err.message,
      currentSkills,
    });

    return {
      suggestedSkills: [],
    };
  }
}
