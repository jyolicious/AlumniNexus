const router = require('express').Router();
const { ReferralRequest } = require('../models/index');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { checkWeeklyLimit } = require('../utils/antiSpam');

const WEEKLY_LIMIT = 2;

// POST /api/referrals — student requests a referral
router.post('/', authenticate, authorize('STUDENT'), async (req, res) => {
  try {
    const { receiverId, company, role, message, resumeUrl } = req.body;
    if (!receiverId || !company || !role || !message)
      return res.status(400).json({ error: 'receiverId, company, role, message required' });

    const { exceeded } = await checkWeeklyLimit(ReferralRequest, req.user._id, WEEKLY_LIMIT);
    if (exceeded)
      return res.status(429).json({ error: `Max ${WEEKLY_LIMIT} referral requests per week` });

    const request = await ReferralRequest.create({
      sender: req.user._id, receiver: receiverId,
      company, role, message, resumeUrl,
    });

    // Notify alumni
    const alumni = await User.findById(receiverId);
    if (alumni) {
      await alumni.pushNotification({
        type: 'REFERRAL_REQUEST',
        title: 'New referral request',
        body: `${req.user.name} is asking for a referral at ${company}`,
        link: '/referrals/received',
      });
    }

    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/referrals/sent — student's sent requests
router.get('/sent', authenticate, authorize('STUDENT'), async (req, res) => {
  try {
    const requests = await ReferralRequest.find({ sender: req.user._id })
      .populate('receiver', 'name email avatarUrl alumniProfile')
      .sort('-createdAt');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/referrals/received — alumni's incoming requests
router.get('/received', authenticate, authorize('ALUMNI'), async (req, res) => {
  try {
    const requests = await ReferralRequest.find({ receiver: req.user._id })
      .populate('sender', 'name email avatarUrl studentProfile')
      .sort('-createdAt');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/referrals/:id — alumni responds
router.patch('/:id', authenticate, authorize('ALUMNI'), async (req, res) => {
  try {
    const { status, responseNote } = req.body;
    if (!['APPROVED', 'DECLINED', 'GUIDED'].includes(status))
      return res.status(400).json({ error: 'Invalid status' });

    const request = await ReferralRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Not found' });
    if (!request.receiver.equals(req.user._id)) return res.status(403).json({ error: 'Forbidden' });

    request.status = status;
    request.responseNote = responseNote;
    await request.save();

    // Notify student
    const student = await User.findById(request.sender);
    if (student) {
      await student.pushNotification({
        type: 'REFERRAL_REQUEST',
        title: `Referral ${status.toLowerCase()}`,
        body: responseNote || `Your referral request at ${request.company} was ${status.toLowerCase()}`,
        link: '/referrals/sent',
      });
    }

    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;