import Conversation from '../models/conversationModel.js';
import Message from '../models/messageModel.js';
import User from '../models/Usermodel.js';
import { createNotificationHelper } from './notificationController.js';
import cloudinary from '../config/cloudinary.js';

// Get or create conversation between two users
export const getOrCreateConversation = async (req, res) => {
  try {
    const { participantId, propertyId, type = 'direct' } = req.body;
    const userId = req.user._id;

    if (!participantId) {
      return res.status(400).json({
        success: false,
        message: 'Participant ID is required'
      });
    }

    // Check if participant exists
    const participant = await User.findById(participantId);
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check for existing conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [userId, participantId] },
      type,
      ...(propertyId && { property: propertyId })
    }).populate('participants', 'name email role profileImage');

    if (!conversation) {
      conversation = new Conversation({
        participants: [userId, participantId],
        type,
        property: propertyId || null,
        unreadCount: new Map([[participantId.toString(), 0], [userId.toString(), 0]])
      });
      await conversation.save();
      await conversation.populate('participants', 'name email role profileImage');
    }

    res.json({
      success: true,
      conversation
    });
  } catch (error) {
    console.error('Get/create conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get or create conversation'
    });
  }
};

// Get all conversations for current user
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    const conversations = await Conversation.find({
      participants: userId,
      isActive: true
    })
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('participants', 'name email role profileImage')
      .populate('property', 'title images')
      .lean();

    // Add unread count for current user
    const conversationsWithUnread = conversations.map(conv => ({
      ...conv,
      unreadCount: conv.unreadCount?.[userId.toString()] || 0
    }));

    const total = await Conversation.countDocuments({
      participants: userId,
      isActive: true
    });

    res.json({
      success: true,
      conversations: conversationsWithUnread,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations'
    });
  }
};

// Get messages for a conversation
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user._id;

    // Verify user is participant and populate participants for frontend display
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    })
      .populate('participants', 'name email role profileImage')
      .populate('property', 'title images');

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    const messages = await Message.find({
      conversation: conversationId,
      isDeleted: false
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('sender', 'name email role profileImage')
      .lean();

    const total = await Message.countDocuments({
      conversation: conversationId,
      isDeleted: false
    });

    // Mark messages as read
    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: userId },
        'readBy.user': { $ne: userId }
      },
      {
        $push: { readBy: { user: userId, readAt: new Date() } }
      }
    );

    // Reset unread count for this user
    if (conversation.unreadCount) {
      conversation.unreadCount.set(userId.toString(), 0);
      await conversation.save();
    }

    // Return conversation as plain object with unread count for current user
    const conversationObj = conversation.toObject();
    conversationObj.unreadCount = conversation.unreadCount?.get(userId.toString()) || 0;

    res.json({
      success: true,
      messages: messages.reverse(), // Return in chronological order
      conversation: conversationObj, // Include conversation with participants for header display
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
};

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, content, messageType = 'text', attachments } = req.body;
    const userId = req.user._id;

    // Verify user is participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    }).populate('participants', 'name email');

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    const message = new Message({
      conversation: conversationId,
      sender: userId,
      content,
      messageType,
      attachments: attachments || [],
      readBy: [{ user: userId, readAt: new Date() }]
    });

    await message.save();
    await message.populate('sender', 'name email role profileImage');

    // Update conversation
    conversation.lastMessage = {
      content: content.substring(0, 100),
      sender: userId,
      timestamp: new Date()
    };

    // Increment unread count for other participants
    conversation.participants.forEach(participant => {
      if (participant._id.toString() !== userId.toString()) {
        const currentCount = conversation.unreadCount?.get(participant._id.toString()) || 0;
        conversation.unreadCount.set(participant._id.toString(), currentCount + 1);
      }
    });

    await conversation.save();

    // Send notification to other participants
    const otherParticipants = conversation.participants.filter(
      p => p._id.toString() !== userId.toString()
    );

    for (const participant of otherParticipants) {
      await createNotificationHelper(
        participant._id,
        'message_received',
        'New Message',
        `${req.user.name}: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
        { conversationId, messageId: message._id },
        `/messages/${conversationId}`
      );
    }

    res.status(201).json({
      success: true,
      message: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
};

// Mark messages as read
export const markMessagesAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    // Verify user is participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: userId },
        'readBy.user': { $ne: userId }
      },
      {
        $push: { readBy: { user: userId, readAt: new Date() } }
      }
    );

    // Reset unread count
    if (conversation.unreadCount) {
      conversation.unreadCount.set(userId.toString(), 0);
      await conversation.save();
    }

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Mark messages as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read'
    });
  }
};

// Delete a message (soft delete)
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findOne({
      _id: messageId,
      sender: userId
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or unauthorized'
      });
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    message.content = 'This message was deleted';
    await message.save();

    res.json({
      success: true,
      message: 'Message deleted'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message'
    });
  }
};

// Update/Edit a message
export const updateMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    const message = await Message.findOne({
      _id: messageId,
      sender: userId
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or unauthorized'
      });
    }

    if (message.isDeleted) {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit a deleted message'
      });
    }

    message.content = content.trim();
    message.isEdited = true;
    message.editedAt = new Date();
    await message.save();

    // Populate sender info for response
    await message.populate('sender', 'name email role profileImage');

    res.json({
      success: true,
      message: message
    });
  } catch (error) {
    console.error('Update message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update message'
    });
  }
};

// Get unread message count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: userId,
      isActive: true
    });

    let totalUnread = 0;
    conversations.forEach(conv => {
      totalUnread += conv.unreadCount?.get(userId.toString()) || 0;
    });

    res.json({
      success: true,
      unreadCount: totalUnread
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unread count'
    });
  }
};

// Search users to start conversation
export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    const userId = req.user._id;

    if (!q || q.length < 2) {
      return res.json({
        success: true,
        users: []
      });
    }

    const users = await User.find({
      _id: { $ne: userId },
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    })
      .select('name email role profileImage')
      .limit(10)
      .lean();

    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search users'
    });
  }
};

// Upload attachment for chat
export const uploadAttachment = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided'
      });
    }

    // Determine resource type based on file mimetype
    let resourceType = 'auto';
    const fileType = req.file.mimetype.split('/')[0];
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'chat_attachments',
      resource_type: resourceType,
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'],
      max_bytes: 10485760 // 10MB max
    });

    res.json({
      success: true,
      attachment: {
        filename: req.file.originalname,
        url: result.secure_url,
        fileType: fileType,
        size: req.file.size,
        publicId: result.public_id
      }
    });
  } catch (error) {
    console.error('Upload attachment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload attachment'
    });
  }
};

export default {
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
};
