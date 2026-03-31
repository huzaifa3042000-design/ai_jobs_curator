import { scoreNewJobs } from '../services/scoring.service.js';
import { logger } from '../utils/logger.js';
import { DEFAULT_USER_ID } from '../../../shared/constants.js';

export async function runScoreWorker() {
  try {
    logger.info('[Worker:Score] Starting job scoring...');
    const scored = await scoreNewJobs(DEFAULT_USER_ID, 5);
    logger.info(`[Worker:Score] Scored ${scored} jobs`);
  } catch (err) {
    logger.error('[Worker:Score] Failed', { error: err.message });
  }
}
