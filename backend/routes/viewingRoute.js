import express from 'express';
import { scheduleViewing, getUserViewings, getAgentViewings, updateViewingStatus } from '../controller/viewingController.js';
import authMiddleware from '../middleware/authmiddleware.js';

const viewingRouter = express.Router();

viewingRouter.post('/schedule', authMiddleware, scheduleViewing);
viewingRouter.get('/my-viewings', authMiddleware, getUserViewings);
viewingRouter.get('/agent/viewings', authMiddleware, getAgentViewings); // Assuming agent is just an auth user for now
viewingRouter.put('/status/:id', authMiddleware, updateViewingStatus); // Agent/Owner only in future

export default viewingRouter;
