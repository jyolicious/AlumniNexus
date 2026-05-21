const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  type: {
    type: String,
    enum: ['JOB', 'INTERNSHIP', 'MENTORSHIP', 'EVENT'],
    required: true,
  },

  title: String,
  description: String,
  company: String,
  location: String,
  domain: String,

  slots: {
    type: Number,
    default: 1,
  },

  selectedCount: {
    type: Number,
    default: 0,
  },

  isActive: {
    type: Boolean,
    default: true,
  },

  deadline: Date,

  eligibleRoles: {
    type: [String],
    enum: ['STUDENT', 'ALUMNI'],
    default: ['STUDENT'],
  },

}, { timestamps: true });

module.exports = mongoose.model('Opportunity', opportunitySchema);