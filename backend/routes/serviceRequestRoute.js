import express from 'express';
import { createServiceRequest, getUserServiceRequests, getAllServiceRequests, updateServiceRequestStatus } from '../controller/serviceRequestController.js';
import authMiddleware from '../middleware/authmiddleware.js';
import adminAuth from '../middleware/adminAuth.js';

const serviceRequestRouter = express.Router();

serviceRequestRouter.post('/create', authMiddleware, createServiceRequest);
serviceRequestRouter.get('/my-requests', authMiddleware, getUserServiceRequests);
serviceRequestRouter.get('/all', adminAuth, getAllServiceRequests);
serviceRequestRouter.put('/status/:id', adminAuth, updateServiceRequestStatus);
serviceRequestRouter.put('/:id/status', adminAuth, updateServiceRequestStatus);

export default serviceRequestRouter;
