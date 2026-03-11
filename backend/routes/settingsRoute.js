import express from 'express';
import { getSettings, updateSettings } from '../controller/settingsController.js';
import authMiddleware from '../middleware/authmiddleware.js';

const router = express.Router();

// Settings routes
router.get('/', authMiddleware, getSettings);
router.put('/', authMiddleware, updateSettings);

export default router;
