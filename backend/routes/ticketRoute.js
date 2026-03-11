import express from 'express';
import {
  createTicket,
  getUserTickets,
  getAllTickets,
  getTicket,
  updateTicket,
  addResponse,
  assignTicket,
  getTicketStats
} from '../controller/ticketController.js';
import authMiddleware from '../middleware/authmiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Create a new ticket
router.post('/', createTicket);

// Get tickets for current user
router.get('/my-tickets', getUserTickets);

// Get all tickets (admin only)
router.get('/all', getAllTickets);

// Get ticket stats
router.get('/stats', getTicketStats);

// Get single ticket
router.get('/:id', getTicket);

// Update ticket (admin only)
router.patch('/:id', updateTicket);

// Add response to ticket
router.post('/:id/responses', addResponse);

// Assign ticket (admin only)
router.patch('/:id/assign', assignTicket);

export default router;
