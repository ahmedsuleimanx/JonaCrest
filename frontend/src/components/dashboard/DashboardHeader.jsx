import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, MessageSquare, Settings, LogOut, ChevronDown,
  Home, Building, Users, Calendar, Briefcase,
  HelpCircle, User, Menu, X, Sun, Moon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';
import { Backendurl } from '../../App';
import logo from '../../assets/jona_crest_logo.png';

// Role-specific configurations
const roleConfig = {
  admin: {
    title: 'Admin Dashboard',
    gradient: 'from-purple-600 to-indigo-600',
    badge: 'Administrator',
    badgeColor: 'bg-purple-100 text-purple-700',
    navItems: [
      { path: '/admin', label: 'Overview', icon: Home },
      { path: '/admin/users', label: 'Users', icon: Users },
      { path: '/admin/properties', label: 'Properties', icon: Building },
      { path: '/admin/appointments', label: 'Appointments', icon: Calendar },
      { path: '/admin/services', label: 'Services', icon: Briefcase },
      { path: '/admin/messages', label: 'Messages', icon: MessageSquare },
    ]
  },
  landlord: {
    title: 'Landlord Dashboard',
    gradient: 'from-emerald-600 to-teal-600',
    badge: 'Landlord',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    navItems: [
      { path: '/landlord', label: 'Overview', icon: Home },
      { path: '/landlord/properties', label: 'Properties', icon: Building },
      { path: '/landlord/viewings', label: 'Viewings', icon: Calendar },
      { path: '/landlord/messages', label: 'Messages', icon: MessageSquare },
      { path: '/landlord/tickets', label: 'Support', icon: HelpCircle },
    ]
  },
  agent: {
    title: 'Agent Dashboard',
    gradient: 'from-amber-500 to-orange-500',
    badge: 'Real Estate Agent',
    badgeColor: 'bg-amber-100 text-amber-700',
    navItems: [
      { path: '/agent', label: 'Overview', icon: Home },
      { path: '/agent/leads', label: 'Leads', icon: Users },
      { path: '/agent/listings', label: 'Listings', icon: Building },
      { path: '/agent/clients', label: 'Clients', icon: Briefcase },
      { path: '/agent/messages', label: 'Messages', icon: MessageSquare },
      { path: '/agent/tickets', label: 'Support', icon: HelpCircle },
    ]
  },
  tenant: {
    title: 'My Dashboard',
    gradient: 'from-blue-600 to-cyan-600',
    badge: 'Member',
    badgeColor: 'bg-blue-100 text-blue-700',
    navItems: [
      { path: '/dashboard', label: 'Overview', icon: Home },
      { path: '/dashboard/saved', label: 'Saved Properties', icon: Building },
      { path: '/dashboard/viewings', label: 'Viewings', icon: Calendar },
      { path: '/dashboard/messages', label: 'Messages', icon: MessageSquare },
      { path: '/dashboard/tickets', label: 'Support', icon: HelpCircle },
    ]
  }
};

const DashboardHeader = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const userRole = user?.role || 'tenant';
  const config = roleConfig[userRole] || roleConfig.tenant;

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${Backendurl}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setNotifications(response.data.notifications.slice(0, 5));
        setUnreadCount(response.data.notifications.filter(n => !n.read).length);
      }
    } catch (error) {
      // Notifications API might not exist yet
      console.log('Notifications not available');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const markAsRead = async (notificationId) => {
    // Find the notification to check if it was already read
    const notification = notifications.find(n => n._id === notificationId);
    const wasUnread = notification && !notification.read;
    
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${Backendurl}/api/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(prev =>
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
      // Only decrement if the notification was actually unread
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to mark notification as read');
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <img 
                src={logo} 
                alt="Jona Crest Properties" 
                className="w-10 h-10 object-contain rounded-lg shadow-md bg-white p-1"
              />
              <div className="hidden md:block">
                <h1 className="text-lg font-bold text-gray-900">Jona Crest</h1>
                <p className="text-xs text-gray-500 -mt-1">{config.title}</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {config.navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path ||
                (item.path !== '/admin' && item.path !== '/landlord' && item.path !== '/agent' && item.path !== '/dashboard' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? `bg-gradient-to-r ${config.gradient} text-white shadow-md`
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowUserMenu(false);
                }}
                className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div
                            key={notification._id}
                            onClick={() => {
                              markAsRead(notification._id);
                              setShowNotifications(false);
                              // Navigate to the notification's link if it exists
                              if (notification.link) {
                                navigate(notification.link);
                              } else if (notification.data?.conversationId) {
                                navigate(`/messages/${notification.data.conversationId}`);
                              }
                            }}
                            className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${
                              !notification.read ? 'bg-blue-50' : ''
                            }`}
                          >
                            <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                            <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center">
                          <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">No notifications yet</p>
                        </div>
                      )}
                    </div>
                    <Link
                      to="/notifications"
                      className="block p-3 text-center text-sm font-medium text-emerald-600 hover:bg-gray-50 border-t border-gray-100"
                    >
                      View All Notifications
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Messages */}
            <Link
              to={`/${userRole === 'tenant' ? 'dashboard' : userRole}/messages`}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
            >
              <MessageSquare className="w-5 h-5 text-gray-600" />
            </Link>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-gray-100 transition-colors"
              >
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white text-sm font-medium`}>
                  {getInitials(user?.name)}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500">{config.badge}</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-100">
                      <p className="font-medium text-gray-900">{user?.name}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                      <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${config.badgeColor}`}>
                        {config.badge}
                      </span>
                    </div>
                    <div className="py-2">
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                      <Link
                        to="/help"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <HelpCircle className="w-4 h-4" />
                        Help & Support
                      </Link>
                      <hr className="my-2" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {showMobileMenu ? (
                <X className="w-5 h-5 text-gray-600" />
              ) : (
                <Menu className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden py-4 border-t border-gray-100"
            >
              {config.navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setShowMobileMenu(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? `bg-gradient-to-r ${config.gradient} text-white`
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default DashboardHeader;
