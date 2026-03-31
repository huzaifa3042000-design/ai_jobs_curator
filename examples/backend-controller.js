import { Router } from 'express';
import { getSomething, updateSomething } from '../db/queries.js';
import { DEFAULT_USER_ID } from '../../../shared/constants.js';

const router = Router();

// Pattern: Standard GET
router.get('/', async (req, res) => {
  try {
    const data = await getSomething(DEFAULT_USER_ID);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Pattern: Validated POST
router.post('/', async (req, res) => {
  try {
    const data = await updateSomething(DEFAULT_USER_ID, req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
