import express from 'express';
import multer from 'multer';
import path from 'path';
import { 
  getAdminStats,
  getAllAppointments,
  updateAppointmentStatus,
  getAllUsers,
  getUserById,
  updateUserByAdmin,
  deleteUser
} from '../controller/adminController.js';
import {
  getAdminNotifications,
  getAdminUnreadCount,
  markAdminNotificationAsRead,
  markAllAdminNotificationsAsRead,
  deleteAdminNotification,
  createTestAdminNotifications
} from '../controller/adminNotificationController.js';
import {
  getAllTicketsAdmin,
  getTicketAdmin,
  updateTicketAdmin,
  addResponseAdmin
} from '../controller/adminTicketController.js';
import {
  getAdminConversations,
  getAdminMessages,
  sendAdminMessage,
  markConversationRead
} from '../controller/adminMessageController.js';
import {
  getAdminSettings,
  updateAdminSettings,
  updateAdminPassword,
  uploadAdminAvatar
} from '../controller/adminSettingsController.js';
import adminAuth from '../middleware/adminAuth.js';

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `admin-avatar-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, GIF, and WebP are allowed.'), false);
    }
  }
});

const router = express.Router();

// Stats - Admin only
router.get('/stats', adminAuth, getAdminStats);

// Appointments - Admin only
router.get('/appointments', adminAuth, getAllAppointments);
router.put('/appointments/status', adminAuth, updateAppointmentStatus);

// User management - Admin only
router.get('/users', adminAuth, getAllUsers);
router.get('/users/:userId', adminAuth, getUserById);
router.put('/users/:userId', adminAuth, updateUserByAdmin);
router.delete('/users/:userId', adminAuth, deleteUser);

// Admin Notifications
router.get('/notifications', adminAuth, getAdminNotifications);
router.get('/notifications/unread-count', adminAuth, getAdminUnreadCount);
router.patch('/notifications/:id/read', adminAuth, markAdminNotificationAsRead);
router.patch('/notifications/read-all', adminAuth, markAllAdminNotificationsAsRead);
router.delete('/notifications/:id', adminAuth, deleteAdminNotification);
router.post('/notifications/test', adminAuth, createTestAdminNotifications);

// Admin Tickets
router.get('/tickets', adminAuth, getAllTicketsAdmin);
router.get('/tickets/:id', adminAuth, getTicketAdmin);
router.patch('/tickets/:id', adminAuth, updateTicketAdmin);
router.post('/tickets/:id/responses', adminAuth, addResponseAdmin);

// Admin Messages
router.get('/conversations', adminAuth, getAdminConversations);
router.get('/conversations/:conversationId/messages', adminAuth, getAdminMessages);
router.post('/messages', adminAuth, sendAdminMessage);
router.patch('/conversations/:conversationId/read', adminAuth, markConversationRead);

// Admin Settings
router.get('/settings', adminAuth, getAdminSettings);
router.put('/settings', adminAuth, updateAdminSettings);
router.put('/settings/password', adminAuth, updateAdminPassword);
router.post('/settings/avatar', adminAuth, upload.single('avatar'), uploadAdminAvatar);

export default router;