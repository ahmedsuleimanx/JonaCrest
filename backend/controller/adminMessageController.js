import Message from '../models/messageModel.js';
import Conversation from '../models/conversationModel.js';
import User from '../models/Usermodel.js';
import mongoose from 'mongoose';

// Get all conversations for admin
export const getAdminConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find()
      .populate('participants', 'name email profileImage')
      .populate('lastMessage')
      .sort({ updatedAt: -1 })
      .lean();

    // Format conversations for admin view
    const formattedConversations = conversations.map(conv => {
      // Find the non-admin participant (user)
      const user = conv.participants?.find(p => p.role !== 'admin') || conv.participants?.[0];
      
      return {
        _id: conv._id,
        user: user || { name: 'Unknown User', email: '' },
        lastMessage: conv.lastMessage?.content || 'No messages yet',
        unreadCount: conv.unreadCount || 0,
        updatedAt: conv.updatedAt,
        participants: conv.participants
      };
    });

    res.json({
      success: true,
      conversations: formattedConversations
    });
  } catch (error) {
    console.error('Get admin conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations'
    });
  }
};

// Get messages for a conversation (admin)
export const getAdminMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await Message.find({ 
      conversation: conversationId,
      isDeleted: false 
    })
      .populate('sender', 'name email profileImage role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    // Reverse to get chronological order
    messages.reverse();

    res.json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Get admin messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
};

// Send message as admin
export const sendAdminMessage = async (req, res) => {
  try {
    const { conversationId, content, messageType = 'text' } = req.body;

    if (!conversationId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Conversation ID and content are required'
      });
    }

    // Find an admin user to attribute the message to
    let adminUser = await User.findOne({ role: 'admin' });
    
    // If no admin user exists, create a system admin ID
    const senderId = adminUser?._id || new mongoose.Types.ObjectId('000000000000000000000001');

    const message = new Message({
      conversation: conversationId,
      sender: senderId,
      content,
      messageType
    });

    await message.save();

    // Update conversation's last message
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      updatedAt: new Date()
    });

    // Populate sender for response
    await message.populate('sender', 'name email profileImage role');

    res.status(201).json({
      success: true,
      message: message
    });
  } catch (error) {
    console.error('Send admin message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
};

// Mark conversation as read (admin)
export const markConversationRead = async (req, res) => {
  try {
    const { conversationId } = req.params;

    await Conversation.findByIdAndUpdate(conversationId, {
      unreadCount: 0
    });

    res.json({
      success: true,
      message: 'Conversation marked as read'
    });
  } catch (error) {
    console.error('Mark conversation read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark as read'
    });
  }
};

export default {
  getAdminConversations,
  getAdminMessages,
  sendAdminMessage,
  markConversationRead
};
