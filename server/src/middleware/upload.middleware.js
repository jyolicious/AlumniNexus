const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
 
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
 
// Resume storage — PDFs only, stored in /resumes folder on Cloudinary
const resumeStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:        'alumni-nexus/resumes',
    resource_type: 'raw',        // needed for PDFs
    format: async () => 'pdf',
    public_id: (req, file) => `resume_${req.user._id}_${Date.now()}`,
  },
});
 
// Avatar storage — images
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:          'alumni-nexus/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation:  [{ width: 400, height: 400, crop: 'fill' }],
    public_id: (req, file) => `avatar_${req.user._id}`,
  },
});
 
const uploadResume = multer({
  storage: resumeStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
}).single('resume');
 
const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
}).single('avatar');
 
// Wrap multer in a promise so we can use async/await in routes
const handleUpload = (uploadFn) => (req, res) =>
  new Promise((resolve, reject) => {
    uploadFn(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
 
module.exports = {
  uploadResume: handleUpload(uploadResume),
  uploadAvatar: handleUpload(uploadAvatar),
  cloudinary,
};
 