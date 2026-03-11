import express from 'express';
import { createAmenity, getAllAmenities, deleteAmenity } from '../controller/amenityController.js';
import adminAuth from '../middleware/adminAuth.js'; // Assuming you have this

const amenityRouter = express.Router();

amenityRouter.get('/list', getAllAmenities);
amenityRouter.post('/create', adminAuth, createAmenity); // Protected
amenityRouter.post('/delete/:id', adminAuth, deleteAmenity); // Protected

export default amenityRouter;
