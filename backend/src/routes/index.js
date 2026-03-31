import { Router } from 'express';
import authRoutes from '../api/auth.controller.js';
import searchesRoutes from '../api/searches.controller.js';
import jobsRoutes from '../api/jobs.controller.js';
import feedbackRoutes from '../api/feedback.controller.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/searches', searchesRoutes);
router.use('/jobs', jobsRoutes);
router.use('/jobs', feedbackRoutes); // POST /api/jobs/:id/feedback

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
