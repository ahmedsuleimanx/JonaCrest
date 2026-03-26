import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Truck, Clock, MapPin, ChevronRight, User, MessageSquare,
  FileText, Home, Bell, Settings, LogOut, Menu, X, Search,
  CheckCircle, XCircle, AlertCircle, ChevronLeft, Eye, Building2,
  HelpCircle, UserCircle, CreditCard, Loader, ExternalLink
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Backendurl } from '../App';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import MessagesTab from '../components/dashboard/MessagesTab';
import TicketsTab from '../components/dashboard/TicketsTab';
import BrowsePropertiesTab from '../components/dashboard/BrowsePropertiesTab';
import ServicesTab from '../components/dashboard/ServicesTab';
import NotificationsPage from '../components/dashboard/NotificationsPage';
import NotificationDropdown from '../components/NotificationDropdown';

const navItems = [
  { id: 'overview', label: 'Overview', icon: Home, path: '/dashboard' },
  { id: 'browse', label: 'Browse Properties', icon: Building2, path: '/dashboard/browse' },
  { id: 'viewings', label: 'My Viewings', icon: Calendar, path: '/dashboard/viewings' },
  { id: 'services', label: 'Services', icon: Truck, path: '/dashboard/services' },
  { id: 'requests', label: 'My Requests', icon: FileText, path: '/dashboard/requests' },
  { id: 'payments', label: 'Payments', icon: CreditCard, path: '/dashboard/payments' },
  { id: 'messages', label: 'Messages', icon: MessageSquare, path: '/dashboard/messages' },
  { id: 'notifications', label: 'Notifications', icon: Bell, path: '/dashboard/notifications' },
  { id: 'support', label: 'Support', icon: HelpCircle, path: '/dashboard/tickets' },
  { id: 'profile', label: 'Profile', icon: UserCircle, path: '/profile' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
];

const statusConfig = {
  confirmed: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
  approved: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
  pending: { color: 'bg-amber-100 text-amber-700', icon: Clock },
  cancelled: { color: 'bg-red-100 text-red-700', icon: XCircle },
  rejected: { color: 'bg-red-100 text-red-700', icon: XCircle },
  'in-progress': { color: 'bg-blue-100 text-blue-700', icon: AlertCircle },
  completed: { color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
};

const DashShimmerCard = () => (
  <div className="dash-glass-card p-6">
    <div className="flex items-center gap-4">
      <div className="dash-shimmer w-14 h-14 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="dash-shimmer w-3/4 h-4 rounded-lg" />
        <div className="dash-shimmer w-1/2 h-3 rounded-lg" />
      </div>
      <div className="dash-shimmer w-20 h-7 rounded-full" />
    </div>
  </div>
);

const DashShimmerPage = () => (
  <div className="space-y-4">
    <div className="dash-shimmer w-48 h-8 rounded-xl mb-6" />
    {[...Array(4)].map((_, i) => <DashShimmerCard key={i} />)}
  </div>
);

const UserDashboard = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  const getTabFromPath = (pathname) => {
    if (pathname.includes('/browse')) return 'browse';
    if (pathname.includes('/services') && !pathname.includes('/requests')) return 'services';
    if (pathname.includes('/messages')) return 'messages';
    if (pathname.includes('/notifications')) return 'notifications';
    if (pathname.includes('/tickets') || pathname.includes('/support')) return 'support';
    if (pathname.includes('/viewings')) return 'viewings';
    if (pathname.includes('/requests')) return 'requests';
    if (pathname.includes('/payments')) return 'payments';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState(getTabFromPath(location.pathname));
  const [viewings, setViewings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [payments, setPayments] = useState([]);
  const [payingId, setPayingId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const newTab = getTabFromPath(location.pathname);
    setActiveTab(newTab);
  }, [location.pathname]);

  const handleTabChange = (item) => {
    if (item.id === 'profile' || item.id === 'settings') {
      navigate(item.path);
      return;
    }
    setPageLoading(true);
    setActiveTab(item.id);
    const tabPaths = {
      overview: '/dashboard',
      browse: '/dashboard/browse',
      viewings: '/dashboard/viewings',
      services: '/dashboard/services',
      requests: '/dashboard/requests',
      payments: '/dashboard/payments',
      messages: '/dashboard/messages',
      notifications: '/dashboard/notifications',
      support: '/dashboard/tickets',
    };
    if (tabPaths[item.id] && location.pathname !== tabPaths[item.id]) {
      navigate(tabPaths[item.id], { replace: true });
    }
    setMobileOpen(false);
    setTimeout(() => setPageLoading(false), 400);
  };

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const headers = { Authorization: `Bearer ${token}` };
      const [viewingsRes, requestsRes, paymentsRes] = await Promise.all([
        axios.get(`${Backendurl}/api/viewings/my-viewings`, { headers }).catch(() => ({ data: { viewings: [] } })),
        axios.get(`${Backendurl}/api/services/my-requests`, { headers }).catch(() => ({ data: { requests: [] } })),
        axios.get(`${Backendurl}/api/payment/my-payments`, { headers }).catch(() => ({ data: { payments: [] } })),
      ]);
      setViewings(viewingsRes.data.viewings || []);
      setRequests(requestsRes.data.requests || []);
      setPayments(paymentsRes.data.payments || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusBadge = (status) => {
    const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        <Icon className="w-3 h-3" />
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <DashShimmerPage />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <div className="text-center dash-glass-card p-10">
          <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in</h2>
          <Link to="/login" className="dash-glass-btn inline-block">Login</Link>
        </div>
      </div>
    );
  }

  // Sidebar content
  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* User Profile */}
      <div className="p-5 border-b border-[var(--glass-border)]">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-light)] flex items-center justify-center text-white font-bold text-lg shadow-md">
            {user.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-[var(--text-primary)] text-sm truncate">{user.name}</h3>
            <p className="text-xs text-[var(--text-secondary)] truncate">{user.email}</p>
          </div>
          <NotificationDropdown />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleTabChange(item)}
            className={`w-full dash-nav-item ${activeTab === item.id ? 'active' : ''}`}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span className="ml-3">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-[var(--glass-border)]">
        <button
          onClick={handleLogout}
          className="w-full dash-nav-item text-red-500 hover:text-red-600 hover:bg-red-50/50"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className="ml-3">Logout</span>
        </button>
      </div>
    </div>
  );

  // Overview tab content
  const renderOverview = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[var(--text-primary)]">Welcome back, {user.name?.split(' ')[0]}!</h2>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Viewings', value: viewings.length, icon: Calendar, color: 'from-[var(--accent)] to-[var(--accent-light)]' },
          { label: 'Service Requests', value: requests.length, icon: Truck, color: 'from-blue-500 to-indigo-500' },
          { label: 'Pending', value: [...viewings, ...requests].filter(i => i.status === 'pending').length, icon: Clock, color: 'from-amber-500 to-orange-500' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="dash-glass-card p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">{stat.label}</p>
                <p className="text-3xl font-bold text-[var(--text-primary)] mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Viewings */}
      <div className="dash-glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-[var(--text-primary)]">Recent Viewings</h3>
          <button onClick={() => handleTabChange({ id: 'viewings', path: '/dashboard/viewings' })} className="text-sm font-medium text-[var(--accent)] hover:underline">
            View All
          </button>
        </div>
        {viewings.length > 0 ? (
          <div className="space-y-3">
            {viewings.slice(0, 3).map((v) => (
              <div key={v._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--accent)]/5 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-[var(--accent)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--text-primary)] text-sm truncate">{v.propertyId?.title || 'Property'}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{formatDate(v.date)} · {v.timeSlot}</p>
                </div>
                {getStatusBadge(v.status)}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--text-secondary)] text-center py-6">No viewings scheduled yet</p>
        )}
      </div>

      {/* Recent Service Requests */}
      <div className="dash-glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-[var(--text-primary)]">Recent Service Requests</h3>
          <button onClick={() => handleTabChange({ id: 'requests', path: '/dashboard/requests' })} className="text-sm font-medium text-[var(--accent)] hover:underline">
            View All
          </button>
        </div>
        {requests.length > 0 ? (
          <div className="space-y-3">
            {requests.slice(0, 3).map((r) => (
              <div key={r._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--accent)]/5 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Truck className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[var(--text-primary)] text-sm truncate">{r.serviceType} Service</p>
                  <p className="text-xs text-[var(--text-secondary)]">{formatDate(r.requestDate)}</p>
                </div>
                {getStatusBadge(r.status)}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--text-secondary)] text-center py-6">No service requests yet</p>
        )}
      </div>
    </div>
  );

  // Viewings tab
  const renderViewings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[var(--text-primary)]">My Viewings</h2>
      {viewings.length > 0 ? (
        <div className="space-y-3">
          {viewings.map((viewing, idx) => (
            <motion.div
              key={viewing._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="dash-glass-card p-5"
            >
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div className="flex items-start gap-4">
                  {viewing.propertyId?.image?.[0] ? (
                    <img src={viewing.propertyId.image[0]} alt="" className="w-20 h-20 object-cover rounded-xl bg-gray-100 flex-shrink-0" />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-8 h-8 text-[var(--accent)]/40" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-[var(--text-primary)] mb-1">{viewing.propertyId?.title || 'Unknown Property'}</h3>
                    <div className="flex items-center text-sm text-[var(--text-secondary)] mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      {viewing.propertyId?.location || 'Location not available'}
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center text-[var(--text-primary)]">
                        <Calendar className="w-4 h-4 mr-1.5 text-[var(--accent)]" />
                        {formatDate(viewing.date)}
                      </span>
                      <span className="flex items-center text-[var(--text-primary)]">
                        <Clock className="w-4 h-4 mr-1.5 text-[var(--accent)]" />
                        {viewing.timeSlot}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge(viewing.status)}
                  <span className="text-xs text-[var(--text-secondary)] capitalize">{viewing.type} Viewing</span>
                  <Link to={`/properties/single/${viewing.propertyId?._id}`} className="text-[var(--accent)] text-sm font-medium hover:underline flex items-center">
                    View Property <ChevronRight className="w-4 h-4 ml-0.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="dash-glass-card p-12 text-center">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">No scheduled viewings</h3>
          <p className="text-[var(--text-secondary)] mb-6">Browse properties to schedule a viewing.</p>
          <Link to="/properties" className="dash-glass-btn inline-block">Browse Properties</Link>
        </div>
      )}
    </div>
  );

  // Service Requests tab
  const renderRequests = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[var(--text-primary)]">Service Requests</h2>
      {requests.length > 0 ? (
        <div className="space-y-3">
          {requests.map((request, idx) => (
            <motion.div
              key={request._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="dash-glass-card p-5"
            >
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-[var(--accent)]/10 text-[var(--accent)] p-2 rounded-xl">
                      <Truck className="w-5 h-5" />
                    </span>
                    <h3 className="font-bold text-[var(--text-primary)] text-lg">{request.serviceType} Service</h3>
                  </div>
                  <p className="text-[var(--text-secondary)] text-sm mb-3 line-clamp-2">{request.details}</p>
                  <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
                    {request.scheduledDate && (
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1.5" />
                        {formatDate(request.scheduledDate)}
                      </span>
                    )}
                    {request.location?.address && (
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1.5" />
                        {request.location.address}
                      </span>
                    )}
                  </div>
                  {request.status === 'approved' && request.adminNotes && (
                    <div className="mt-3 p-3 rounded-xl bg-green-50 border border-green-200">
                      <p className="text-xs font-semibold text-green-700 mb-1">Admin Note:</p>
                      <p className="text-sm text-green-800">{request.adminNotes}</p>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  {getStatusBadge(request.status)}
                  <span className="text-xs text-[var(--text-secondary)]">
                    Submitted {formatDate(request.requestDate || request.createdAt)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="dash-glass-card p-12 text-center">
          <Truck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">No service requests</h3>
          <p className="text-[var(--text-secondary)]">You haven&apos;t submitted any service requests yet.</p>
        </div>
      )}
    </div>
  );

  const handlePayNow = async (paymentId) => {
    try {
      setPayingId(paymentId);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${Backendurl}/api/payment/initialize`,
        { paymentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success && response.data.authorization_url) {
        window.location.href = response.data.authorization_url;
      } else {
        toast.error(response.data.message || 'Failed to initialize payment');
      }
    } catch (error) {
      console.error('Payment initialization error:', error);
      toast.error(error.response?.data?.message || 'Failed to initialize payment');
    } finally {
      setPayingId(null);
    }
  };

  const paymentStatusConfig = {
    pending: { color: 'bg-amber-100 text-amber-700', label: 'Pending' },
    paid: { color: 'bg-green-100 text-green-700', label: 'Paid' },
    failed: { color: 'bg-red-100 text-red-700', label: 'Failed' },
    cancelled: { color: 'bg-gray-100 text-gray-700', label: 'Cancelled' },
    refunded: { color: 'bg-blue-100 text-blue-700', label: 'Refunded' },
  };

  const renderPayments = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[var(--text-primary)]">Payments</h2>
      {payments.length > 0 ? (
        <div className="space-y-3">
          {payments.map((payment, idx) => {
            const pConfig = paymentStatusConfig[payment.status] || paymentStatusConfig.pending;
            return (
              <motion.div
                key={payment._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="dash-glass-card p-5"
              >
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-amber-100 text-amber-600 p-2 rounded-xl">
                        <CreditCard className="w-5 h-5" />
                      </span>
                      <h3 className="font-bold text-[var(--text-primary)] text-lg">
                        GHS {payment.amount?.toFixed(2)}
                      </h3>
                    </div>
                    <p className="text-[var(--text-secondary)] text-sm mb-2">{payment.description}</p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      Requested {formatDate(payment.createdAt)}
                      {payment.paidAt && ` · Paid ${formatDate(payment.paidAt)}`}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${pConfig.color}`}>
                      {pConfig.label}
                    </span>
                    {payment.status === 'pending' && (
                      <button
                        onClick={() => handlePayNow(payment._id)}
                        disabled={payingId === payment._id}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all text-sm font-medium disabled:opacity-50"
                      >
                        {payingId === payment._id ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <ExternalLink className="w-4 h-4" />
                            Pay Now
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="dash-glass-card p-12 text-center">
          <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">No payments</h3>
          <p className="text-[var(--text-secondary)]">You have no payment requests at the moment.</p>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    if (loading || pageLoading) return <DashShimmerPage />;
    switch (activeTab) {
      case 'overview': return renderOverview();
      case 'browse': return <BrowsePropertiesTab />;
      case 'viewings': return renderViewings();
      case 'services': return <ServicesTab />;
      case 'requests': return renderRequests();
      case 'payments': return renderPayments();
      case 'messages': return <MessagesTab />;
      case 'notifications': return <NotificationsPage />;
      case 'support': return <TicketsTab />;
      default: return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Page Loader */}
      <AnimatePresence>
        {pageLoading && (
          <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="dash-page-loader" />
        )}
      </AnimatePresence>

      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-20 left-4 z-50 w-10 h-10 dash-glass-card flex items-center justify-center shadow-lg"
        style={{ borderRadius: '14px' }}
      >
        <Menu className="w-5 h-5 text-[var(--text-secondary)]" />
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="lg:hidden fixed top-0 left-0 h-full w-[280px] dash-glass-sidebar z-50"
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--accent)]/10 text-[var(--text-secondary)]"
            >
              <X className="w-5 h-5" />
            </button>
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed top-0 left-0 h-full w-[280px] dash-glass-sidebar z-30">
        {sidebarContent}
      </aside>

      {/* Main Content */}
      <main className="lg:ml-[280px] pt-4 lg:pt-8 p-4 lg:p-8 min-h-screen">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          {renderContent()}
        </motion.div>
      </main>
    </div>
  );
};

export default UserDashboard;
