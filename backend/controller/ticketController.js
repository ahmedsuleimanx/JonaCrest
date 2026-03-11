import Ticket from '../models/ticketModel.js';
import User from '../models/Usermodel.js';
import { createNotificationHelper, notifyAdmins } from './notificationController.js';

// Create a new ticket
export const createTicket = async (req, res) => {
  try {
    const { type, category, subject, description, priority, property, attachments } = req.body;
    const userId = req.user._id;

    const ticket = new Ticket({
      creator: userId,
      type: type || 'issue',
      category: category || 'other',
      subject,
      description,
      priority: priority || 'medium',
      property,
      attachments: attachments || []
    });

    await ticket.save();
    await ticket.populate('creator', 'name email role');

    // Notify admins about new ticket
    await notifyAdmins(
      'ticket_created',
      'New Support Ticket',
      `${req.user.name} created ticket: ${subject}`,
      { ticketId: ticket._id, ticketNumber: ticket.ticketNumber },
      `/admin/tickets/${ticket._id}`
    );

    res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      ticket
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create ticket'
    });
  }
};

// Get tickets for current user
export const getUserTickets = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type, sort = '-createdAt' } = req.query;
    const userId = req.user._id;

    const query = { creator: userId };
    if (status) query.status = status;
    if (type) query.type = type;

    const tickets = await Ticket.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
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
    console.error('Get user tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tickets'
    });
  }
};

// Get all tickets (admin only)
export const getAllTickets = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const { page = 1, limit = 20, status, type, priority, assignedTo, sort = '-createdAt' } = req.query;

    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;

    const tickets = await Ticket.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('creator', 'name email role')
      .populate('assignedTo', 'name email')
      .populate('property', 'title')
      .lean();

    const total = await Ticket.countDocuments(query);

    // Get stats
    const stats = {
      total: await Ticket.countDocuments(),
      open: await Ticket.countDocuments({ status: 'open' }),
      inProgress: await Ticket.countDocuments({ status: 'in_progress' }),
      resolved: await Ticket.countDocuments({ status: 'resolved' }),
      urgent: await Ticket.countDocuments({ priority: 'urgent', status: { $nin: ['resolved', 'closed'] } })
    };

    res.json({
      success: true,
      tickets,
      stats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tickets'
    });
  }
};

// Get single ticket
export const getTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

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

    // Check access - creator or admin can view
    if (ticket.creator._id.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    res.json({
      success: true,
      ticket
    });
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ticket'
    });
  }
};

// Update ticket (admin only)
export const updateTicket = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

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
    await createNotificationHelper(
      ticket.creator._id,
      'ticket_updated',
      'Ticket Updated',
      `Your ticket ${ticket.ticketNumber} has been updated. Status: ${status || ticket.status}`,
      { ticketId: ticket._id },
      `/tickets/${ticket._id}`
    );

    res.json({
      success: true,
      message: 'Ticket updated successfully',
      ticket
    });
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update ticket'
    });
  }
};

// Add response to ticket
export const addResponse = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, attachments } = req.body;
    const userId = req.user._id;

    const ticket = await Ticket.findById(id).populate('creator', 'name email');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check access
    if (ticket.creator._id.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const response = {
      user: userId,
      message,
      isAdminResponse: req.user.role === 'admin',
      attachments: attachments || [],
      createdAt: new Date()
    };

    ticket.responses.push(response);
    ticket.lastResponseAt = new Date();

    // If admin responds and ticket is open, set to in_progress
    if (req.user.role === 'admin' && ticket.status === 'open') {
      ticket.status = 'in_progress';
    }

    // If user responds and ticket is waiting_response, set to in_progress
    if (req.user.role !== 'admin' && ticket.status === 'waiting_response') {
      ticket.status = 'in_progress';
    }

    await ticket.save();
    await ticket.populate('responses.user', 'name email role profileImage');

    // Notify the other party
    if (req.user.role === 'admin') {
      await createNotificationHelper(
        ticket.creator._id,
        'ticket_response',
        'New Response on Your Ticket',
        `Admin responded to your ticket: ${ticket.subject}`,
        { ticketId: ticket._id },
        `/tickets/${ticket._id}`
      );
    } else {
      await notifyAdmins(
        'ticket_response',
        'New Ticket Response',
        `${req.user.name} responded to ticket ${ticket.ticketNumber}`,
        { ticketId: ticket._id },
        `/admin/tickets/${ticket._id}`
      );
    }

    res.json({
      success: true,
      message: 'Response added successfully',
      ticket
    });
  } catch (error) {
    console.error('Add response error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add response'
    });
  }
};

// Assign ticket (admin only)
export const assignTicket = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const { id } = req.params;
    const { assignedTo } = req.body;

    const admin = await User.findById(assignedTo);
    if (!admin || admin.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Invalid assignee'
      });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      id,
      { assignedTo, status: 'in_progress' },
      { new: true }
    ).populate('assignedTo', 'name email');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Notify assigned admin
    await createNotificationHelper(
      assignedTo,
      'ticket_updated',
      'Ticket Assigned to You',
      `Ticket ${ticket.ticketNumber} has been assigned to you`,
      { ticketId: ticket._id },
      `/admin/tickets/${ticket._id}`
    );

    res.json({
      success: true,
      message: 'Ticket assigned successfully',
      ticket
    });
  } catch (error) {
    console.error('Assign ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign ticket'
    });
  }
};

// Get ticket stats for dashboard
export const getTicketStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const isAdmin = req.user.role === 'admin';

    const baseQuery = isAdmin ? {} : { creator: userId };

    const stats = {
      total: await Ticket.countDocuments(baseQuery),
      open: await Ticket.countDocuments({ ...baseQuery, status: 'open' }),
      inProgress: await Ticket.countDocuments({ ...baseQuery, status: 'in_progress' }),
      resolved: await Ticket.countDocuments({ ...baseQuery, status: 'resolved' }),
      closed: await Ticket.countDocuments({ ...baseQuery, status: 'closed' })
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get ticket stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get ticket stats'
    });
  }
};

export default {
  createTicket,
  getUserTickets,
  getAllTickets,
  getTicket,
  updateTicket,
  addResponse,
  assignTicket,
  getTicketStats
};
