const router = require('express').Router();
const { LiveSession } = require('../models/index');
const { authenticate, authorize, requireVerified } = require('../middleware/auth.middleware');

// Random 6-char alphanumeric code
const genCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

// POST /api/sessions — alumni creates session
router.post('/', authenticate, authorize('ALUMNI'), requireVerified, async (req, res) => {
  try {
    const { title, description, topic, meetUrl, joinPassword, slots, scheduledAt, duration } = req.body;
    if (!title || !topic || !meetUrl || !joinPassword || !scheduledAt)
      return res.status(400).json({ error: 'title, topic, meetUrl, joinPassword, scheduledAt required' });

    // Unique join code
    let joinCode, tries = 0;
    do {
      joinCode = genCode();
      tries++;
    } while ((await LiveSession.findOne({ joinCode })) && tries < 10);

    const session = await LiveSession.create({
      host: req.user._id,
      title, description, topic, meetUrl,
      joinCode, joinPassword,
      slots: slots || 50,
      scheduledAt: new Date(scheduledAt),
      duration: duration || 60,
    });

    await session.populate('host', 'name email avatarUrl alumniProfile');
    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/sessions — list upcoming and live sessions
router.get('/', authenticate, async (req, res) => {
  try {
    const sessions = await LiveSession.find({ status: { $in: ['UPCOMING', 'LIVE'] } })
      .populate('host', 'name avatarUrl alumniProfile')
      .sort('scheduledAt');
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/sessions/join — join with code + password
router.post('/join', authenticate, async (req, res) => {
  try {
    const { joinCode, joinPassword } = req.body;
    if (!joinCode || !joinPassword)
      return res.status(400).json({ error: 'joinCode and joinPassword required' });

    const session = await LiveSession.findOne({ joinCode: joinCode.toUpperCase() })
      .populate('host', 'name avatarUrl');

    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.status === 'ENDED') return res.status(410).json({ error: 'Session has ended' });
    if (session.joinPassword !== joinPassword) return res.status(401).json({ error: 'Wrong password' });
    if (session.attendees.length >= session.slots) return res.status(409).json({ error: 'Session is full' });

    // Add attendee (idempotent)
    if (!session.attendees.includes(req.user._id)) {
      session.attendees.push(req.user._id);
      await session.save();
    }

    res.json({ session, meetUrl: session.meetUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/sessions/:id/status — host updates LIVE / ENDED
router.patch('/:id/status', authenticate, authorize('ALUMNI'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['LIVE', 'ENDED'].includes(status))
      return res.status(400).json({ error: 'status must be LIVE or ENDED' });

    const session = await LiveSession.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Not found' });
    if (!session.host.equals(req.user._id)) return res.status(403).json({ error: 'Forbidden' });

    session.status = status;
    await session.save();
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/sessions/my — alumni's own sessions
router.get('/my', authenticate, authorize('ALUMNI'), async (req, res) => {
  try {
    const sessions = await LiveSession.find({ host: req.user._id }).sort('-scheduledAt');
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;