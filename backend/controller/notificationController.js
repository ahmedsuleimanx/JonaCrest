import Notification from '../models/notificationModel.js';
import User from '../models/Usermodel.js';

// Create a notification
export const createNotification = async (req, res) => {
  try {
    const { recipient, type, title, message, data, link } = req.body;

    const notification = new Notification({
      recipient,
      type,
      title,
      message,
      data,
      link
    });

    await notification.save();

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      notification
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create notification'
    });
  }
};

// Get notifications for current user
export const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const userId = req.user._id;

    const query = { recipient: userId };
    if (unreadOnly === 'true') {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      read: false
    });

    res.json({
      success: true,
      notifications,
      unreadCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
};

// Get unread count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const count = await Notification.countDocuments({
      recipient: userId,
      read: false
    });

    res.json({
      success: true,
      unreadCount: count
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count'
    });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: userId },
      { read: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.updateMany(
      { recipient: userId, read: false },
      { read: true, readAt: new Date() }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read'
    });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      recipient: userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification'
    });
  }
};

// Delete all read notifications
export const deleteAllRead = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.deleteMany({
      recipient: userId,
      read: true
    });

    res.json({
      success: true,
      message: 'All read notifications deleted'
    });
  } catch (error) {
    console.error('Delete all read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete read notifications'
    });
  }
};

// Helper function to create notification (for internal use)
export const createNotificationHelper = async (recipientId, type, title, message, data = {}, link = '') => {
  try {
    const notification = new Notification({
      recipient: recipientId,
      type,
      title,
      message,
      data,
      link
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Helper create notification error:', error);
    throw error;
  }
};

// Notify all admins
export const notifyAdmins = async (type, title, message, data = {}, link = '') => {
  try {
    const admins = await User.find({ role: 'admin' }).select('_id');
    const notifications = admins.map(admin => ({
      recipient: admin._id,
      type,
      title,
      message,
      data,
      link
    }));
    await Notification.insertMany(notifications);
  } catch (error) {
    console.error('Notify admins error:', error);
  }
};

// Create test notifications for the current user (for testing purposes)
export const createTestNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const testNotifications = [
      {
        recipient: userId,
        type: 'viewing_confirmed',
        title: 'Viewing Confirmed!',
        message: 'Your viewing for "Luxury Villa in East Legon" has been confirmed for tomorrow at 2:00 PM.',
        link: '/dashboard/viewings'
      },
      {
        recipient: userId,
        type: 'message_received',
        title: 'New Message',
        message: 'You have a new message from JonaCrest Support regarding your inquiry.',
        link: '/dashboard/messages'
      },
      {
        recipient: userId,
        type: 'property_alert',
        title: 'New Property Match',
        message: 'A new property matching your search criteria has been listed: 3-bedroom apartment in Cantonments.',
        link: '/dashboard/browse'
      },
      {
        recipient: userId,
        type: 'ticket_response',
        title: 'Support Ticket Update',
        message: 'Admin has responded to your support ticket #JCP-000001.',
        link: '/dashboard/tickets'
      },
      {
        recipient: userId,
        type: 'system_alert',
        title: 'Welcome to JonaCrest!',
        message: 'Thank you for joining JonaCrest Properties. Explore our listings and find your dream home.',
        link: '/dashboard'
      }
    ];

    await Notification.insertMany(testNotifications);

    res.json({
      success: true,
      message: `Created ${testNotifications.length} test notifications`
    });
  } catch (error) {
    console.error('Create test notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create test notifications'
    });
  }
};

export default {
  createNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead,
  createNotificationHelper,
  notifyAdmins,
  createTestNotifications
};
