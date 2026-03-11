import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, Check, CheckCheck, Trash2, MessageSquare, Calendar,
  Home, AlertCircle, CreditCard, Star, Users, Eye, Clock,
  Filter, Search, RefreshCw, BellOff, Loader2
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { backendurl } from '../config/constants';
import toast from 'react-hot-toast';

const NOTIFICATION_ICONS = {
  ticket_created: { icon: AlertCircle, color: 'text-blue-500', bg: 'bg-blue-100' },
  ticket_updated: { icon: AlertCircle, color: 'text-blue-500', bg: 'bg-blue-100' },
  ticket_response: { icon: MessageSquare, color: 'text-purple-500', bg: 'bg-purple-100' },
  message_received: { icon: MessageSquare, color: 'text-indigo-500', bg: 'bg-indigo-100' },
  viewing_request: { icon: Calendar, color: 'text-amber-500', bg: 'bg-amber-100' },
  viewing_confirmed: { icon: Check, color: 'text-green-500', bg: 'bg-green-100' },
  viewing_cancelled: { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-100' },
  property_alert: { icon: Home, color: 'text-teal-500', bg: 'bg-teal-100' },
  payment_received: { icon: CreditCard, color: 'text-emerald-500', bg: 'bg-emerald-100' },
  system_alert: { icon: AlertCircle, color: 'text-orange-500', bg: 'bg-orange-100' },
  new_lead: { icon: Users, color: 'text-cyan-500', bg: 'bg-cyan-100' },
  property_inquiry: { icon: Eye, color: 'text-violet-500', bg: 'bg-violet-100' },
  review_received: { icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-100' },
};

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [searchTerm, setSearchTerm] = useState('');

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${backendurl}/api/admin/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 100 }
      });

      if (response.data.success) {
        setNotifications(response.data.notifications);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

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
      toast.success('All notifications marked as read');
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${backendurl}/api/admin/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      toast.success('Notification deleted');
    } catch (err) {
      console.error('Failed to delete notification:', err);
      toast.error('Failed to delete notification');
    }
  };

  const getNotificationRoute = (notification) => {
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
      if (link.includes('ticket')) return '/tickets';
      // Transform viewing/appointment links
      if (link.includes('viewing') || link.includes('appointment')) return '/appointments';
      // Transform message links
      if (link.includes('message')) return '/messages';
      // Transform user links
      if (link.includes('user')) return '/users';
      // Transform property links
      if (link.includes('propert')) return '/properties';
    }

    return routeMap[notification.type] || '/dashboard';
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }
    const route = getNotificationRoute(notification);
    navigate(route);
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

  const filteredNotifications = notifications.filter(n => {
    const matchesFilter = filter === 'all' || 
      (filter === 'unread' && !n.read) || 
      (filter === 'read' && n.read);
    
    const matchesSearch = !searchTerm || 
      n.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.message?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-500 mt-1">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchNotifications}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className="w-5 h-5 text-gray-500" />
            </button>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
              >
                <CheckCheck className="w-4 h-4" />
                Mark all read
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search notifications..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div className="flex items-center gap-2">
            {['all', 'unread', 'read'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  filter === f
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-3" />
            <p className="text-gray-500">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BellOff className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-500">
              {filter !== 'all' 
                ? `No ${filter} notifications found` 
                : "You're all caught up!"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            <AnimatePresence>
              {filteredNotifications.map((notification) => {
                const style = getNotificationStyle(notification.type);
                const IconComponent = style.icon;

                return (
                  <motion.div
                    key={notification._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors group ${
                      !notification.read ? 'bg-blue-50/50' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex gap-4">
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-xl ${style.bg} flex items-center justify-center flex-shrink-0`}>
                        <IconComponent className={`w-6 h-6 ${style.color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className={`font-medium ${
                              !notification.read ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {notification.message}
                            </p>
                          </div>
                          {!notification.read && (
                            <span className="w-2.5 h-2.5 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {formatTime(notification.createdAt)}
                          </span>
                          <span className="text-xs text-gray-400 px-2 py-0.5 bg-gray-100 rounded">
                            {notification.type?.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notification.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification._id);
                            }}
                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4 text-blue-500" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification._id);
                          }}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
