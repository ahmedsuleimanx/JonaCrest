import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, X, Check, CheckCheck, Trash2, MessageSquare, Calendar,
  Home, AlertCircle, CreditCard, Star, Users, Eye, Clock,
  ChevronRight, BellOff, Loader2
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { backendurl } from '../config/constants';

const NOTIFICATION_ICONS = {
  ticket_created: { icon: AlertCircle, color: 'text-blue-500', bg: 'bg-blue-100' },
  ticket_updated: { icon: AlertCircle, color: 'text-blue-500', bg: 'bg-blue-100' },
  ticket_response: { icon: MessageSquare, color: 'text-purple-500', bg: 'bg-purple-100' },
  message_received: { icon: MessageSquare, color: 'text-indigo-500', bg: 'bg-indigo-100' },
  viewing_request: { icon: Calendar, color: 'text-amber-500', bg: 'bg-amber-100' },
  viewing_confirmed: { icon: Check, color: 'text-green-500', bg: 'bg-green-100' },
  viewing_cancelled: { icon: X, color: 'text-red-500', bg: 'bg-red-100' },
  property_alert: { icon: Home, color: 'text-teal-500', bg: 'bg-teal-100' },
  payment_received: { icon: CreditCard, color: 'text-emerald-500', bg: 'bg-emerald-100' },
  system_alert: { icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-100' },
  new_lead: { icon: Users, color: 'text-cyan-500', bg: 'bg-cyan-100' },
  property_inquiry: { icon: Eye, color: 'text-violet-500', bg: 'bg-violet-100' },
  review_received: { icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-100' },
};

const NotificationDropdown = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);
  const pollIntervalRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${backendurl}/api/admin/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 10 }
      });

      if (response.data.success) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unreadCount);
        setError(null);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(`${backendurl}/api/admin/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setUnreadCount(response.data.unreadCount);
      }
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    pollIntervalRef.current = setInterval(fetchUnreadCount, 30000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [fetchNotifications, fetchUnreadCount]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      fetchNotifications();
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${backendurl}/api/admin/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${backendurl}/api/admin/notifications/read-all`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const deleteNotification = async (notificationId, e) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${backendurl}/api/admin/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const deletedNotification = notifications.find(n => n._id === notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const getNotificationRoute = (notification) => {
    // Map notification types to appropriate admin routes
    const routeMap = {
      ticket_created: '/tickets',
      ticket_updated: '/tickets',
      ticket_response: '/tickets',
      message_received: '/messages',
      viewing_request: '/appointments',
      viewing_confirmed: '/appointments',
      viewing_cancelled: '/appointments',
      property_alert: '/properties',
      property_inquiry: '/properties',
      payment_received: '/dashboard',
      system_alert: '/dashboard',
      new_lead: '/users',
      review_received: '/properties',
    };

    // If notification has a specific link, transform it to admin routes
    if (notification.link) {
      const link = notification.link;
      
      // Transform ticket links (handles /admin/tickets/:id, /dashboard/tickets, /tickets/:id)
      if (link.includes('ticket')) {
        return '/tickets';
      }
      // Transform viewing/appointment links
      if (link.includes('viewing') || link.includes('appointment')) {
        return '/appointments';
      }
      // Transform message links
      if (link.includes('message')) {
        return '/messages';
      }
      // Transform user links
      if (link.includes('user')) {
        return '/users';
      }
      // Transform property links
      if (link.includes('propert')) {
        return '/properties';
      }
    }

    // Fallback to route map based on notification type
    return routeMap[notification.type] || '/dashboard';
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }
    
    const route = getNotificationRoute(notification);
    navigate(route);
    setIsOpen(false);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getNotificationStyle = (type) => {
    return NOTIFICATION_ICONS[type] || { 
      icon: Bell, 
      color: 'text-gray-500', 
      bg: 'bg-gray-100' 
    };
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggle}
        className="relative w-10 h-10 glass-card flex items-center justify-center cursor-pointer"
        style={{ borderRadius: '12px', padding: 0 }}
      >
        <Bell className="w-5 h-5 text-gray-500" />
        
        {/* Unread Badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold text-white bg-red-500 rounded-full shadow-lg"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-96 max-h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  <h3 className="font-semibold">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-xs bg-white/20 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs font-medium hover:underline flex items-center gap-1"
                  >
                    <CheckCheck className="w-4 h-4" />
                    Mark all read
                  </button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-[380px] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Loading notifications...</p>
                </div>
              ) : error ? (
                <div className="p-6 text-center">
                  <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">{error}</p>
                  <button
                    onClick={fetchNotifications}
                    className="mt-2 text-blue-500 text-sm font-medium hover:underline"
                  >
                    Try again
                  </button>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BellOff className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">
                    No notifications yet
                  </h4>
                  <p className="text-sm text-gray-500">
                    We'll notify you when something arrives
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => {
                    const style = getNotificationStyle(notification.type);
                    const IconComponent = style.icon;

                    return (
                      <motion.div
                        key={notification._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors group ${
                          !notification.read ? 'bg-blue-50/50' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex gap-3">
                          {/* Icon */}
                          <div className={`w-10 h-10 rounded-xl ${style.bg} flex items-center justify-center flex-shrink-0`}>
                            <IconComponent className={`w-5 h-5 ${style.color}`} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-sm font-medium ${
                                !notification.read 
                                  ? 'text-gray-900' 
                                  : 'text-gray-700'
                              }`}>
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                              )}
                            </div>
                            <p className="text-sm text-gray-500 line-clamp-2 mt-0.5">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTime(notification.createdAt)}
                              </span>
                              <button
                                onClick={(e) => deleteNotification(notification._id, e)}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded-lg transition-all"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={() => {
                    navigate('/notifications');
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                >
                  View all notifications
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;
