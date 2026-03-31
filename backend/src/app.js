import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cron from 'node-cron';
import dotenv from 'dotenv';

dotenv.config();

import routes from './routes/index.js';
import { runFetchWorker } from './workers/fetchJobs.worker.js';
import { runScoreWorker } from './workers/scoreJobs.worker.js';
import { runRefreshWorker } from './workers/refreshJobs.worker.js';
import { logger } from './utils/logger.js';

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }));
app.use(morgan('dev'));
app.use(express.json());

// ── Routes ───────────────────────────────────────────────────────
app.use('/api', routes);

// ── Background Workers ───────────────────────────────────────────
// Fetch jobs every 10 minutes
cron.schedule('*/10 * * * *', () => {
  logger.info('Cron: Triggering job fetch');
  runFetchWorker();
});

// Score unscored jobs every 5 minutes
cron.schedule('*/5 * * * *', () => {
  logger.info('Cron: Triggering job scoring');
  runScoreWorker();
});

// Cleanup stale jobs every 30 minutes
cron.schedule('*/30 * * * *', () => {
  logger.info('Cron: Triggering cleanup');
  runRefreshWorker();
});

// ── Start ────────────────────────────────────────────────────────
app.listen(PORT, () => {
  logger.info(`Backend server running on http://localhost:${PORT}`);
  logger.info('Workers scheduled: fetch@10min, score@5min, cleanup@30min');
});

export default app;
