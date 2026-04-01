import { Router } from 'express';
import { getSavedSearches, upsertSavedSearch, deleteSavedSearch } from '../db/queries.js';
import { validatePreferences } from '../../../shared/schemas.js';
import { DEFAULT_USER_ID } from '../../../shared/constants.js';
import { improveSkillsWithAI } from '../services/llm.service.js';

const router = Router();

// GET /api/searches
router.get('/', async (req, res) => {
  try {
    const searches = await getSavedSearches(DEFAULT_USER_ID);
    res.json(searches || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/searches
router.post('/', async (req, res) => {
  try {
    // We can still use validatePreferences to check the preference fields
    const validation = validatePreferences(req.body);
    if (!validation.valid) {
      return res.status(400).json({ errors: validation.errors });
    }
    
    if (!req.body.name || req.body.name.trim() === '') {
      return res.status(400).json({ errors: ['Name is required for a saved search'] });
    }

    const search = await upsertSavedSearch(DEFAULT_USER_ID, req.body);
    res.json(search);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/searches/:id
router.delete('/:id', async (req, res) => {
  try {
    await deleteSavedSearch(DEFAULT_USER_ID, req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/searches/improve-skills
router.post('/improve-skills', async (req, res) => {
  try {
    const { profileName, currentSkills } = req.body;

    // Basic validation
    if (!profileName || profileName.trim() === '') {
      return res.status(400).json({ error: 'profileName is required' });
    }

    const skillsArray = Array.isArray(currentSkills) ? currentSkills : [];

    const result = await improveSkillsWithAI(profileName, skillsArray);

    res.json(result);
  } catch (err) {
    console.error('Improve skills endpoint failed:', err);
    res.status(500).json({ error: 'Failed to improve skills' });
  }
});

export default router;
