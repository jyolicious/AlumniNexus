const router = require('express').Router();
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// POST /api/students/profile — student updates their profile
router.post('/profile', authenticate, authorize('STUDENT'), async (req, res) => {
  try {
    const { department, currentYear, skills, bio, resumeUrl, linkedinUrl, careerGoal, rollNumber } = req.body;

    const update = {
      'studentProfile.department':  department,
      'studentProfile.currentYear': Number(currentYear),
      'studentProfile.skills':      Array.isArray(skills) ? skills : [],
      'studentProfile.bio':         bio,
      'studentProfile.resumeUrl':   resumeUrl,
      'studentProfile.linkedinUrl': linkedinUrl,
      'studentProfile.careerGoal':  careerGoal,
      'studentProfile.rollNumber':  rollNumber,
    };

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: update },
      { new: true }
    ).select('studentProfile');

    res.json(user.studentProfile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/students/profile
router.get('/profile', authenticate, authorize('STUDENT'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('studentProfile');
    res.json(user?.studentProfile || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;