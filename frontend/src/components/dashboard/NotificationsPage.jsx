import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Check, CheckCheck, Trash2, MessageSquare, Calendar,
  Home, AlertCircle, CreditCard, Star, Users, Eye, Clock,
  Filter, Search, BellOff, RefreshCw, ChevronDown
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Backendurl } from '../../App';
import { toast } from 'react-toastify';

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

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Notifications' },
  { value: 'unread', label: 'Unread Only' },
  { value: 'read', label: 'Read Only' },
];

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const params = {
        page,
        limit: 20,
        unreadOnly: filter === 'unread' ? 'true' : 'false'
      };

      const response = await axios.get(`${Backendurl}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      if (response.data.success) {
        let filteredNotifications = response.data.notifications;
        
        // Apply read filter
        if (filter === 'read') {
          filteredNotifications = filteredNotifications.filter(n => n.read);
        }

        // Apply search
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filteredNotifications = filteredNotifications.filter(n =>
            n.title.toLowerCase().includes(query) ||
            n.message.toLowerCase().includes(query)
          );
        }

        setNotifications(filteredNotifications);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, filter, searchQuery]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications(false);
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${Backendurl}/api/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, read: true, readAt: new Date() } : n)
      );
      toast.success('Marked as read');
    } catch (err) {
      toast.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${Backendurl}/api/notifications/read-all`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications(prev => prev.map(n => ({ ...n, read: true, readAt: new Date() })));
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${Backendurl}/api/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      toast.success('Notification deleted');
    } catch (err) {
      toast.error('Failed to delete notification');
    }
  };

  const deleteAllRead = async () => {
    if (!window.confirm('Delete all read notifications?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${Backendurl}/api/notifications/read`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNotifications(prev => prev.filter(n => !n.read));
      toast.success('Read notifications deleted');
    } catch (err) {
      toast.error('Failed to delete read notifications');
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getNotificationStyle = (type) => {
    return NOTIFICATION_ICONS[type] || { icon: Bell, color: 'text-gray-500', bg: 'bg-gray-100' };
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Bell className="w-7 h-7 text-purple-500" />
            Notifications
            {unreadCount > 0 && (
              <span className="px-2.5 py-1 text-sm bg-purple-100 text-purple-700 rounded-full font-medium">
                {unreadCount} unread
              </span>
            )}
          </h1>
          <p className="text-gray-500 mt-1">Stay updated with your activity</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
          >
            <RefreshCw className={`w-5 h-5 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-colors font-medium text-sm"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </button>
          )}
          {notifications.some(n => n.read) && (
            <button
              onClick={deleteAllRead}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors font-medium text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Clear read
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notifications..."
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div className="relative">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="appearance-none pl-4 pr-10 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer"
          >
            {FILTER_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <BellOff className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No notifications
            </h3>
            <p className="text-gray-500">
              {filter === 'unread' 
                ? "You're all caught up! No unread notifications."
                : "You don't have any notifications yet."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            <AnimatePresence>
              {notifications.map((notification, index) => {
                const style = getNotificationStyle(notification.type);
                const IconComponent = style.icon;

                return (
                  <motion.div
                    key={notification._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors group ${
                      !notification.read ? 'bg-purple-50/50 dark:bg-purple-900/10' : ''
                    }`}
                  >
                    <div className="flex gap-4">
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-xl ${style.bg} flex items-center justify-center flex-shrink-0`}>
                        <IconComponent className={`w-6 h-6 ${style.color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className={`font-semibold ${
                                !notification.read 
                                  ? 'text-gray-900 dark:text-white' 
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}>
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <span className="w-2.5 h-2.5 bg-purple-500 rounded-full" />
                              )}
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {formatTime(notification.createdAt)}
                              </span>
                              {notification.read && notification.readAt && (
                                <span className="flex items-center gap-1">
                                  <Check className="w-4 h-4" />
                                  Read {formatTime(notification.readAt)}
                                </span>
                              )}
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
                                className="p-2 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                                title="Mark as read"
                              >
                                <Check className="w-4 h-4 text-green-600" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification._id);
                              }}
                              className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {((page - 1) * 20) + 1} - {Math.min(page * 20, pagination.total)} of {pagination.total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
