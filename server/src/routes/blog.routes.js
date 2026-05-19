const router = require('express').Router();
const { InterviewBlog } = require('../models/index');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// GET /api/blogs — list published blogs with filters
router.get('/', authenticate, async (req, res) => {
  try {
    const { company, role, domain, difficulty } = req.query;
    const filter = { isPublished: true };
    if (company)    filter.company    = new RegExp(company, 'i');
    if (role)       filter.role       = new RegExp(role, 'i');
    if (domain)     filter.domain     = domain;
    if (difficulty) filter.difficulty = difficulty;

    const blogs = await InterviewBlog.find(filter)
      .populate('author', 'name email avatarUrl')
      .sort('-createdAt');
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/blogs — alumni submits a blog (pending review)
router.post('/', authenticate, authorize('ALUMNI'), async (req, res) => {
  try {
    const { company, role, domain, difficulty, year, title, content, tips, outcome } = req.body;
    if (!company || !role || !difficulty || !title || !content)
      return res.status(400).json({ error: 'company, role, difficulty, title, content required' });

    const blog = await InterviewBlog.create({
      author: req.user._id,
      company, role, domain, difficulty,
      year: year || new Date().getFullYear(),
      title, content, tips, outcome,
      isPublished: false,
    });
    res.status(201).json(blog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/blogs/my — alumni sees their own blogs
router.get('/my', authenticate, authorize('ALUMNI'), async (req, res) => {
  try {
    const blogs = await InterviewBlog.find({ author: req.user._id }).sort('-createdAt');
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/blogs/:id — single blog
router.get('/:id', authenticate, async (req, res) => {
  try {
    const blog = await InterviewBlog.findOne({ _id: req.params.id, isPublished: true })
      .populate('author', 'name email avatarUrl');
    if (!blog) return res.status(404).json({ error: 'Blog not found' });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;