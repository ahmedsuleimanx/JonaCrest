import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Eye, Edit, Trash2, 
  CheckCircle, XCircle, Clock, Building, 
  Users, MapPin, Plus,
  MessageSquare, TrendingUp
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Backendurl } from '../App';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardFooter from '../components/dashboard/DashboardFooter';
import Pagination from '../components/Pagination';
import TicketsTab from '../components/dashboard/TicketsTab';
import AddPropertyModal from '../components/dashboard/AddPropertyModal';
import MessagesTab from '../components/dashboard/MessagesTab';

const LandlordDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get active tab from URL path
  const getTabFromPath = useCallback(() => {
    const path = location.pathname;
    if (path.includes('/landlord/properties')) return 'properties';
    if (path.includes('/landlord/viewings')) return 'viewings';
    if (path.includes('/landlord/tenants')) return 'tenants';
    if (path.includes('/landlord/messages')) return 'messages';
    if (path.includes('/landlord/tickets')) return 'support';
    return 'overview';
  }, [location.pathname]);
  
  const [activeTab, setActiveTab] = useState(getTabFromPath());
  const [stats, setStats] = useState(null);
  const [properties, setProperties] = useState([]);
  const [viewings, setViewings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [isAddPropertyModalOpen, setIsAddPropertyModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Reset pagination when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Pagination Helper
  const getPaginatedData = (data) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  };

  // Update activeTab when URL changes
  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [getTabFromPath]);

  useEffect(() => {
    if (user?.role !== 'landlord' && user?.role !== 'admin') {
      toast.error('Access denied. Landlord account required.');
      navigate('/dashboard');
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const headers = { 'Authorization': `Bearer ${token}` };

      const [statsRes, propertiesRes, viewingsRes] = await Promise.all([
        axios.get(`${Backendurl}/api/landlord/stats`, { headers }).catch(() => ({ data: { stats: {} } })),
        axios.get(`${Backendurl}/api/landlord/properties`, { headers }).catch(() => ({ data: { properties: [] } })),
        axios.get(`${Backendurl}/api/landlord/viewings`, { headers }).catch(() => ({ data: { viewings: [] } }))
      ]);

      setStats(statsRes.data.stats);
      setProperties(propertiesRes.data.properties || []);
      setViewings(viewingsRes.data.viewings || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleViewingAction = async (viewingId, status) => {
    setActionLoading(viewingId);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${Backendurl}/api/landlord/viewings/${viewingId}/status`,
        { status },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      toast.success(`Viewing ${status.toLowerCase()}`);
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating viewing:', error);
      toast.error('Failed to update viewing');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return;
    }
    
    setActionLoading(propertyId);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${Backendurl}/api/landlord/properties/${propertyId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      toast.success('Property deleted successfully');
      fetchDashboardData();
    } catch (error) {
      console.error('Error deleting property:', error);
      toast.error('Failed to delete property');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditProperty = (property) => {
    setEditingProperty(property);
    setIsAddPropertyModalOpen(true);
  };

  const closePropertyModal = () => {
    setIsAddPropertyModalOpen(false);
    setEditingProperty(null);
  };



  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Pending': 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700',
      'Confirmed': 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700',
      'Cancelled': 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700',
      'Completed': 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700'
    };
    return styles[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
  };

  // Compute Tenants from Confirmed Viewings
  const tenants = React.useMemo(() => {
    const uniqueTenants = [];
    const seenIds = new Set();

    viewings.forEach(v => {
      if ((v.status === 'Confirmed' || v.status === 'Completed') && v.userId && !seenIds.has(v.userId._id)) {
        seenIds.add(v.userId._id);
        uniqueTenants.push({
            ...v.userId,
            propertyTitle: v.propertyId?.title,
            moveInDate: v.date
        });
      }
    });
    return uniqueTenants;
  }, [viewings]);


  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <DashboardHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </main>
        <DashboardFooter />
      </div>
    );
  }

  if (!user || (user.role !== 'landlord' && user.role !== 'admin')) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <Building className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Landlord Access Required</h2>
          <p className="text-gray-500">You need a landlord account to access this area.</p>
        </div>
      </div>
    );
  }

  if (loading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-200">
      <DashboardHeader />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
                <p className="text-gray-500 dark:text-gray-400">Welcome back, {user.name.split(' ')[0]}</p>
            </div>
            
            <button 
                onClick={() => setIsAddPropertyModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-all shadow-lg shadow-teal-600/20"
            >
                <Plus className="w-5 h-5" />
                Add Property
            </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
                { label: 'Total Properties', value: stats?.totalProperties || 0, icon: Building, color: 'blue', bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400' },
                { label: 'Active Listings', value: stats?.activeProperties || 0, icon: TrendingUp, color: 'emerald', bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400' },
                { label: 'Active Tenants', value: tenants.length, icon: Users, color: 'indigo', bg: 'bg-indigo-50 dark:bg-indigo-900/20', text: 'text-indigo-600 dark:text-indigo-400' },
                { label: 'Pending Requests', value: stats?.pendingViewings || 0, icon: Clock, color: 'amber', bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400' }
            ].map((stat, idx) => (
                <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-xl ${stat.bg}`}>
                            <stat.icon className={`w-6 h-6 ${stat.text}`} />
                        </div>
                        {idx === 1 && <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg">+2.5%</span>}
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                </motion.div>
            ))}
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'overview', label: 'Overview', path: '/landlord' },
            { id: 'properties', label: 'Properties', path: '/landlord/properties' },
            { id: 'tenants', label: 'Tenants', path: '/landlord/tenants' },
            { id: 'viewings', label: 'Viewings', path: '/landlord/viewings' },
            { id: 'messages', label: 'Messages', path: '/landlord/messages' },
            { id: 'support', label: 'Support', path: '/landlord/tickets' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`px-5 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap
                ${activeTab === tab.id 
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20' 
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
        
        {/* === OVERVIEW TAB === */}
        {activeTab === 'overview' && (
            <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid lg:grid-cols-2 gap-6"
            >
                {/* Recent Properties */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Building className="w-5 h-5 text-gray-400" /> Recent Properties
                        </h3>
                        <Link to="/landlord/properties" className="text-sm font-medium text-teal-600 dark:text-teal-400 hover:underline">View All</Link>
                    </div>
                    <div className="space-y-4">
                        {properties.slice(0, 3).map(property => (
                            <div key={property._id} className="flex gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border border-transparent hover:border-gray-100 dark:hover:border-gray-700">
                                <img 
                                    src={property.image?.[0] || '/placeholder.jpg'} 
                                    alt={property.title}
                                    className="w-20 h-20 rounded-lg object-cover bg-gray-100 dark:bg-gray-700"
                                />
                                <div className="flex-1 min-w-0 py-1">
                                    <h4 className="font-semibold text-gray-900 dark:text-white truncate">{property.title}</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-1">
                                        <MapPin className="w-3 h-3" /> {property.location}
                                    </p>
                                    <p className="text-teal-600 dark:text-teal-400 font-bold text-sm">
                                        {formatPrice(property.price)}
                                        <span className="text-gray-400 font-normal text-xs ml-1">/ {property.listingType === 'Rent' ? 'mo' : ''}</span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Viewings */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                             <Clock className="w-5 h-5 text-gray-400" /> Recent Requests
                        </h3>
                         <Link to="/landlord/viewings" className="text-sm font-medium text-teal-600 dark:text-teal-400 hover:underline">View All</Link>
                    </div>
                    <div className="space-y-4">
                        {viewings.slice(0, 3).map(viewing => (
                            <div key={viewing._id} className="flex items-start gap-4 p-4 rounded-xl border border-gray-50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-700/20">
                                <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 font-bold shrink-0">
                                    {viewing.userId?.name?.[0] || 'U'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <p className="font-medium text-gray-900 dark:text-white truncate">{viewing.userId?.name}</p>
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getStatusBadge(viewing.status)}`}>
                                            {viewing.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate mb-1">Requested viewing for {viewing.propertyId?.title}</p>
                                    <div className="flex items-center gap-3 text-xs text-gray-400">
                                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(viewing.date)}</span>
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {viewing.timeSlot}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {viewings.length === 0 && <p className="text-gray-500 text-center py-4">No viewing requests yet.</p>}
                    </div>
                </div>
            </motion.div>
        )}

        {/* === PROPERTIES TAB === */}
        {activeTab === 'properties' && (
             <motion.div
                key="properties"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
            >
                {/* Filters could go here */}
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getPaginatedData(properties).map(property => (
                        <div key={property._id} className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl hover:shadow-teal-900/5 dark:hover:shadow-teal-900/20 transition-all duration-300">
                            <div className="relative aspect-[4/3] overflow-hidden">
                                <img 
                                    src={property.image?.[0] || '/placeholder.jpg'} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                                     <Link 
                                        to={`/dashboard/property/${property._id}`}
                                        className="px-3 py-1.5 bg-white/90 backdrop-blur text-gray-900 text-xs font-bold rounded-lg hover:bg-white flex items-center gap-1"
                                     >
                                        <Eye className="w-3 h-3" /> View
                                     </Link>
                                </div>
                                <span className={`absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur rounded-lg text-xs font-bold ${
                                    property.status === 'active' ? 'text-emerald-600' : 'text-gray-600'
                                }`}>
                                    {property.availability || 'Available'}
                                </span>
                            </div>
                            
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">{property.title}</h3>
                                    <p className="text-teal-600 dark:text-teal-400 font-bold">{formatPrice(property.price)}</p>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-4">
                                     <MapPin className="w-4 h-4" /> {property.location}
                                </p>
                                
                                <div className="grid grid-cols-3 gap-2 py-3 border-t border-gray-50 dark:border-gray-700 mb-4">
                                    <div className="text-center">
                                        <span className="block text-xs text-gray-400">Beds</span>
                                        <span className="font-semibold text-gray-700 dark:text-gray-200">{property.beds}</span>
                                    </div>
                                    <div className="text-center border-l border-gray-50 dark:border-gray-700">
                                        <span className="block text-xs text-gray-400">Baths</span>
                                        <span className="font-semibold text-gray-700 dark:text-gray-200">{property.baths}</span>
                                    </div>
                                    <div className="text-center border-l border-gray-50 dark:border-gray-700">
                                        <span className="block text-xs text-gray-400">Sqft</span>
                                        <span className="font-semibold text-gray-700 dark:text-gray-200">{property.sqft}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleDeleteProperty(property._id)}
                                        className="flex-1 py-2 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" /> Delete
                                    </button>
                                    <button 
                                        onClick={() => handleEditProperty(property)}
                                        className="flex-1 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Edit className="w-4 h-4" /> Edit
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                 {properties.length === 0 && (
                     <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-dashed border-gray-200 dark:border-gray-700">
                        <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Building className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No properties listed</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">Start building your portfolio by adding your first property.</p>
                        <button 
                            onClick={() => setIsAddPropertyModalOpen(true)}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium transition-colors"
                        >
                            <Plus className="w-4 h-4" /> Add Property
                        </button>
                     </div>
                 )}

                 <Pagination 
                   currentPage={currentPage}
                   totalItems={properties.length}
                   itemsPerPage={itemsPerPage}
                   onPageChange={setCurrentPage}
                 />
            </motion.div>
        )}

        {/* === VIEWINGS TAB === */}
        {activeTab === 'viewings' && (
            <motion.div
                key="viewings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid gap-4"
            >
                {viewings.length > 0 ? getPaginatedData(viewings).map(viewing => (
                    <div key={viewing._id} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center">
                         <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(viewing.status)}`}>
                                    {viewing.status}
                                </span>
                                <span className="text-sm text-gray-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Requested on {new Date(viewing.createdAt || viewing.date).toLocaleDateString()}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                Viewing for <span className="text-teal-600 dark:text-teal-400">{viewing.propertyId?.title}</span>
                            </h3>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 mt-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-bold">
                                        {viewing.userId?.name?.[0]}
                                    </div>
                                    <div>
                                        <p className="text-gray-900 dark:text-white font-medium">{viewing.userId?.name}</p>
                                        <p className="text-xs">{viewing.userId?.email}</p>
                                    </div>
                                </div>
                                <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 hidden md:block"></div>
                                <span className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-400" /> {formatDate(viewing.date)}
                                </span>
                                <span className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-400" /> {viewing.timeSlot}
                                </span>
                            </div>
                         </div>
                         
                         {viewing.status === 'Pending' && (
                            <div className="flex gap-3 w-full md:w-auto">
                                <button
                                    onClick={() => handleViewingAction(viewing._id, 'Confirmed')}
                                    disabled={actionLoading === viewing._id}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                                >
                                    <CheckCircle className="w-4 h-4" /> Approve
                                </button>
                                <button
                                    onClick={() => handleViewingAction(viewing._id, 'Cancelled')}
                                    disabled={actionLoading === viewing._id}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400 rounded-xl font-medium transition-colors disabled:opacity-50"
                                >
                                    <XCircle className="w-4 h-4" /> Decline
                                </button>
                            </div>
                         )}
                    </div>
                )) : (
                     <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                      <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">No viewing requests</h3>
                      <p className="text-gray-500 dark:text-gray-400">Requests from interested tenants will appear here.</p>
                    </div>
                )}
                 <Pagination 
                   currentPage={currentPage}
                   totalItems={viewings.length}
                   itemsPerPage={itemsPerPage}
                   onPageChange={setCurrentPage}
                 />
            </motion.div>
        )}

        {/* === TENANTS TAB === */}
        {activeTab === 'tenants' && (
            <motion.div
                key="tenants"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
            >
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">Your Tenants</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Users who have confirmed viewings or active leases.</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Tenant Name</th>
                                    <th className="px-6 py-4">Property Interest</th>
                                    <th className="px-6 py-4">Contact Info</th>
                                    <th className="px-6 py-4">Date Initiated</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {tenants.map((tenant, index) => (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                                                    {tenant.name?.[0]}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900 dark:text-white">{tenant.name}</p>
                                                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">Active</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-medium">
                                            {tenant.propertyTitle || 'Unknown Property'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-900 dark:text-gray-200">{tenant.email}</p>
                                            <p className="text-xs text-gray-500">{tenant.phone || 'No phone'}</p>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm">
                                            {formatDate(tenant.moveInDate)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors p-2">
                                                <MessageSquare className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {tenants.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                                            No active tenants found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </motion.div>
        )}

        {/* === MESSAGES TAB === */}
        {activeTab === 'messages' && (
            <motion.div
                key="messages"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
            >
                <MessagesTab />
            </motion.div>
        )}

        {/* === SUPPORT TAB === */}
        {activeTab === 'support' && (
             <motion.div
                key="support"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
             >
                 <TicketsTab />
             </motion.div>
        )}

        </AnimatePresence>

      </main>
      
      <AddPropertyModal 
        isOpen={isAddPropertyModalOpen}
        onClose={closePropertyModal}
        onSave={() => {
             fetchDashboardData();
             setActiveTab('properties'); // Switch to properties to see result
        }}
        endpoint={editingProperty ? `${Backendurl}/api/landlord/properties/${editingProperty._id}` : `${Backendurl}/api/landlord/properties`}
        method={editingProperty ? 'PUT' : 'POST'}
        initialData={editingProperty}
      />

      <DashboardFooter />
    </div>
  );
};

export default LandlordDashboard;
