const router = require('express').Router();
const { LiveSession } = require('../models/index');
const { authenticate, authorize, requireVerified } = require('../middleware/auth.middleware');
const { generateLiveKitToken } = require('../services/livekit.service');

// Random 6-char alphanumeric code
const genCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

// POST /api/sessions — alumni creates session
router.post('/', authenticate, authorize('ALUMNI'), requireVerified, async (req, res) => {
  try {
    const { title, description, topic, joinPassword, slots, scheduledAt, duration } = req.body;
    if (!title || !topic || !joinPassword || !scheduledAt)
      return res.status(400).json({ error: 'title, topic, joinPassword, scheduledAt required' });

    // Unique join code + LiveKit room name
    let joinCode, tries = 0;
    do {
      joinCode = genCode();
      tries++;
    } while ((await LiveSession.findOne({ joinCode })) && tries < 10);

    const roomName = `LIVEKIT-${joinCode}`;
    const session = await LiveSession.create({
      host: req.user._id,
      title, description, topic,
      joinCode, roomName, joinPassword,
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
    let sessions = await LiveSession.find({ status: { $in: ['UPCOMING', 'LIVE'] } })
      .populate('host', 'name avatarUrl alumniProfile');

    // Sort: LIVE first, then UPCOMING by scheduledAt ascending
    sessions = sessions.sort((a, b) => {
      if (a.status === b.status) return new Date(a.scheduledAt) - new Date(b.scheduledAt);
      if (a.status === 'LIVE') return -1;
      if (b.status === 'LIVE') return 1;
      return 0;
    });

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

    const alreadyJoined = session.attendees.some(att => att.equals(req.user._id));
    if (!alreadyJoined && session.attendees.length >= session.slots) return res.status(409).json({ error: 'Session is full' });

    if (!alreadyJoined) {
      session.attendees.push(req.user._id);
    }

    const openAttendance = session.attendance.find(a => a.user.equals(req.user._id) && !a.leftAt);
    if (!openAttendance) {
      session.attendance.push({ user: req.user._id, joinedAt: new Date() });
    }

    await session.save();

    const token = await generateLiveKitToken({
      identity: req.user._id.toString(),
      name: req.user.name,
      room: session.roomName,
    });

    res.json({
      session,
      serverUrl: process.env.LIVEKIT_URL,
      token,
      roomName: session.roomName,
    });
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
    let sessions = await LiveSession.find({ host: req.user._id });
    // Sort host sessions: LIVE first, then upcoming by scheduledAt
    sessions = sessions.sort((a, b) => {
      if (a.status === b.status) return new Date(a.scheduledAt) - new Date(b.scheduledAt);
      if (a.status === 'LIVE') return -1;
      if (b.status === 'LIVE') return 1;
      return 0;
    });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/sessions/:id/attendance — download attendance CSV (host only)
router.get('/:id/attendance', authenticate, authorize('ALUMNI'), async (req, res) => {
  try {
    const session = await LiveSession.findById(req.params.id).populate('attendance.user', 'name email');
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (!session.host.equals(req.user._id)) return res.status(403).json({ error: 'Forbidden' });

    // Build CSV
    const rows = [];
    rows.push(['Name', 'Email', 'JoinedAt', 'LeftAt']);
    session.attendance.forEach(a => {
      const name = a.user?.name || '';
      const email = a.user?.email || '';
      const joined = a.joinedAt ? new Date(a.joinedAt).toISOString() : '';
      const left = a.leftAt ? new Date(a.leftAt).toISOString() : '';
      rows.push([name, email, joined, left]);
    });

    const csv = rows.map(r => r.map(c => '"' + String(c || '').replace(/"/g, '""') + '"').join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="attendance-${session.joinCode || req.params.id}.csv"`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;