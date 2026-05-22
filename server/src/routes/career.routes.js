const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { askCareerAssistant } = require('../services/career.service');

// POST /api/career/query
router.post('/query', authenticate, authorize('STUDENT'), async (req, res) => {
  try {
    const { prompt } = req.body;
    const answer = await askCareerAssistant({ prompt, student: req.user });
    res.json({ answer });
  } catch (err) {
    console.error('Career assistant error:', err);
    res.status(500).json({ error: err.message || 'Failed to process career assistant request' });
  }
});

module.exports = router;
