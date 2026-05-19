const router = require('express').Router();
const { MentorshipRequest } = require('../models/index');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { checkWeeklyLimit } = require('../utils/antiSpam');

const WEEKLY_LIMIT = 3;

// POST /api/mentorship — student sends request
router.post('/', authenticate, authorize('STUDENT'), async (req, res) => {
  try {
    const { receiverId, topic, message } = req.body;
    if (!receiverId || !topic || !message)
      return res.status(400).json({ error: 'receiverId, topic, and message required' });

    // Anti-spam
    const { exceeded } = await checkWeeklyLimit(MentorshipRequest, req.user._id, WEEKLY_LIMIT);
    if (exceeded)
      return res.status(429).json({ error: `Max ${WEEKLY_LIMIT} mentorship requests per week` });

    // No duplicate active request
    const exists = await MentorshipRequest.findOne({
      sender: req.user._id, receiver: receiverId, status: { $in: ['PENDING', 'ACCEPTED'] },
    });
    if (exists) return res.status(409).json({ error: 'Active request already exists with this mentor' });

    const request = await MentorshipRequest.create({
      sender: req.user._id, receiver: receiverId, topic, message,
    });

    // Notify alumni
    const alumni = await User.findById(receiverId);
    if (alumni) {
      await alumni.pushNotification({
        type: 'MENTORSHIP_REQUEST',
        title: 'New mentorship request',
        body: `${req.user.name} wants mentorship on: ${topic}`,
        link: `/mentorship/received`,
      });
    }

    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/mentorship/received — alumni sees incoming requests
router.get('/received', authenticate, authorize('ALUMNI'), async (req, res) => {
  try {
    const requests = await MentorshipRequest.find({ receiver: req.user._id })
      .populate('sender', 'name email avatarUrl studentProfile')
      .sort('-createdAt');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/mentorship/sent — student sees sent requests
router.get('/sent', authenticate, authorize('STUDENT'), async (req, res) => {
  try {
    const requests = await MentorshipRequest.find({ sender: req.user._id })
      .populate('receiver', 'name email avatarUrl alumniProfile')
      .sort('-createdAt');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/mentorship/:id — alumni responds
router.patch('/:id', authenticate, authorize('ALUMNI'), async (req, res) => {
  try {
    const { status, responseNote } = req.body;
    if (!['ACCEPTED', 'DECLINED', 'COMPLETED'].includes(status))
      return res.status(400).json({ error: 'Invalid status' });

    const request = await MentorshipRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Not found' });
    if (!request.receiver.equals(req.user._id)) return res.status(403).json({ error: 'Forbidden' });

    request.status = status;
    request.responseNote = responseNote;
    await request.save();

    // Notify student
    const student = await User.findById(request.sender);
    if (student) {
      await student.pushNotification({
        type: 'MENTORSHIP_REQUEST',
        title: `Mentorship request ${status.toLowerCase()}`,
        body: responseNote || `Your request was ${status.toLowerCase()}`,
        link: '/mentorship/sent',
      });
    }

    // Reputation +5 on COMPLETED
    if (status === 'COMPLETED') {
      await User.updateOne(
        { _id: req.user._id },
        { $inc: { 'alumniProfile.reputationScore': 5 } }
      );
    }

    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;