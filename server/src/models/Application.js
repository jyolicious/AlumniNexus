const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({

  opportunity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity',
    required: true,
  },

  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  coverNote: String,

  resumeUrl: {
    type: String,
    required: true,
  },

  status: {
    type: String,
    enum: ['PENDING', 'SELECTED', 'REJECTED'],
    default: 'PENDING',
  },

}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);