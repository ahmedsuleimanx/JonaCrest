import Ticket from '../models/ticketModel.js';
import { createNotificationHelper } from './notificationController.js';

// Get all tickets (admin)
export const getAllTicketsAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, type, priority, sort = '-createdAt' } = req.query;

    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (priority) query.priority = priority;

    const tickets = await Ticket.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('creator', 'name email role')
      .populate('assignedTo', 'name email')
      .populate('property', 'title')
      .lean();

    const total = await Ticket.countDocuments(query);

    res.json({
      success: true,
      tickets,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all tickets admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tickets'
    });
  }
};

// Get single ticket (admin)
export const getTicketAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findById(id)
      .populate('creator', 'name email role profileImage')
      .populate('assignedTo', 'name email profileImage')
      .populate('property', 'title images')
      .populate('responses.user', 'name email role profileImage');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    res.json({
      success: true,
      ticket
    });
  } catch (error) {
    console.error('Get ticket admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ticket'
    });
  }
};

// Update ticket (admin)
export const updateTicketAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, assignedTo, tags } = req.body;

    const updateData = {};
    if (status) {
      updateData.status = status;
      if (status === 'resolved') updateData.resolvedAt = new Date();
      if (status === 'closed') updateData.closedAt = new Date();
    }
    if (priority) updateData.priority = priority;
    if (assignedTo) updateData.assignedTo = assignedTo;
    if (tags) updateData.tags = tags;

    const ticket = await Ticket.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('creator', 'name email');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Notify ticket creator about update
    try {
      await createNotificationHelper(
        ticket.creator._id,
        'ticket_updated',
        'Ticket Updated',
        `Your ticket ${ticket.ticketNumber} has been updated. Status: ${status || ticket.status}`,
        { ticketId: ticket._id },
        `/dashboard/tickets`
      );
    } catch (notifError) {
      console.error('Failed to send notification:', notifError);
    }

    res.json({
      success: true,
      message: 'Ticket updated successfully',
      ticket
    });
  } catch (error) {
    console.error('Update ticket admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update ticket'
    });
  }
};

// Add response to ticket (admin)
export const addResponseAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, attachments } = req.body;

    const ticket = await Ticket.findById(id).populate('creator', 'name email');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    const response = {
      user: null, // Admin response doesn't have a user ID in the traditional sense
      message,
      isAdmin: true,
      isAdminResponse: true,
      attachments: attachments || [],
      createdAt: new Date()
    };

    ticket.responses.push(response);
    ticket.lastResponseAt = new Date();

    // If ticket is open, set to in-progress
    if (ticket.status === 'open') {
      ticket.status = 'in-progress';
    }

    await ticket.save();

    // Repopulate for response
    await ticket.populate('responses.user', 'name email role profileImage');

    // Notify ticket creator about new response
    try {
      await createNotificationHelper(
        ticket.creator._id,
        'ticket_response',
        'New Response on Your Ticket',
        `Admin responded to your ticket: ${ticket.subject}`,
        { ticketId: ticket._id },
        `/dashboard/tickets`
      );
    } catch (notifError) {
      console.error('Failed to send notification:', notifError);
    }

    res.json({
      success: true,
      message: 'Response added successfully',
      ticket
    });
  } catch (error) {
    console.error('Add response admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add response'
    });
  }
};

export default {
  getAllTicketsAdmin,
  getTicketAdmin,
  updateTicketAdmin,
  addResponseAdmin
};
