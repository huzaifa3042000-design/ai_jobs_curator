import { fetchAndStoreJobs } from '../services/job.service.js';
import { scoreNewJobs } from '../services/scoring.service.js';
import { logger } from '../utils/logger.js';
import { DEFAULT_USER_ID } from '../../../shared/constants.js';

export async function runFetchWorker() {
  try {
    logger.info('[Worker:FetchAndScore] Starting job fetch...');
    const result = await fetchAndStoreJobs(DEFAULT_USER_ID);
    logger.info('[Worker:FetchAndScore] Complete', result);
  } catch (err) {
    logger.error('[Worker:FetchAndScore] Failed', { error: err.message });
  }
  
  try {
    logger.info('[Worker:FetchAndScore] Starting job scoring...');
    const scored = await scoreNewJobs(DEFAULT_USER_ID, 5);
    logger.info(`[Worker:FetchAndScore] Scored ${scored} jobs`);
  } catch (err) {
    logger.error('Worker:FetchAndScore Failed', { error: err.message });
  }
}
