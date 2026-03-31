import { Router } from 'express';
import { addFeedback } from '../db/queries.js';
import { validateFeedback } from '../../../shared/schemas.js';
import { DEFAULT_USER_ID } from '../../../shared/constants.js';

const router = Router();

// POST /api/jobs/:id/feedback
router.post('/:id/feedback', async (req, res) => {
  try {
    const validation = validateFeedback(req.body);
    if (!validation.valid) {
      return res.status(400).json({ errors: validation.errors });
    }

    const { feedback, note } = req.body;
    const result = await addFeedback(DEFAULT_USER_ID, req.params.id, feedback, note || null);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
