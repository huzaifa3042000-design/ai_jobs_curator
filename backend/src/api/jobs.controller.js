import { Router } from 'express';
import { getJobs, getJobById, getStats } from '../db/queries.js';
import { fetchAndStoreJobs, refreshJob, runFullPipeline } from '../services/job.service.js';
import { scoreNewJobs } from '../services/scoring.service.js';
import { generateProposal } from '../services/llm.service.js';
import { getSavedSearches } from '../db/queries.js';
import { DEFAULT_USER_ID } from '../../../shared/constants.js';

const router = Router();

// GET /api/jobs — Paginated job list with scores
router.get('/', async (req, res) => {
  try {
    const sort = req.query.sort || 'score';
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = parseInt(req.query.offset) || 0;
    const searchId = req.query.searchId;

    if (!searchId) {
      return res.status(400).json({ error: 'searchId is required' });
    }

    const jobs = await getJobs({ sort, limit, offset, userId: DEFAULT_USER_ID, searchId });
    const stats = await getStats(DEFAULT_USER_ID);

    res.json({ jobs, stats, pagination: { limit, offset, sort, searchId } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/jobs/stats — Curator stats
router.get('/stats', async (req, res) => {
  try {
    const stats = await getStats(DEFAULT_USER_ID);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/jobs/:id — Single job with full details
router.get('/:id', async (req, res) => {
  try {
    const searchId = req.query.searchId;
    const job = await getJobById(req.params.id, DEFAULT_USER_ID, searchId);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/jobs/fetch — Manually trigger Upwork fetch
router.post('/fetch', async (req, res) => {
  try {
    const result = await fetchAndStoreJobs(DEFAULT_USER_ID);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/jobs/score — Manually trigger scoring
router.post('/score', async (req, res) => {
  try {
    const batchSize = parseInt(req.query.batch) || 5;
    const scored = await scoreNewJobs(DEFAULT_USER_ID, batchSize);
    res.json({ scored });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/jobs/pipeline — Run full fetch + score pipeline
router.post('/pipeline', async (req, res) => {
  try {
    const result = await runFullPipeline(DEFAULT_USER_ID);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/jobs/:id/refresh — Refresh and re-score a single job
router.post('/:id/refresh', async (req, res) => {
  try {
    const searchId = req.body.searchId;
    if (!searchId) return res.status(400).json({ error: 'searchId is required to rescore a job' });
    const job = await refreshJob(req.params.id, DEFAULT_USER_ID, searchId);
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/jobs/:id/proposal — Generate AI proposal
router.post('/:id/proposal', async (req, res) => {
  try {
    const searchId = req.body.searchId;
    const job = await getJobById(req.params.id, DEFAULT_USER_ID, searchId);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    // For proposal generation, grab the specific saved search to pass its instructions
    const searches = await getSavedSearches(DEFAULT_USER_ID);
    const preferences = searches.find(s => s.id === searchId);
    
    if (!preferences) return res.status(404).json({ error: 'Search preferences not found' });

    const proposal = await generateProposal(job, preferences);
    res.json({ proposal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
