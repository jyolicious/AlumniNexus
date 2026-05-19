const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth.middleware');

const signToken = (id) =>
  jwt.sign({ userId: id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    let { name, email, password, role } = req.body;
    const { alumniProfile, studentProfile, department, graduationYear, currentYear } = req.body;

    if (!email || !password || !name) return res.status(400).json({ error: 'Name, email and password are required' });
    email = email.trim().toLowerCase();

    if (!['STUDENT', 'ALUMNI'].includes(role))
      return res.status(400).json({ error: 'Role must be STUDENT or ALUMNI' });

    if (await User.findOne({ email }))
      return res.status(409).json({ error: 'Email already registered' });

    const userData = { name, email, password, role };

    if (role === 'ALUMNI') {
      const profile = alumniProfile || { department, graduationYear };
      if (!profile.department || !profile.graduationYear)
        return res.status(400).json({ error: 'department and graduationYear required for alumni' });
      userData.alumniProfile = {
        department: profile.department,
        graduationYear: Number(profile.graduationYear),
      };
    }

    if (role === 'STUDENT') {
      const profile = studentProfile || { department, currentYear };
      if (!profile.department || !profile.currentYear)
        return res.status(400).json({ error: 'department and currentYear required for students' });
      userData.studentProfile = {
        department: profile.department,
        currentYear: Number(profile.currentYear),
      };
    }

    const user = await User.create(userData);
    res.status(201).json({ token: signToken(user._id), user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    email = email.trim().toLowerCase();
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ error: 'Invalid credentials' });

    res.json({ token: signToken(user._id), user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => res.json(req.user));

module.exports = router;