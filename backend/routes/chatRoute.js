import express from 'express';
import multer from 'multer';
import {
  getOrCreateConversation,
  getConversations,
  getMessages,
  sendMessage,
  markMessagesAsRead,
  deleteMessage,
  updateMessage,
  getUnreadCount,
  searchUsers,
  uploadAttachment
} from '../controller/chatController.js';
import authMiddleware from '../middleware/authmiddleware.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 
                          'application/pdf', 'application/msword', 
                          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                          'text/plain'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// All routes require authentication
router.use(authMiddleware);

// Search users to start conversation
router.get('/users/search', searchUsers);

// Get unread message count
router.get('/unread-count', getUnreadCount);

// Get all conversations
router.get('/conversations', getConversations);

// Get or create conversation
router.post('/conversations', getOrCreateConversation);

// Get messages for a conversation
router.get('/conversations/:conversationId/messages', getMessages);

// Upload file attachment
router.post('/upload', upload.single('file'), uploadAttachment);

// Send a message
router.post('/messages', sendMessage);

// Mark messages as read
router.patch('/conversations/:conversationId/read', markMessagesAsRead);

// Update a message
router.put('/messages/:messageId', updateMessage);

// Delete a message
router.delete('/messages/:messageId', deleteMessage);

export default router;

