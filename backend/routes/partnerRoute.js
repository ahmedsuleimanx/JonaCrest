import express from 'express';
import multer from 'multer';
import {
  getAllPartners,
  getPartnerById,
  createPartner,
  updatePartner,
  deletePartner
} from '../controller/partnerController.js';
import adminAuthMiddleware from '../middleware/adminAuth.js';

const router = express.Router();

// Multer config for logo uploads (memory storage for cloudinary)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Public route
router.get('/', getAllPartners);
router.get('/:id', getPartnerById);

// Admin-only routes
router.post('/', adminAuthMiddleware, upload.single('logo'), createPartner);
router.put('/:id', adminAuthMiddleware, upload.single('logo'), updatePartner);
router.delete('/:id', adminAuthMiddleware, deletePartner);

export default router;
