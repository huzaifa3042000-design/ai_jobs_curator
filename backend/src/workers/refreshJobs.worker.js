import { cleanupStaleJobs } from '../db/queries.js';
import { logger } from '../utils/logger.js';

export async function runRefreshWorker() {
  try {
    logger.info('[Worker:Refresh] Cleaning up stale jobs...');
    const cleaned = await cleanupStaleJobs(48);
    logger.info(`[Worker:Refresh] Marked ${cleaned} jobs as inactive`);
  } catch (err) {
    logger.error('[Worker:Refresh] Failed', { error: err.message });
  }
}
