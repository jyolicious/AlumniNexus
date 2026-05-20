const router = require('express').Router();

const { Opportunity, Application } = require('../models/index');

const {
  authenticate,
  authorize,
  requireVerified,
} = require('../middleware/auth.middleware');

const {
  uploadResume,
} = require('../middleware/upload.middleware');


// ======================================================
// GET ALL ACTIVE OPPORTUNITIES
// ======================================================

router.get('/', authenticate, async (req, res) => {

  try {

    const { type, domain } = req.query;

    const filter = {
      isActive: true,
    };

    if (type) {
      filter.type = type;
    }

    if (domain) {
      filter.domain = domain;
    }

    const opps = await Opportunity.find(filter)
      .populate('postedBy', 'name email avatarUrl')
      .sort('-createdAt');

    res.json(opps);

  } catch (err) {

    res.status(500).json({
      error: err.message,
    });

  }

});


// ======================================================
// ALUMNI POSTS OPPORTUNITY
// ======================================================

router.post(
  '/',
  authenticate,
  authorize('ALUMNI'),
  requireVerified,

  async (req, res) => {

    try {

      const {
        type,
        title,
        description,
        company,
        location,
        domain,
        deadline,
        slots,
      } = req.body;

      if (!type || !title || !description) {

        return res.status(400).json({
          error: 'type, title, description required',
        });

      }

      const opp = await Opportunity.create({

        postedBy: req.user._id,

        type,
        title,
        description,
        company,
        location,
        domain,

        slots: slots || 1,

        deadline: deadline
          ? new Date(deadline)
          : undefined,

      });

      await opp.populate(
        'postedBy',
        'name email avatarUrl'
      );

      res.status(201).json(opp);

    } catch (err) {

      res.status(500).json({
        error: err.message,
      });

    }

  }
);


// ======================================================
// STUDENT APPLIES
// ======================================================

router.post(
  '/:id/apply',

  authenticate,
  authorize('STUDENT'),

  async (req, res) => {

    try {

      // upload resume PDF
      await uploadResume(req, res);

      if (!req.file) {

        return res.status(400).json({
          error: 'Resume PDF is required',
        });

      }

      const { coverNote } = req.body;

      const opp = await Opportunity.findById(req.params.id);

      if (!opp || !opp.isActive) {

        return res.status(404).json({
          error: 'Opportunity not found or closed',
        });

      }

      // prevent overfilled positions
      if (opp.selectedCount >= opp.slots) {

        return res.status(400).json({
          error: 'All positions filled',
        });

      }

      // prevent duplicate application
      const existing = await Application.findOne({

        opportunity: req.params.id,
        applicant: req.user._id,

      });

      if (existing) {

        return res.status(409).json({
          error: 'Already applied',
        });

      }

      const app = await Application.create({

        opportunity: req.params.id,

        applicant: req.user._id,

        coverNote,

        resumeUrl: req.file.path,

      });

      res.status(201).json(app);

    } catch (err) {

      res.status(500).json({
        error: err.message,
      });

    }

  }
);


// ======================================================
// ALUMNI SEES OWN OPPORTUNITIES
// ======================================================

router.get(
  '/my',

  authenticate,
  authorize('ALUMNI'),

  async (req, res) => {

    try {

      const opps = await Opportunity.find({
        postedBy: req.user._id,
      })
      .sort('-createdAt');

      res.json(opps);

    } catch (err) {

      res.status(500).json({
        error: err.message,
      });

    }

  }
);


// ======================================================
// ALUMNI EDITS OPPORTUNITY
// ======================================================

router.patch(
  '/:id',

  authenticate,
  authorize('ALUMNI'),

  async (req, res) => {

    try {

      const opp = await Opportunity.findById(req.params.id);

      if (!opp) {

        return res.status(404).json({
          error: 'Opportunity not found',
        });

      }

      if (!opp.postedBy.equals(req.user._id)) {

        return res.status(403).json({
          error: 'Forbidden',
        });

      }

      Object.assign(opp, req.body);

      await opp.save();

      res.json(opp);

    } catch (err) {

      res.status(500).json({
        error: err.message,
      });

    }

  }
);


// ======================================================
// ALUMNI VIEW APPLICANTS
// ======================================================

router.get(
  '/:id/applications',

  authenticate,
  authorize('ALUMNI'),

  async (req, res) => {

    try {

      const opp = await Opportunity.findById(req.params.id);

      if (!opp) {

        return res.status(404).json({
          error: 'Opportunity not found',
        });

      }

      if (!opp.postedBy.equals(req.user._id)) {

        return res.status(403).json({
          error: 'Forbidden',
        });

      }

      const applications = await Application.find({
        opportunity: req.params.id,
      })
      .populate(
        'applicant',
        'name email avatarUrl'
      )
      .sort('-createdAt');

      res.json(applications);

    } catch (err) {

      res.status(500).json({
        error: err.message,
      });

    }

  }
);


// ======================================================
// ALUMNI SELECTS STUDENT
// ======================================================

router.patch(
  '/applications/:id/select',

  authenticate,
  authorize('ALUMNI'),

  async (req, res) => {

    try {

      const app = await Application.findById(req.params.id)
        .populate('opportunity');

      if (!app) {

        return res.status(404).json({
          error: 'Application not found',
        });

      }

      const opp = app.opportunity;

      // ownership check
      if (!opp.postedBy.equals(req.user._id)) {

        return res.status(403).json({
          error: 'Forbidden',
        });

      }

      // already selected
      if (app.status === 'SELECTED') {

        return res.status(400).json({
          error: 'Student already selected',
        });

      }

      // slots full
      if (opp.selectedCount >= opp.slots) {

        return res.status(400).json({
          error: 'No slots remaining',
        });

      }

      // select student
      app.status = 'SELECTED';

      await app.save();

      opp.selectedCount += 1;

      // auto close
      if (opp.selectedCount >= opp.slots) {
        opp.isActive = false;
      }

      await opp.save();

      res.json({
        message: 'Student selected successfully',
        remainingSlots:
          opp.slots - opp.selectedCount,
      });

    } catch (err) {

      res.status(500).json({
        error: err.message,
      });

    }

  }
);


// ======================================================

module.exports = router;