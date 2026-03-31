import { searchJobs } from './upwork.service.js';
import { upsertJobs, getSavedSearches, getJobById } from '../db/queries.js';
import { scoreNewJobs } from './scoring.service.js';
import { logger } from '../utils/logger.js';
import { DEFAULT_USER_ID } from '../../../shared/constants.js';

/**
 * Fetch jobs from Upwork based on user preferences, store in DB
 */
export async function fetchAndStoreJobs(userId = DEFAULT_USER_ID) {
  const searches = await getSavedSearches(userId);

  if (!searches || searches.length === 0) {
    logger.warn('No saved searches found. Skipping fetch.');
    return { fetched: 0, totalAvailable: 0 };
  }

  let totalFetched = 0;
  for (const search of searches) {
    logger.info(`Fetching jobs for search: ${search.name}`);
    const { jobs, totalCount } = await searchJobs(search);
    if (jobs.length > 0) {
      await upsertJobs(jobs);
      totalFetched += jobs.length;
    }
  }

  return { fetched: totalFetched };
}

/**
 * Refresh a single job (re-fetch from Upwork is not available for single jobs via search)
 * Instead, we re-score it
 */
export async function refreshJob(jobId, userId = DEFAULT_USER_ID, searchId) {
  const job = await getJobById(jobId, userId, searchId);
  if (!job) throw new Error('Job not found');

  // Re-score the job
  const searches = await getSavedSearches(userId);
  const search = searches.find(s => s.id === searchId);
  if (!search) throw new Error('Search not found');

  const { scoreJob } = await import('./llm.service.js');
  const llmScore = await scoreJob(job, search);

  const { upsertJobScores } = await import('../db/queries.js');
  await upsertJobScores([{
    job_id: jobId,
    user_id: userId,
    saved_search_id: searchId,
    ...llmScore,
    computed_at: new Date().toISOString(),
  }]);

  return await getJobById(jobId, userId, searchId);
}

/**
 * Full pipeline: fetch → store → score
 */
export async function runFullPipeline(userId = DEFAULT_USER_ID) {
  logger.info('Starting full pipeline...');
  const fetchResult = await fetchAndStoreJobs(userId);
  const scored = await scoreNewJobs(userId);
  logger.info('Pipeline complete', { ...fetchResult, scored });
  return { ...fetchResult, scored };
}
