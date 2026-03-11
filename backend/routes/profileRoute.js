import express from 'express';
import { getProfile, updateProfile, uploadProfileImage, getPublicProfile } from '../controller/profileController.js';
import authMiddleware from '../middleware/authmiddleware.js';
import multer from 'multer';

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profiles');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Profile routes
router.get('/', authMiddleware, getProfile);
router.put('/', authMiddleware, updateProfile);
router.post('/image', authMiddleware, upload.single('image'), uploadProfileImage);
router.get('/:id', getPublicProfile);

export default router;
