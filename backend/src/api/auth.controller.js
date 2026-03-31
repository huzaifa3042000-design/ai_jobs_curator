import { Router } from 'express';
import { getAuthUrl, exchangeCodeForToken, getTokens } from '../services/upwork.service.js';
import { DEFAULT_USER_ID } from '../../../shared/constants.js';

const router = Router();

// GET /api/auth/url — Get Upwork OAuth URL
router.get('/url', (req, res) => {
  const url = getAuthUrl();
  res.json({ url });
});

// GET /api/auth/callback — Handle OAuth callback
router.get('/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).json({ error: 'Missing authorization code' });

    const result = await exchangeCodeForToken(code);
    if (result.access_token) {
      res.json({ success: true, message: 'Authentication successful. You can close this window.' });
    } else {
      res.status(400).json({ error: 'Failed to obtain access token', details: result });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/me — Current user info
router.get('/me', (req, res) => {
  const tokens = getTokens();
  res.json({
    user_id: DEFAULT_USER_ID,
    authenticated: !!tokens.accessToken,
    hasRefreshToken: !!tokens.refreshToken,
  });
});

export default router;
