import { useState, useEffect, useRef } from 'react';
import { 
  Search, Send, MoreVertical, Phone, Video, 
  Image as ImageIcon, Paperclip, Smile, ArrowLeft,
  Check, CheckCheck, X, FileText
} from 'lucide-react';
import axios from 'axios';
import { Backendurl } from '../../App';
import NewMessageModal from './NewMessageModal';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import EmojiPicker from 'emoji-picker-react';

const MessagesTab = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [page, setPage] = useState(1);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${Backendurl}/api/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setConversations(response.data.conversations);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    // Poll for new conversations every 30s
    const interval = setInterval(fetchConversations, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation._id);
    }
  }, [activeConversation]);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async (conversationId) => {
    setMessagesLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${Backendurl}/api/chat/conversations/${conversationId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setMessages(response.data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || !activeConversation) return;

    try {
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
        conversationId: activeConversation._id,
        content,
        messageType,
        attachments
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setMessages([...messages, response.data.message]);
        setNewMessage('');
        setSelectedFile(null);
        setFilePreview(null);
        // Update last message in conversation list
        fetchConversations();
      }
    } catch (error) {
      toast.error('Failed to send message');
      setUploading(false);
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

  const handleStartNewConversation = async (selectedUser) => {
    setIsNewMessageModalOpen(false);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${Backendurl}/api/chat/conversations`, {
        participantId: selectedUser._id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const conversation = response.data.conversation;
        setConversations(prev => {
          const exists = prev.find(c => c._id === conversation._id);
          if (exists) return prev;
          return [conversation, ...prev];
        });
        setActiveConversation(conversation);
      }
    } catch (error) {
      toast.error('Failed to start conversation');
    }
  };

  const getOtherParticipant = (conversation) => {
    return conversation.participants.find(p => p._id !== user._id) || conversation.participants[0];
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-[calc(100vh-200px)] bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
      {/* Sidebar - Conversation List */}
      <div className={`w-full md:w-80 border-r border-gray-100 dark:border-gray-700 flex flex-col ${activeConversation ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Messages</h2>
            <button 
              onClick={() => setIsNewMessageModalOpen(true)}
              className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 transition-colors"
            >
              <span className="sr-only">New Message</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-700/50 border-none text-sm focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-500 border-t-transparent"></div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              <p>No conversations yet</p>
              <button 
                  onClick={() => setIsNewMessageModalOpen(true)}
                  className="mt-2 text-purple-600 font-medium hover:underline"
              >
                Start a new chat
              </button>
            </div>
          ) : (
            conversations.map(conv => {
              const otherUser = getOtherParticipant(conv);
              const isActive = activeConversation?._id === conv._id;
              
              return (
                <button
                  key={conv._id}
                  onClick={() => setActiveConversation(conv)}
                  className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-l-4 ${isActive ? 'bg-purple-50 dark:bg-purple-900/10 border-purple-500' : 'border-transparent'}`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                      {otherUser.profileImage ? (
                        <img src={otherUser.profileImage} alt={otherUser.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        otherUser.name?.charAt(0) || 'U'
                      )}
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full border-2 border-white dark:border-gray-800">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate pr-2">
                        {otherUser.name}
                      </h3>
                      {conv.lastMessage && (
                        <span className="text-xs text-gray-400 shrink-0">
                          {formatTime(conv.lastMessage.timestamp)}
                        </span>
                      )}
                    </div>
                    <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                      {conv.lastMessage?.content || 'Start a conversation'}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col h-full bg-gray-50/50 dark:bg-gray-900/50 ${!activeConversation ? 'hidden md:flex' : 'flex'}`}>
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center shadow-sm z-10">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setActiveConversation(null)}
                  className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                   {getOtherParticipant(activeConversation).name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    {getOtherParticipant(activeConversation).name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-xs text-gray-500">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors">
                  <Video className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesLoading ? (
                 <div className="flex justify-center p-8">
                   <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent"></div>
                 </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                    <Send className="w-8 h-8 text-gray-300" />
                  </div>
                  <p>No messages yet. Say hello!</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  // Handle both _id and id fields, convert to string for comparison
                  const currentUserId = String(user?._id || user?.id || '');
                  const senderId = String(msg.sender?._id || msg.sender?.id || '');
                  const isMe = currentUserId && senderId && currentUserId === senderId;
                  const showAvatar = !isMe && (index === 0 || messages[index - 1].sender._id !== msg.sender._id);
                  
                  return (
                    <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} gap-3 group mb-3`}>
                       {/* Receiver avatar - colorful gradient */}
                       {!isMe && (
                         <div className={`w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex-shrink-0 flex items-center justify-center text-sm font-bold text-white shadow-md ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
                           {msg.sender.name?.charAt(0)?.toUpperCase()}
                         </div>
                       )}
                       
                       <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                         {/* Message bubble - DRAMATICALLY different colors */}
                         <div className={`px-4 py-3 rounded-2xl ${
                           isMe 
                             ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-br-sm shadow-lg shadow-emerald-500/20' 
                             : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-600 rounded-bl-sm shadow-sm'
                         }`}>
                           {/* Display attachments */}
                           {msg.attachments && msg.attachments.length > 0 && (
                             <div className="mb-2">
                               {msg.attachments.map((att, idx) => (
                                 att.fileType === 'image' ? (
                                   <a key={idx} href={att.url} target="_blank" rel="noopener noreferrer">
                                     <img 
                                       src={att.url} 
                                       alt={att.filename} 
                                       className="max-w-full rounded-lg max-h-48 object-cover"
                                     />
                                   </a>
                                 ) : (
                                   <a 
                                     key={idx}
                                     href={att.url} 
                                     target="_blank" 
                                     rel="noopener noreferrer"
                                     className={`flex items-center gap-2 p-2 rounded-lg ${isMe ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'}`}
                                   >
                                     <FileText className="w-5 h-5 flex-shrink-0" />
                                     <span className="text-sm truncate">{att.filename}</span>
                                   </a>
                                 )
                               ))}
                             </div>
                           )}
                           {msg.content && <p className="text-sm leading-relaxed">{msg.content}</p>}
                         </div>
                         
                         {/* Timestamp and read status */}
                         <div className={`flex items-center gap-1.5 mt-1.5 px-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                           <span className="text-[11px] text-gray-400 font-medium">{formatTime(msg.createdAt)}</span>
                           {isMe && (
                             <span className="text-emerald-500">
                               {msg.readBy?.length > 1 ? (
                                  <CheckCheck className="w-3.5 h-3.5" />
                               ) : (
                                  <Check className="w-3.5 h-3.5 text-gray-400" />
                               )}
                             </span>
                           )}
                         </div>
                       </div>
                       
                       {/* Sender avatar placeholder for spacing on right side */}
                       {isMe && (
                         <div className="w-9 h-9 flex-shrink-0 opacity-0" />
                       )}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
              {/* File Preview */}
              {selectedFile && (
                <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl flex items-center gap-3">
                  {filePreview ? (
                    <img src={filePreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg" />
                  ) : (
                    <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                      <FileText className="w-8 h-8 text-purple-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button
                    type="button"
                    onClick={removeSelectedFile}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex items-center gap-4">
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
                  className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-full transition-colors"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="w-full pl-4 pr-10 py-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border-none outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 p-1 rounded-full transition-colors"
                  >
                    <Smile className="w-5 h-5" />
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
                  type="submit"
                  disabled={(!newMessage.trim() && !selectedFile) || uploading}
                  className="p-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:hover:bg-purple-600 transition-all shadow-lg shadow-purple-200 dark:shadow-purple-900/20"
                >
                  {uploading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin block" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center">
            <div className="w-24 h-24 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-6">
              <Send className="w-10 h-10 text-purple-300 dark:text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Select a conversation</h3>
            <p className="max-w-xs">Choose a conversation from the sidebar or start a new message to begin chatting.</p>
          </div>
        )}
      </div>

      <NewMessageModal
        isOpen={isNewMessageModalOpen}
        onClose={() => setIsNewMessageModalOpen(false)}
        onSelectUser={handleStartNewConversation}
      />
    </div>
  );
};

export default MessagesTab;
