import express from 'express';
import {
    getAgentStats,
    getAgentListings,
    getAgentLeads,
    createLead,
    updateLeadStatus,
    deleteLead,
    getAgentViewings,
    getAgentClients
} from '../controller/agentController.js';
import authMiddleware from '../middleware/authmiddleware.js';

const agentRouter = express.Router();

// All routes require authentication
agentRouter.use(authMiddleware);

// Dashboard stats
agentRouter.get('/stats', getAgentStats);

// Listings management
agentRouter.get('/listings', getAgentListings);

// Lead management
agentRouter.get('/leads', getAgentLeads);
agentRouter.post('/leads', createLead);
agentRouter.put('/leads/:id', updateLeadStatus);
agentRouter.delete('/leads/:id', deleteLead);

// Viewings
agentRouter.get('/viewings', getAgentViewings);

// Clients
agentRouter.get('/clients', getAgentClients);

export default agentRouter;
