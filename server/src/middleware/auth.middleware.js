const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT and attach user to req.user
const authenticate = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });

    const token = auth.split(' ')[1];
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(401).json({ error: 'User not found' });

    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Role guard — usage: authorize('ADMIN') or authorize('ADMIN','ALUMNI')
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Access denied' });
  next();
};

// Alumni must be verified before posting opportunities, sessions etc
const requireVerified = (req, res, next) => {
  if (req.user.role === 'ALUMNI' && req.user.alumniProfile?.verifyStatus !== 'APPROVED') {
    return res.status(403).json({ error: 'Your alumni profile is pending verification' });
  }
  next();
};

module.exports = { authenticate, authorize, requireVerified };