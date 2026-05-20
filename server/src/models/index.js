const mongoose = require('mongoose');
const { Schema } = mongoose;

// ── Opportunity ─────────────────────────────────────────
const opportunitySchema = new Schema({
  postedBy:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type:        { type: String, enum: ['JOB','INTERNSHIP','MENTORSHIP','EVENT'], required: true },
  title:       { type: String, required: true },
  description: { type: String, required: true },
  company:     String,
  location:    String,
  domain:      String,   // 'Backend', 'ML', 'Finance'...
  deadline:    Date,
  slots:       { type: Number, default: 1 },
  selectedCount:{ type: Number, default: 0 },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });

// ── Application ─────────────────────────────────────────
const applicationSchema = new Schema({
  opportunity: { type: Schema.Types.ObjectId, ref: 'Opportunity', required: true },
  applicant:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status:      { type: String, enum: ['PENDING','SELECTED','REJECTED'], default: 'PENDING' },
  coverNote:   String,
  resumeUrl:   String,
}, { timestamps: true });

applicationSchema.index({ opportunity: 1, applicant: 1 }, { unique: true });

// ── Mentorship Request ───────────────────────────────────
const mentorshipSchema = new Schema({
  sender:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
  receiver:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
  topic:        { type: String, required: true },
  message:      { type: String, required: true },
  status:       { type: String, enum: ['PENDING','ACCEPTED','DECLINED','COMPLETED'], default: 'PENDING' },
  responseNote: String,
}, { timestamps: true });

// ── Referral Request ────────────────────────────────────
const referralSchema = new Schema({
  sender:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
  receiver:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
  company:      { type: String, required: true },
  role:         { type: String, required: true },
  resumeUrl:    String,
  message:      { type: String, required: true },
  status:       { type: String, enum: ['PENDING','APPROVED','DECLINED','GUIDED'], default: 'PENDING' },
  responseNote: String,
}, { timestamps: true });

// ── Interview Blog ───────────────────────────────────────
const blogSchema = new Schema({
  author:      { type: Schema.Types.ObjectId, ref: 'User', required: true },
  company:     { type: String, required: true },
  role:        { type: String, required: true },
  domain:      String,
  difficulty:  { type: String, enum: ['EASY','MEDIUM','HARD'], required: true },
  year:        { type: Number, required: true },
  title:       { type: String, required: true },
  content:     { type: String, required: true },
  tips:        String,
  outcome:     { type: String, enum: ['OFFER','REJECTED','PENDING'] },
  isPublished: { type: Boolean, default: false },
  adminNote:   String,
}, { timestamps: true });

// Full-text search on company, role, content
blogSchema.index({ company: 'text', role: 'text', title: 'text', domain: 'text' });

// ── Live Session ─────────────────────────────────────────
const liveSessionSchema = new Schema({
  host:         { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title:        { type: String, required: true },
  description:  String,
  topic:        { type: String, required: true },
  meetUrl:      { type: String, required: true },
  joinCode:     { type: String, required: true, unique: true },  // 6-char code
  joinPassword: { type: String, required: true },
  slots:        { type: Number, default: 50 },
  scheduledAt:  { type: Date, required: true },
  duration:     { type: Number, default: 60 }, // minutes
  status:       { type: String, enum: ['UPCOMING','LIVE','ENDED'], default: 'UPCOMING' },
  attendees:    [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = {
  Opportunity:       mongoose.model('Opportunity', opportunitySchema),
  Application:       mongoose.model('Application', applicationSchema),
  MentorshipRequest: mongoose.model('MentorshipRequest', mentorshipSchema),
  ReferralRequest:   mongoose.model('ReferralRequest', referralSchema),
  InterviewBlog:     mongoose.model('InterviewBlog', blogSchema),
  LiveSession:       mongoose.model('LiveSession', liveSessionSchema),
};