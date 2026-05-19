const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ── Embedded: Alumni Profile ────────────────────────────
const alumniProfileSchema = new mongoose.Schema({
  department:      { type: String, required: true },
  graduationYear:  { type: Number, required: true },
  degree:          { type: String, default: 'B.Tech' },
  currentRole:     String,
  currentOrg:      String,
  industry:        String,
  location:        String,
  isStartupFounder:{ type: Boolean, default: false },
  startupName:     String,
  bio:             String,
  skills:          [String],           // ['React', 'Node.js', ...]
  linkedinUrl:     String,
  resumeUrl:       String,
  isOpenToMentor:  { type: Boolean, default: true },
  reputationScore: { type: Number, default: 0 },
  verifyStatus:    { type: String, enum: ['PENDING','APPROVED','REJECTED'], default: 'PENDING' },
  verifyNote:      String,             // admin rejection reason
}, { _id: false });

// ── Embedded: Student Profile ───────────────────────────
const studentProfileSchema = new mongoose.Schema({
  department:   { type: String, required: true },
  currentYear:  { type: Number, required: true },  // 1–4
  rollNumber:   String,
  skills:       [String],
  bio:          String,
  resumeUrl:    String,
  linkedinUrl:  String,
  careerGoal:   String,
}, { _id: false });

// ── Embedded: Notification ──────────────────────────────
const notificationSchema = new mongoose.Schema({
  type:    { type: String, required: true }, // MENTORSHIP_REQUEST | REFERRAL | SESSION | APPLICATION | VERIFICATION
  title:   { type: String, required: true },
  body:    { type: String, required: true },
  link:    String,
  isRead:  { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// ── Main User Schema ────────────────────────────────────
const userSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:  { type: String, required: true, minlength: 6 },
  role:      { type: String, enum: ['ADMIN','ALUMNI','STUDENT'], required: true },
  avatarUrl: String,
  isVerified:{ type: Boolean, default: false },  // email or admin verified

  // Only one will be populated depending on role
  alumniProfile:  alumniProfileSchema,
  studentProfile: studentProfileSchema,

  // Capped at 50 — trim on push
  notifications: {
    type: [notificationSchema],
    default: [],
    validate: [(arr) => arr.length <= 50, 'Too many notifications'],
  },
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  if (typeof this.password === 'string' && /^\$2[aby]\$/.test(this.password)) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare password helper
userSchema.methods.comparePassword = async function (plain) {
  if (!this.password) return false;

  const stored = this.password;
  const isHashed = typeof stored === 'string' && /^\$2[aby]\$/.test(stored);
  if (isHashed) return bcrypt.compare(plain, stored);

  const matches = plain === stored;
  if (matches) {
    this.password = await bcrypt.hash(plain, 10);
    await this.save();
  }
  return matches;
};

// Push notification and keep only latest 50
userSchema.methods.pushNotification = async function (notif) {
  this.notifications.unshift(notif);
  if (this.notifications.length > 50) this.notifications = this.notifications.slice(0, 50);
  await this.save();
};

// Never return password in JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);