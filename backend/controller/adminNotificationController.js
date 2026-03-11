import Notification from '../models/notificationModel.js';
import User from '../models/Usermodel.js';
import mongoose from 'mongoose';

// Get admin recipient IDs - includes both database admins and a fixed admin ID
const getAdminRecipientIds = async () => {
  const adminUsers = await User.find({ role: 'admin' }).select('_id');
  const adminIds = adminUsers.map(u => u._id);
  
  // Add a fixed "system admin" ObjectId for notifications without a specific recipient
  // This ensures admin notifications work even without database admin users
  const systemAdminId = new mongoose.Types.ObjectId('000000000000000000000001');
  if (!adminIds.some(id => id.toString() === systemAdminId.toString())) {
    adminIds.push(systemAdminId);
  }
  
  return adminIds;
};

// Get notifications for admin
export const getAdminNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    
    // Get all admin recipient IDs
    const adminIds = await getAdminRecipientIds();

    const query = { recipient: { $in: adminIds } };
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
      recipient: { $in: adminIds },
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
    console.error('Get admin notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
};

// Get unread count for admin
export const getAdminUnreadCount = async (req, res) => {
  try {
    const adminIds = await getAdminRecipientIds();

    const count = await Notification.countDocuments({
      recipient: { $in: adminIds },
      read: false
    });

    res.json({
      success: true,
      unreadCount: count
    });
  } catch (error) {
    console.error('Get admin unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count'
    });
  }
};

// Mark notification as read
export const markAdminNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      id,
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
    console.error('Mark admin notification as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
};

// Mark all notifications as read
export const markAllAdminNotificationsAsRead = async (req, res) => {
  try {
    const adminIds = await getAdminRecipientIds();

    await Notification.updateMany(
      { recipient: { $in: adminIds }, read: false },
      { read: true, readAt: new Date() }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all admin notifications as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read'
    });
  }
};

// Delete notification
export const deleteAdminNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndDelete(id);

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
    console.error('Delete admin notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification'
    });
  }
};

// Create test notifications for admin
export const createTestAdminNotifications = async (req, res) => {
  try {
    // Get first admin user or use system admin ID
    let adminUser = await User.findOne({ role: 'admin' });
    const recipientId = adminUser?._id || new mongoose.Types.ObjectId('000000000000000000000001');

    const testNotifications = [
      {
        recipient: recipientId,
        type: 'ticket_created',
        title: 'New Support Ticket',
        message: 'John Doe created a new support ticket: "Issue with property listing"',
        link: '/tickets'
      },
      {
        recipient: recipientId,
        type: 'viewing_request',
        title: 'New Viewing Request',
        message: 'Sarah Smith requested a viewing for "Luxury Villa in East Legon"',
        link: '/appointments'
      },
      {
        recipient: recipientId,
        type: 'new_lead',
        title: 'New User Registration',
        message: 'A new user has registered: michael.brown@email.com',
        link: '/users'
      },
      {
        recipient: recipientId,
        type: 'property_inquiry',
        title: 'Property Inquiry',
        message: 'New inquiry received for "Modern Apartment in Cantonments"',
        link: '/messages'
      },
      {
        recipient: recipientId,
        type: 'system_alert',
        title: 'System Update',
        message: 'Dashboard analytics have been updated with new metrics.',
        link: '/dashboard'
      }
    ];

    await Notification.insertMany(testNotifications);

    res.json({
      success: true,
      message: `Created ${testNotifications.length} test notifications for admin`
    });
  } catch (error) {
    console.error('Create test admin notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create test notifications'
    });
  }
};

export default {
  getAdminNotifications,
  getAdminUnreadCount,
  markAdminNotificationAsRead,
  markAllAdminNotificationsAsRead,
  deleteAdminNotification,
  createTestAdminNotifications
};
