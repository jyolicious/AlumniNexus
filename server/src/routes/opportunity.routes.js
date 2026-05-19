const router = require('express').Router();
const { Opportunity, Application } = require('../models/index');
const { authenticate, authorize, requireVerified } = require('../middleware/auth.middleware');

// GET /api/opportunities — list active opportunities
router.get('/', authenticate, async (req, res) => {
  try {
    const { type, domain } = req.query;
    const filter = { isActive: true };
    if (type)   filter.type   = type;
    if (domain) filter.domain = domain;

    const opps = await Opportunity.find(filter)
      .populate('postedBy', 'name email avatarUrl')
      .sort('-createdAt');
    res.json(opps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/opportunities — alumni posts opportunity
router.post('/', authenticate, authorize('ALUMNI'), requireVerified, async (req, res) => {
  try {
    const { type, title, description, company, location, domain, deadline, slots } = req.body;
    if (!type || !title || !description)
      return res.status(400).json({ error: 'type, title, description required' });

    const opp = await Opportunity.create({
      postedBy: req.user._id,
      type, title, description, company,
      location, domain, slots,
      deadline: deadline ? new Date(deadline) : undefined,
    });
    await opp.populate('postedBy', 'name email avatarUrl');
    res.status(201).json(opp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/opportunities/:id/apply — student applies
router.post('/:id/apply', authenticate, authorize('STUDENT'), async (req, res) => {
  try {
    const { coverNote, resumeUrl } = req.body;

    const opp = await Opportunity.findById(req.params.id);
    if (!opp || !opp.isActive)
      return res.status(404).json({ error: 'Opportunity not found or closed' });

    const existing = await Application.findOne({
      opportunity: req.params.id,
      applicant: req.user._id,
    });
    if (existing) return res.status(409).json({ error: 'Already applied' });

    const app = await Application.create({
      opportunity: req.params.id,
      applicant: req.user._id,
      coverNote, resumeUrl,
    });
    res.status(201).json(app);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/opportunities/my — alumni sees their own postings
router.get('/my', authenticate, authorize('ALUMNI'), async (req, res) => {
  try {
    const opps = await Opportunity.find({ postedBy: req.user._id }).sort('-createdAt');
    res.json(opps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/opportunities/:id — alumni closes/edits
router.patch('/:id', authenticate, authorize('ALUMNI'), async (req, res) => {
  try {
    const opp = await Opportunity.findById(req.params.id);
    if (!opp) return res.status(404).json({ error: 'Not found' });
    if (!opp.postedBy.equals(req.user._id)) return res.status(403).json({ error: 'Forbidden' });

    Object.assign(opp, req.body);
    await opp.save();
    res.json(opp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;