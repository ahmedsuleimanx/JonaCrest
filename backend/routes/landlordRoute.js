import express from 'express';
import {
    getLandlordStats,
    getLandlordProperties,
    getLandlordViewings,
    updateViewingStatus,
    addLandlordProperty,
    updateLandlordProperty,
    deleteLandlordProperty
} from '../controller/landlordController.js';
import authMiddleware from '../middleware/authmiddleware.js';

import upload from '../middleware/multer.js';

const landlordRouter = express.Router();

// All routes require authentication
landlordRouter.use(authMiddleware);

// Dashboard stats
landlordRouter.get('/stats', getLandlordStats);

// Property management
landlordRouter.get('/properties', getLandlordProperties);
landlordRouter.post('/properties', upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
]), addLandlordProperty);
landlordRouter.put('/properties/:id', upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
]), updateLandlordProperty);
landlordRouter.delete('/properties/:id', deleteLandlordProperty);

// Viewing management
landlordRouter.get('/viewings', getLandlordViewings);
landlordRouter.put('/viewings/:id/status', updateViewingStatus);

export default landlordRouter;
