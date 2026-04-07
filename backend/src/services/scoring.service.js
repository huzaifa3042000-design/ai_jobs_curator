import { scoreJob } from './llm.service.js';
import { getUnscoredJobs, upsertJobScores, getSavedSearches } from '../db/queries.js';
import { logger } from '../utils/logger.js';
import { clamp } from '../utils/helpers.js';
import { DEFAULT_USER_ID } from '../../../shared/constants.js';

/**
 * Rule-based pre-scoring (fast, no LLM)
 */
function ruleBasedScore(job, preferences) {
  logger.debug(`Rule-based scoring job: ${job.id}`);
  let score = 50;
  const factors = [];

  // Skill match
  if (preferences?.skills?.length && job.skills?.length) {
    const jobSkillsLower = job.skills.map((s) => s.toLowerCase());
    const prefSkillsLower = preferences.skills.map((s) => s.toLowerCase());
    const matchCount = prefSkillsLower.filter((s) =>
      jobSkillsLower.some((js) => js.includes(s) || s.includes(js))
    ).length;
    const skillMatch = (matchCount / prefSkillsLower.length) * 100;
    score += (skillMatch - 50) * 0.3;
    factors.push(`Skill match: ${Math.round(skillMatch)}%`);
  }

  // Budget match
  if (preferences?.budget_min && job.budget_max) {
    if (job.budget_max >= preferences.budget_min) {
      score += 10;
      factors.push('Budget meets minimum');
    } else {
      score -= 15;
      factors.push('Budget below minimum');
    }
  }

  // Competition (fewer proposals = better)
  if (job.proposal_count <= 5) {
    score += 15;
    factors.push('Low competition');
  } else if (job.proposal_count <= 15) {
    score += 5;
  } else if (job.proposal_count >= 50) {
    score -= 15;
    factors.push('High competition');
  }

  // Client quality
  if (job.client_payment_verified) {
    score += 5;
  } else {
    score -= 10;
    factors.push('Unverified payment');
  }

  if (job.client_hires >= 10) {
    score += 10;
    factors.push('Experienced client');
  }

  if (job.client_rating && job.client_rating >= 4.5) {
    score += 5;
  }

  return { score: clamp(Math.round(score), 0, 100), factors };
}

/**
 * Score all unscored jobs for a user
 */
export async function scoreNewJobs(userId = DEFAULT_USER_ID, batchSize = 5) {
  const searches = await getSavedSearches(userId);
  
  if (!searches || searches.length === 0) {
    logger.info('No active searches to score for.');
    return 0;
  }

  let totalScored = 0;
  
  for (const search of searches) {
    const unscoredJobs = await getUnscoredJobs(search.id, batchSize);

    if (unscoredJobs.length === 0) {
      logger.info(`No unscored jobs found for search: ${search.name}, skipping...`);
      continue;
    }

    logger.info(`Scoring ${unscoredJobs.length} jobs for search: ${search.name}`);

    const scores = [];
    for (const job of unscoredJobs) {
      try {
        const llmScore = await scoreJob(job, search);
        const ruleScore = ruleBasedScore(job, search);

        const finalScore = Math.round(llmScore.score * 0.6 + ruleScore.score * 0.4);
        logger.debug(`Final score: ${finalScore}`);

        scores.push({
          job_id: job.id,
          user_id: userId,
          saved_search_id: search.id,
          score: finalScore,
          reasoning: llmScore.reasoning,
          risk_score: llmScore.risk_score,
          skill_match_score: llmScore.skill_match_score,
          budget_match_score: llmScore.budget_match_score,
          client_quality_score: llmScore.client_quality_score,
          computed_at: new Date().toISOString(),
        });
      } catch (err) {
        logger.error(`Failed to score job ${job.id}`, { error: err.message });
      }
    }

    if (scores.length > 0) {
      await upsertJobScores(scores);
      totalScored += scores.length;
    }
  }

  logger.debug(`Scored ${totalScored} jobs for ${searches.length} searches`);
  return totalScored;
}
