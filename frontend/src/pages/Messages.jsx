import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { 
  Send, Search, Plus, MessageSquare, 
  CheckCheck, Paperclip, Smile,
  MoreVertical, ArrowLeft, Pencil, Trash2, X, FileText
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Backendurl } from '../App';
import { useAuth } from '../context/AuthContext';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardFooter from '../components/dashboard/DashboardFooter';
import EmojiPicker from 'emoji-picker-react';

const Messages = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { conversationId: urlConversationId } = useParams();
  useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showMobileList, setShowMobileList] = useState(true);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [messageMenuId, setMessageMenuId] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    // Wait for auth loading to complete before checking user
    if (authLoading) return;
    
    if (!user) {
      navigate('/login');
      return;
    }
    fetchConversations();
  }, [user, authLoading, navigate]);

  // Auto-select conversation from URL parameter
  useEffect(() => {
    if (urlConversationId && conversations.length > 0 && !selectedConversation) {
      const conv = conversations.find(c => c._id === urlConversationId);
      if (conv) {
        setSelectedConversation(conv);
      } else {
        // Conversation not in list, fetch it directly
        fetchConversationById(urlConversationId);
      }
    }
  }, [urlConversationId, conversations, selectedConversation]);

  // Fetch a specific conversation by ID (when coming from notification)
  const fetchConversationById = async (convId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${Backendurl}/api/chat/conversations/${convId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        // Set both conversation and messages for proper header/chat display
        if (response.data.conversation) {
          setSelectedConversation(response.data.conversation);
        }
        setMessages(response.data.messages);
        setShowMobileList(false);
      }
    } catch (error) {
      console.error('Failed to fetch conversation:', error);
      toast.error('Failed to load conversation');
    }
  };

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
      setShowMobileList(false);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${Backendurl}/api/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setConversations(response.data.conversations);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${Backendurl}/api/chat/conversations/${conversationId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setMessages(response.data.messages);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const sendMessageHandler = async () => {
    if ((!newMessage.trim() && !selectedFile) || !selectedConversation) return;

    try {
      setSendingMessage(true);
      const token = localStorage.getItem('token');
      let attachments = [];

      // Upload file if selected
      if (selectedFile) {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        const uploadResponse = await axios.post(`${Backendurl}/api/chat/upload`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        
        if (uploadResponse.data.success) {
          attachments = [uploadResponse.data.attachment];
        }
        setUploading(false);
      }

      const messageType = attachments.length > 0 ? (attachments[0].fileType === 'image' ? 'image' : 'file') : 'text';
      const content = newMessage.trim() || (attachments[0]?.filename || 'Attachment');

      const response = await axios.post(`${Backendurl}/api/chat/messages`, {
        conversationId: selectedConversation._id,
        content,
        messageType,
        attachments
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setMessages(prev => [...prev, response.data.message]);
        setNewMessage('');
        setSelectedFile(null);
        setFilePreview(null);
        fetchConversations(); // Update last message in list
      }
    } catch (err) {
      console.error('Send message error:', err);
      toast.error('Failed to send message');
      setUploading(false);
    } finally {
      setSendingMessage(false);
    }
  };

  // Handle emoji selection
  const onEmojiClick = (emojiData) => {
    setNewMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setFilePreview(e.target.result);
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  // Remove selected file
  const removeSelectedFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Edit a message
  const handleEditMessage = async (messageId) => {
    if (!editContent.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${Backendurl}/api/chat/messages/${messageId}`, {
        content: editContent
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setMessages(prev => prev.map(msg => 
          msg._id === messageId 
            ? { ...msg, content: editContent, isEdited: true }
            : msg
        ));
        setEditingMessageId(null);
        setEditContent('');
        toast.success('Message updated');
      }
    } catch (err) {
      console.error('Update message error:', err);
      toast.error('Failed to update message');
    }
  };

  // Delete a message
  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${Backendurl}/api/chat/messages/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setMessages(prev => prev.map(msg => 
          msg._id === messageId 
            ? { ...msg, content: 'This message was deleted', isDeleted: true }
            : msg
        ));
        setMessageMenuId(null);
        toast.success('Message deleted');
      }
    } catch (err) {
      console.error('Delete message error:', err);
      toast.error('Failed to delete message');
    }
  };

  // Start editing a message
  const startEditMessage = (msg) => {
    setEditingMessageId(msg._id);
    setEditContent(msg.content);
    setMessageMenuId(null);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditContent('');
  };

  const searchUsers = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${Backendurl}/api/chat/users/search?q=${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setSearchResults(response.data.users);
      }
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  const startConversation = async (participantId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${Backendurl}/api/chat/conversations`, {
        participantId,
        type: 'direct'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setSelectedConversation(response.data.conversation);
        setShowNewChat(false);
        fetchConversations();
      }
    } catch (err) {
      console.error('Start conversation error:', err);
      toast.error('Failed to start conversation');
    }
  };

  const getOtherParticipant = (conversation) => {
    if (!conversation?.participants || !user) return null;
    return conversation.participants.find(p => String(p._id) !== String(user._id)) || conversation.participants[0];
  };

  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / 86400000);
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: 'bg-purple-100 text-purple-700',
      landlord: 'bg-emerald-100 text-emerald-700',
      agent: 'bg-amber-100 text-amber-700',
      tenant: 'bg-blue-100 text-blue-700'
    };
    return badges[role] || 'bg-gray-100 text-gray-700';
  };

  // Show loading state while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <DashboardHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading...</p>
          </div>
        </main>
        <DashboardFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DashboardHeader />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-[calc(100vh-200px)] flex overflow-hidden">
          {/* Conversations Sidebar */}
          <div className={`w-full md:w-80 lg:w-96 border-r border-gray-100 flex flex-col ${!showMobileList ? 'hidden md:flex' : 'flex'}`}>
            {/* Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Messages</h2>
                <button
                  onClick={() => setShowNewChat(true)}
                  className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="animate-pulse flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full" />
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No conversations yet</p>
                  <button
                    onClick={() => setShowNewChat(true)}
                    className="mt-3 text-emerald-600 font-medium text-sm hover:text-emerald-700"
                  >
                    Start a conversation
                  </button>
                </div>
              ) : (
                conversations.map((conv) => {
                  const other = getOtherParticipant(conv);
                  const isSelected = selectedConversation?._id === conv._id;
                  
                  return (
                    <div
                      key={conv._id}
                      onClick={() => setSelectedConversation(conv)}
                      className={`p-4 cursor-pointer transition-colors border-b border-gray-50 ${
                        isSelected ? 'bg-emerald-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-medium overflow-hidden">
                            {other?.profileImage ? (
                              <img src={other.profileImage} alt={other.name} className="w-full h-full object-cover" />
                            ) : (
                              getInitials(other?.name)
                            )}
                          </div>
                          {conv.unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-white">
                              {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900 truncate">{other?.name || 'Unknown'}</h4>
                            {conv.lastMessage?.timestamp && (
                              <span className="text-xs text-gray-400">
                                {formatMessageTime(conv.lastMessage.timestamp)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-1.5 py-0.5 rounded capitalize ${getRoleBadge(other?.role)}`}>
                              {other?.role}
                            </span>
                            {conv.lastMessage?.content && (
                              <p className="text-sm text-gray-500 truncate">
                                {conv.lastMessage.content}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`flex-1 flex flex-col ${showMobileList ? 'hidden md:flex' : 'flex'}`}>
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-100 flex items-center gap-4">
                  <button
                    onClick={() => setShowMobileList(true)}
                    className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-medium overflow-hidden">
                    {getOtherParticipant(selectedConversation)?.profileImage ? (
                      <img src={getOtherParticipant(selectedConversation).profileImage} alt={getOtherParticipant(selectedConversation).name} className="w-full h-full object-cover" />
                    ) : (
                      getInitials(getOtherParticipant(selectedConversation)?.name)
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {getOtherParticipant(selectedConversation)?.name}
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span className={`text-xs px-2 py-0.5 rounded capitalize ${getRoleBadge(getOtherParticipant(selectedConversation)?.role)}`}>
                        {getOtherParticipant(selectedConversation)?.role}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg, idx) => {
                    const currentUserId = String(user?._id || user?.id || '');
                    const senderId = String(msg.sender?._id || msg.sender?.id || '');
                    const isOwn = currentUserId && senderId && currentUserId === senderId;
                    const isMe = isOwn; // For legacy/lint compatibility if used
                    const isEditing = editingMessageId === msg._id;
                    const showMenu = messageMenuId === msg._id;
                    
                    return (
                      <motion.div
                        key={msg._id || idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}
                      >
                        {/* Receiver avatar for non-own messages */}
                        {!isOwn && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-medium mr-2 flex-shrink-0">
                            {msg.sender?.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                        )}
                        
                        <div className={`max-w-[70%] relative ${isOwn ? 'order-2' : ''}`}>
                          {/* Message bubble */}
                          {isEditing ? (
                            // Edit mode
                            <div className="flex flex-col gap-2">
                              <textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="px-4 py-2 border border-emerald-300 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none text-sm"
                                rows={2}
                                autoFocus
                              />
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={cancelEdit}
                                  className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleEditMessage(msg._id)}
                                  className="px-3 py-1 text-xs bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-colors"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            // Normal message view
                            <>
                              <div className={`px-4 py-2 rounded-2xl shadow-sm ${
                                msg.isDeleted
                                  ? 'bg-gray-200 text-gray-500 italic'
                                  : isOwn 
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-br-none shadow-md shadow-emerald-500/20'
                                    : 'bg-white border border-gray-100 text-gray-900 rounded-bl-none shadow-sm'
                              }`}>
                                {msg.attachments && msg.attachments.length > 0 && (
                                  <div className="mb-2">
                                    {msg.attachments.map((att, idx) => (
                                      att.fileType === 'image' ? (
                                        <a key={idx} href={att.url} target="_blank" rel="noopener noreferrer" className="block">
                                          <img 
                                            src={att.url} 
                                            alt={att.filename} 
                                            className="max-w-full rounded-lg max-h-64 object-cover hover:opacity-90 transition-opacity"
                                          />
                                        </a>
                                      ) : (
                                        <a 
                                          key={idx}
                                          href={att.url} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className={`flex items-center gap-2 p-2 rounded-lg ${isMe ? 'bg-white/20' : 'bg-gray-100'}`}
                                        >
                                          <FileText className="w-5 h-5 flex-shrink-0" />
                                          <span className="text-sm truncate font-medium">{att.filename}</span>
                                        </a>
                                      )
                                    ))}
                                  </div>
                                )}
                                {msg.content && <p className="text-sm leading-relaxed">{msg.content}</p>}
                                {msg.isEdited && !msg.isDeleted && (
                                  <span className="text-xs opacity-70 ml-2">(edited)</span>
                                )}
                              </div>
                              
                              {/* Message menu for own messages */}
                              {isOwn && !msg.isDeleted && (
                                <div className="absolute top-0 right-full mr-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => setMessageMenuId(showMenu ? null : msg._id)}
                                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                  >
                                    <MoreVertical className="w-4 h-4 text-gray-400" />
                                  </button>
                                  
                                  {/* Dropdown menu */}
                                  {showMenu && (
                                    <div className="absolute top-full right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
                                      <button
                                        onClick={() => startEditMessage(msg)}
                                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                      >
                                        <Pencil className="w-3.5 h-3.5" />
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => handleDeleteMessage(msg._id)}
                                        className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Delete
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </>
                          )}
                          
                          {/* Timestamp and read status */}
                          <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : ''}`}>
                            <span className="text-xs text-gray-400">
                              {formatMessageTime(msg.createdAt)}
                            </span>
                            {isOwn && !msg.isDeleted && (
                              <CheckCheck className="w-3 h-3 text-emerald-500" />
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-100">
                  {/* File Preview */}
                  {selectedFile && (
                    <div className="mb-3 p-3 bg-gray-50 rounded-xl flex items-center gap-3">
                      {filePreview ? (
                        <img src={filePreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg" />
                      ) : (
                        <div className="w-16 h-16 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-8 h-8 text-emerald-500" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <button
                        type="button"
                        onClick={removeSelectedFile}
                        className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {/* Hidden file input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileSelect}
                      accept="image/*,.pdf,.doc,.docx,.txt"
                      className="hidden"
                    />
                    
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Paperclip className="w-5 h-5 text-gray-400" />
                    </button>
                    
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessageHandler()}
                        placeholder="Type a message..."
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-full focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <Smile className="w-5 h-5 text-gray-400" />
                      </button>
                      
                      {/* Emoji Picker Dropdown */}
                      {showEmojiPicker && (
                        <div className="absolute bottom-full right-0 mb-2 z-50">
                          <EmojiPicker 
                            onEmojiClick={onEmojiClick}
                            width={300}
                            height={400}
                            previewConfig={{ showPreview: false }}
                          />
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={sendMessageHandler}
                      disabled={(!newMessage.trim() && !selectedFile) || sendingMessage || uploading}
                      className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full hover:opacity-90 disabled:opacity-50 transition-opacity"
                    >
                      {sendingMessage || uploading ? (
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin block" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                  <p className="text-gray-500">Choose a conversation from the list or start a new one</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <DashboardFooter />

      {/* New Chat Modal */}
      <AnimatePresence>
        {showNewChat && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-md"
            >
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">New Conversation</h2>
                  <button onClick={() => setShowNewChat(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    searchUsers(e.target.value);
                  }}
                  placeholder="Search for users..."
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />
                <div className="mt-4 max-h-64 overflow-y-auto">
                  {searchResults.map((u) => (
                    <div
                      key={u._id}
                      onClick={() => startConversation(u._id)}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-medium">
                        {getInitials(u.name)}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{u.name}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded capitalize ${getRoleBadge(u.role)}`}>
                          {u.role}
                        </span>
                      </div>
                    </div>
                  ))}
                  {searchQuery.length >= 2 && searchResults.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No users found</p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Messages;
