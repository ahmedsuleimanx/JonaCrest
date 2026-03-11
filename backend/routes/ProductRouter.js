import express from 'express';
import { addproperty, listproperty, removeproperty, updateproperty, singleproperty } from '../controller/productcontroller.js';
import upload from '../middleware/multer.js';
import adminAuth from '../middleware/adminAuth.js';

const propertyrouter = express.Router();

// Public routes
propertyrouter.get('/list', listproperty);
propertyrouter.get('/single/:id', singleproperty);

// Admin-only routes
propertyrouter.post('/add', adminAuth, upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
]), addproperty);
propertyrouter.post('/remove', adminAuth, removeproperty);
propertyrouter.post('/update', adminAuth, upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
]), updateproperty);

export default propertyrouter;