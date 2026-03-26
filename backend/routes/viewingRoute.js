import express from 'express';
import { scheduleViewing, getUserViewings, getAgentViewings, updateViewingStatus, checkMapAccess } from '../controller/viewingController.js';
import authMiddleware from '../middleware/authmiddleware.js';
import adminAuth from '../middleware/adminAuth.js';

const viewingRouter = express.Router();

viewingRouter.post('/schedule', authMiddleware, scheduleViewing);
viewingRouter.get('/my-viewings', authMiddleware, getUserViewings);
viewingRouter.get('/agent/viewings', authMiddleware, getAgentViewings);
viewingRouter.get('/map-access/:propertyId', authMiddleware, checkMapAccess);
viewingRouter.put('/status/:id', authMiddleware, updateViewingStatus);

export default viewingRouter;
