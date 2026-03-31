import { fetchAndStoreJobs } from '../services/job.service.js';
import { logger } from '../utils/logger.js';
import { DEFAULT_USER_ID } from '../../../shared/constants.js';

export async function runFetchWorker() {
  try {
    logger.info('[Worker:Fetch] Starting job fetch...');
    const result = await fetchAndStoreJobs(DEFAULT_USER_ID);
    logger.info('[Worker:Fetch] Complete', result);
  } catch (err) {
    logger.error('[Worker:Fetch] Failed', { error: err.message });
  }
}
