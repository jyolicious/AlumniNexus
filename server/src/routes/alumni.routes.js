const router = require('express').Router();
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// GET /api/alumni — search all approved alumni
router.get('/', authenticate, async (req, res) => {
  try {
    const { department, industry, isOpenToMentor, search } = req.query;

    const filter = {
      role: 'ALUMNI',
      'alumniProfile.verifyStatus': 'APPROVED',
    };

    if (department) filter['alumniProfile.department'] = department;
    if (industry)   filter['alumniProfile.industry']   = industry;
    if (isOpenToMentor === 'true') filter['alumniProfile.isOpenToMentor'] = true;

    let users = await User.find(filter)
      .select('name email avatarUrl alumniProfile')
      .sort({ 'alumniProfile.reputationScore': -1 });

    // Search filter (name, role, org, skills)
    if (search) {
      const q = search.toLowerCase();
      users = users.filter(u =>
        u.name?.toLowerCase().includes(q) ||
        u.alumniProfile?.currentRole?.toLowerCase().includes(q) ||
        u.alumniProfile?.currentOrg?.toLowerCase().includes(q) ||
        u.alumniProfile?.skills?.some(s => s.toLowerCase().includes(q))
      );
    }

    // Shape response so frontend gets user info alongside profile
    const result = users.map(u => ({
      _id: u.alumniProfile?._id || u._id,
      user: { _id: u._id, name: u.name, email: u.email, avatarUrl: u.avatarUrl },
      ...u.alumniProfile?.toObject(),
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/alumni/me/profile — alumni views own profile
router.get('/me/profile', authenticate, authorize('ALUMNI'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('alumniProfile');
    res.json(user?.alumniProfile || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/alumni/:userId — single alumni profile
router.get('/:userId', authenticate, async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.userId,
      role: 'ALUMNI',
      'alumniProfile.verifyStatus': 'APPROVED',
    }).select('name email avatarUrl alumniProfile');

    if (!user) return res.status(404).json({ error: 'Alumni not found' });
    res.json({
      user: { _id: user._id, name: user.name, email: user.email, avatarUrl: user.avatarUrl },
      ...user.alumniProfile?.toObject(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/alumni/profile — alumni creates or updates profile
router.post('/profile', authenticate, authorize('ALUMNI'), async (req, res) => {
  try {
    const {
      department, graduationYear, degree,
      currentRole, currentOrg, industry, location,
      isStartupFounder, startupName, bio, skills,
      linkedinUrl, isOpenToMentor,
    } = req.body;

    const update = {
      'alumniProfile.department':      department,
      'alumniProfile.graduationYear':  Number(graduationYear),
      'alumniProfile.degree':          degree || 'B.Tech',
      'alumniProfile.currentRole':     currentRole,
      'alumniProfile.currentOrg':      currentOrg,
      'alumniProfile.industry':        industry,
      'alumniProfile.location':        location,
      'alumniProfile.isStartupFounder':Boolean(isStartupFounder),
      'alumniProfile.startupName':     startupName,
      'alumniProfile.bio':             bio,
      'alumniProfile.skills':          Array.isArray(skills) ? skills : [],
      'alumniProfile.linkedinUrl':     linkedinUrl,
      'alumniProfile.isOpenToMentor':  isOpenToMentor !== false,
    };

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: update },
      { new: true }
    ).select('alumniProfile');

    res.json(user.alumniProfile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;