import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Building, Calendar, Truck, BarChart3,
  Eye, MapPin, Shield, Edit, Trash2, FileText
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Backendurl } from '../App';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardFooter from '../components/dashboard/DashboardFooter';
import EditUserModal from '../components/dashboard/EditUserModal';
import MessagesTab from '../components/dashboard/MessagesTab';
import EditPropertyModal from '../components/dashboard/EditPropertyModal';
import Pagination from '../components/Pagination';
import TicketsTab from '../components/dashboard/TicketsTab';

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get active tab from URL path
  const getTabFromPath = useCallback(() => {
    const path = location.pathname;
    if (path.includes('/admin/users')) return 'users';
    if (path.includes('/admin/properties')) return 'properties';
    if (path.includes('/admin/appointments')) return 'appointments';
    if (path.includes('/admin/services')) return 'services';
    if (path.includes('/admin/messages')) return 'messages';
    if (path.includes('/admin/tickets')) return 'tickets';
    return 'overview';
  }, [location.pathname]);
  
  const [activeTab, setActiveTab] = useState(getTabFromPath());
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reset pagination when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Pagination Helper
  const getPaginatedData = (data) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  };

  // User Management State
  const [editingUser, setEditingUser] = useState(null);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);

  // User Management Handlers
  const handleEditUser = (user) => {
    setEditingUser(user);
    setIsEditUserModalOpen(true);
  };

  const handleSaveUser = async (userId, updates) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${Backendurl}/api/admin/users/${userId}`,
        updates,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        toast.success('User updated successfully');
        setUsers(users.map(u => u._id === userId ? response.data.user : u));
        setIsEditUserModalOpen(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${Backendurl}/api/admin/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      toast.success('User deleted successfully');
      setUsers(users.filter(u => u._id !== userId));
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  // Property Management State
  const [editingProperty, setEditingProperty] = useState(null);
  const [isEditPropertyModalOpen, setIsEditPropertyModalOpen] = useState(false);

  // Property Management Handlers
  const handleEditProperty = (property) => {
    setEditingProperty(property);
    setIsEditPropertyModalOpen(true);
  };

  const handleSaveProperty = async (propertyId, updates) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${Backendurl}/api/products/${propertyId}`,
        updates,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        toast.success('Property updated successfully');
        setProperties(properties.map(p => p._id === propertyId ? response.data.product : p));
        setIsEditPropertyModalOpen(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update property');
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${Backendurl}/api/products/${propertyId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      toast.success('Property deleted successfully');
      setProperties(properties.filter(p => p._id !== propertyId));
    } catch (err) {
      toast.error('Failed to delete property');
    }
  };

  // Update activeTab when URL changes
  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [getTabFromPath]);

  useEffect(() => {
    if (user?.role !== 'admin') {
      toast.error('Admin access required');
      navigate('/dashboard');
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [statsRes, usersRes, propertiesRes, appointmentsRes, servicesRes] = await Promise.all([
        axios.get(`${Backendurl}/api/admin/stats`, { headers }).catch(() => ({ data: { stats: {} } })),
        axios.get(`${Backendurl}/api/admin/users`, { headers }).catch(() => ({ data: { users: [] } })),
        axios.get(`${Backendurl}/api/products/list`, { headers }).catch(() => ({ data: { products: [] } })),
        axios.get(`${Backendurl}/api/admin/appointments`, { headers }).catch(() => ({ data: { appointments: [] } })),
        axios.get(`${Backendurl}/api/services/all`, { headers }).catch(() => ({ data: { requests: [] } }))
      ]);

      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users || []);
      setProperties(propertiesRes.data.products || []);
      setAppointments(appointmentsRes.data.appointments || []);
      setServiceRequests(servicesRes.data.requests || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAppointmentAction = async (id, status) => {
    setActionLoading(id);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${Backendurl}/api/admin/appointments/status`,
        { appointmentId: id, status },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      toast.success(`Appointment ${status}`);
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to update appointment');
    } finally {
      setActionLoading(null);
    }
  };

  const handleServiceAction = async (id, status) => {
    setActionLoading(id);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${Backendurl}/api/services/status/${id}`,
        { status },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      toast.success(`Service request ${status}`);
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to update service request');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      'pending': 'bg-yellow-100 text-yellow-700',
      'confirmed': 'bg-green-100 text-green-700',
      'approved': 'bg-green-100 text-green-700',
      'cancelled': 'bg-red-100 text-red-700',
      'in-progress': 'bg-blue-100 text-blue-700',
      'completed': 'bg-gray-100 text-gray-700',
      'active': 'bg-green-100 text-green-700'
    };
    return styles[status?.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'agent':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'tenant':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <DashboardHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </main>
        <DashboardFooter />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Access Required</h2>
          <p className="text-gray-500">You need administrator privileges to access this area.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3, path: '/admin' },
    { id: 'users', label: 'Users', icon: Users, path: '/admin/users' },
    { id: 'properties', label: 'Properties', icon: Building, path: '/admin/properties' },
    { id: 'appointments', label: 'Appointments', icon: Calendar, path: '/admin/appointments' },
    { id: 'services', label: 'Services', icon: Truck, path: '/admin/services' },
    { id: 'messages', label: 'Messages', icon: Eye, path: '/admin/messages' },
    { id: 'tickets', label: 'Tickets', icon: FileText, path: '/admin/tickets' }
  ];

  // Handle tab click - navigate to the path
  const handleTabClick = (tab) => {
    navigate(tab.path);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DashboardHeader />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Users', value: stats.totalUsers || users.length, icon: Users, color: 'blue' },
              { label: 'Properties', value: stats.totalProperties || properties.length, icon: Building, color: 'green' },
              { label: 'Appointments', value: stats.pendingAppointments || appointments.length, icon: Calendar, color: 'yellow' },
              { label: 'Service Requests', value: serviceRequests.length, icon: Truck, color: 'purple' }
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <div className={`w-12 h-12 rounded-xl bg-${stat.color}-100 flex items-center justify-center mb-4`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap
                ${activeTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="grid lg:grid-cols-2 gap-6"
              >
                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-4">Recent Activity</h3>
                  {stats?.recentActivity?.slice(0, 5).map((activity, idx) => (
                    <div key={idx} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
                      <div className={`p-2 rounded-lg ${activity.type === 'property' ? 'bg-green-100' : 'bg-blue-100'}`}>
                        {activity.type === 'property' ? <Building className="w-4 h-4 text-green-600" /> : <Calendar className="w-4 h-4 text-blue-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500">{formatDate(activity.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-4">Pending Actions</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-xl">
                      <span className="text-sm text-gray-700">Pending Appointments</span>
                      <span className="px-3 py-1 bg-yellow-200 text-yellow-800 rounded-full text-sm font-medium">
                        {appointments.filter(a => a.status === 'pending').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                      <span className="text-sm text-gray-700">New Service Requests</span>
                      <span className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm font-medium">
                        {serviceRequests.filter(s => s.status === 'Pending').length}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-y border-gray-100/50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">User</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Joined</th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {getPaginatedData(users).map(u => (
                          <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                  {u.name?.[0] || 'U'}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">{u.name}</p>
                                  <p className="text-sm text-gray-500">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadge(u.role || 'tenant')}`}>
                                {u.role || 'tenant'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-gray-500 text-sm">
                                <Calendar className="w-4 h-4" />
                                {formatDate(u.createdAt)}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {/* Edit Button */}
                                <button 
                                  onClick={() => handleEditUser(u)}
                                  className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                  title="Edit User"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                
                                {/* Delete Button */}
                                <button 
                                  onClick={() => handleDeleteUser(u._id)}
                                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete User"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <Pagination 
                  currentPage={currentPage}
                  totalItems={users.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />

                {/* Edit User Modal */}
                <EditUserModal
                  isOpen={isEditUserModalOpen}
                  onClose={() => setIsEditUserModalOpen(false)}
                  user={editingUser}
                  onSave={handleSaveUser}
                />
              </motion.div>
            )}

            {/* Properties Tab */}
            {activeTab === 'properties' && (
              <motion.div key="properties" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getPaginatedData(properties).map(property => (
                    <div key={property._id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                        <img 
                          src={property.image?.[0] || '/placeholder.jpg'} 
                          alt={property.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 right-3 flex flex-col gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm backdrop-blur-md ${
                            property.status === 'Approved' ? 'bg-green-500/90 text-white' : 
                            property.status === 'Pending' ? 'bg-yellow-500/90 text-white' : 
                            'bg-red-500/90 text-white'
                          }`}>
                            {property.status}
                          </span>
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-bold text-gray-900 line-clamp-1" title={property.title}>{property.title}</h3>
                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3" /> {property.location}
                            </p>
                          </div>
                          <p className="text-lg font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">
                            {formatPrice(property.price)}
                          </p>
                        </div>
                        
                        <div className="pt-4 mt-4 border-t border-gray-100 flex gap-2">
                          <button 
                            onClick={() => handleEditProperty(property)}
                            className="flex-1 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteProperty(property._id)}
                            className="flex-1 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {properties.length === 0 && (
                     <div className="col-span-full py-12 text-center text-gray-500 border-2 border-dashed border-gray-100 rounded-2xl">
                       <Building className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                       <p>No properties found</p>
                     </div>
                  )}
                </div>
                
                <Pagination 
                  currentPage={currentPage}
                  totalItems={properties.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />

                {/* Edit Property Modal */}
                <EditPropertyModal
                  isOpen={isEditPropertyModalOpen}
                  onClose={() => setIsEditPropertyModalOpen(false)}
                  property={editingProperty}
                  onSave={handleSaveProperty}
                />
              </motion.div>
            )}

            {/* Appointments Tab */}
            {activeTab === 'appointments' && (
              <motion.div key="appointments" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="grid gap-4">
                  {appointments.length > 0 ? (
                    getPaginatedData(appointments).map(apt => (
                      <div key={apt._id} className="bg-white rounded-xl p-5 border border-gray-100">
                        <div className="flex justify-between mb-3">
                          <div>
                            <h3 className="font-bold text-gray-900">{apt.propertyId?.title || 'Property'}</h3>
                            <p className="text-sm text-gray-500">{apt.userId?.name} • {apt.userId?.email}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium h-fit ${getStatusBadge(apt.status)}`}>
                            {apt.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{formatDate(apt.date)} at {apt.time}</p>
                        {apt.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAppointmentAction(apt._id, 'confirmed')}
                              disabled={actionLoading === apt._id}
                              className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleAppointmentAction(apt._id, 'cancelled')}
                              disabled={actionLoading === apt._id}
                              className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50"
                            >
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
                      <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="font-medium text-gray-900 mb-2">No appointments</h3>
                      <p className="text-gray-500">Scheduled appointments will appear here.</p>
                    </div>
                  )}
                </div>
                
                <Pagination 
                  currentPage={currentPage}
                  totalItems={appointments.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              </motion.div>
            )}

            {/* Services Tab */}
            {activeTab === 'services' && (
              <motion.div key="services" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <div className="grid gap-4">
                  {serviceRequests.map(request => (
                    <div key={request._id} className="bg-white rounded-xl p-5 border border-gray-100">
                      <div className="flex justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-gray-900">{request.serviceType} Service</h3>
                          <p className="text-sm text-gray-500">{request.userId?.name || 'User'}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium h-fit ${getStatusBadge(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{request.details}</p>
                      {request.status === 'Pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleServiceAction(request._id, 'In Progress')}
                            disabled={actionLoading === request._id}
                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
                          >
                            Start Processing
                          </button>
                          <button
                            onClick={() => handleServiceAction(request._id, 'Completed')}
                            disabled={actionLoading === request._id}
                            className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50"
                          >
                            Mark Complete
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  {serviceRequests.length === 0 && (
                    <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
                      <Truck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="font-medium text-gray-900 mb-2">No service requests</h3>
                      <p className="text-gray-500">Service requests will appear here.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Messages Tab */}
            {activeTab === 'messages' && (
              <motion.div key="messages" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="h-full">
                <MessagesTab />
              </motion.div>
            )}

            {/* Tickets Tab */}
            {activeTab === 'tickets' && (
              <motion.div key="tickets" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <TicketsTab />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>
      
      <DashboardFooter />
    </div>
  );
};

export default AdminDashboard;
