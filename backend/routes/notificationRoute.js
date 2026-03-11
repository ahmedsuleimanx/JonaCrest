import express from 'express';
import {
  createNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead,
  createTestNotifications
} from '../controller/notificationController.js';
import authMiddleware from '../middleware/authmiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get notifications for current user
router.get('/', getNotifications);

// Get unread count
router.get('/unread-count', getUnreadCount);

// Create notification (internal/admin use)
router.post('/', createNotification);

// Mark single notification as read
router.patch('/:id/read', markAsRead);

// Mark all notifications as read
router.patch('/read-all', markAllAsRead);

// Delete single notification
router.delete('/:id', deleteNotification);

// Delete all read notifications
router.delete('/read', deleteAllRead);

// Create test notifications (for testing)
router.post('/test', createTestNotifications);

export default router;
