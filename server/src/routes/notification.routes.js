const router = require('express').Router();
const User = require('../models/User');
const { authenticate } = require('../middleware/auth.middleware');

// GET /api/notifications — get current user's notifications
router.get('/', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('notifications');
    res.json(user?.notifications || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/notifications/unread-count
router.get('/unread-count', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('notifications');
    const count = user?.notifications?.filter(n => !n.isRead).length || 0;
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/notifications/:id/read — mark one as read
router.patch('/:id/read', authenticate, async (req, res) => {
  try {
    await User.updateOne(
      { _id: req.user._id, 'notifications._id': req.params.id },
      { $set: { 'notifications.$.isRead': true } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/notifications/read-all — mark all as read
router.patch('/read-all', authenticate, async (req, res) => {
  try {
    await User.updateOne(
      { _id: req.user._id },
      { $set: { 'notifications.$[].isRead': true } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;