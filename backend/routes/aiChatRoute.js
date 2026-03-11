import express from 'express';
import { chatWithAI, checkAIStatus } from '../controller/aiChatController.js';

const aiChatRouter = express.Router();

aiChatRouter.post('/chat', chatWithAI);
aiChatRouter.get('/status', checkAIStatus);

export default aiChatRouter;
