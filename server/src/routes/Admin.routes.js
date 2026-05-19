const router = require('express').Router();
const User = require('../models/User');
const { MentorshipRequest, ReferralRequest, Opportunity, InterviewBlog, LiveSession } = require('../models/index');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate, authorize('ADMIN'));

// GET /api/admin/pending-alumni
router.get('/pending-alumni', async (req, res) => {
  try {
    const users = await User.find({ role: 'ALUMNI', 'alumniProfile.verifyStatus': 'PENDING' })
      .select('name email createdAt alumniProfile')
      .sort('createdAt');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/alumni/:userId/verify
router.patch('/alumni/:userId/verify', async (req, res) => {
  try {
    const { status, note } = req.body;
    if (!['APPROVED', 'REJECTED'].includes(status))
      return res.status(400).json({ error: 'status must be APPROVED or REJECTED' });

    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.alumniProfile.verifyStatus = status;
    user.alumniProfile.verifyNote = note || '';
    user.isVerified = status === 'APPROVED';
    await user.save();
    await user.pushNotification({
      type: 'VERIFICATION_UPDATE',
      title: status === 'APPROVED' ? 'Profile verified!' : 'Verification update',
      body: status === 'APPROVED'
        ? 'Your alumni profile has been approved. Welcome!'
        : `Not approved. ${note || 'Contact admin for details.'}`,
      link: '/profile',
    });

    res.json({ message: `Alumni ${status.toLowerCase()}`, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/pending-blogs
router.get('/pending-blogs', async (req, res) => {
  try {
    const blogs = await InterviewBlog.find({ isPublished: false })
      .populate('author', 'name email')
      .sort('createdAt');
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/blogs/:id/publish
router.patch('/blogs/:id/publish', async (req, res) => {
  try {
    const { publish, note } = req.body;
    const blog = await InterviewBlog.findByIdAndUpdate(
      req.params.id,
      { isPublished: Boolean(publish), adminNote: note || '' },
      { new: true }
    );
    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/analytics
router.get('/analytics', async (req, res) => {
  try {
    const [
      totalUsers, totalAlumni, totalStudents,
      verifiedAlumni, pendingAlumni,
      totalMentorships, acceptedMentorships,
      totalReferrals, totalOpportunities,
      totalBlogs, totalSessions,
      alumniByDept, alumniByYear, mentorshipByStatus,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'ALUMNI' }),
      User.countDocuments({ role: 'STUDENT' }),
      User.countDocuments({ role: 'ALUMNI', 'alumniProfile.verifyStatus': 'APPROVED' }),
      User.countDocuments({ role: 'ALUMNI', 'alumniProfile.verifyStatus': 'PENDING' }),
      MentorshipRequest.countDocuments(),
      MentorshipRequest.countDocuments({ status: 'ACCEPTED' }),
      ReferralRequest.countDocuments(),
      Opportunity.countDocuments(),
      InterviewBlog.countDocuments({ isPublished: true }),
      LiveSession.countDocuments(),
      // Alumni by department
      User.aggregate([
        { $match: { role: 'ALUMNI', 'alumniProfile.verifyStatus': 'APPROVED' } },
        { $group: { _id: '$alumniProfile.department', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      // Alumni by graduation year
      User.aggregate([
        { $match: { role: 'ALUMNI', 'alumniProfile.verifyStatus': 'APPROVED' } },
        { $group: { _id: '$alumniProfile.graduationYear', count: { $sum: 1 } } },
        { $sort: { _id: -1 } },
        { $limit: 10 },
      ]),
      // Mentorship by status
      MentorshipRequest.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    res.json({
      users: { total: totalUsers, alumni: totalAlumni, students: totalStudents },
      alumni: { verified: verifiedAlumni, pending: pendingAlumni },
      mentorships: { total: totalMentorships, accepted: acceptedMentorships },
      referrals: totalReferrals,
      opportunities: totalOpportunities,
      blogs: totalBlogs,
      sessions: totalSessions,
      charts: {
        alumniByDept: alumniByDept.map(d => ({ name: d._id || 'Unknown', value: d.count })),
        alumniByYear: alumniByYear.map(d => ({ name: String(d._id), value: d.count })),
        mentorshipByStatus: mentorshipByStatus.map(d => ({ name: d._id, value: d.count })),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const { role } = req.query;
    const users = await User.find(role ? { role } : {})
      .select('name email role isVerified createdAt alumniProfile.verifyStatus alumniProfile.department')
      .sort('-createdAt');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;