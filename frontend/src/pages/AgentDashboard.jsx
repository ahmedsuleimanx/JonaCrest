import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, Calendar, CheckCircle, Building, 
  TrendingUp, Users, MapPin, 
  DollarSign, Target,
  MessageSquare, Phone, Mail, UserCheck,
  BarChart3, PieChart, FileText, Share2,
  MoreVertical, Plus
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Backendurl } from '../App';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardFooter from '../components/dashboard/DashboardFooter';
import MessagesTab from '../components/dashboard/MessagesTab';
import TicketsTab from '../components/dashboard/TicketsTab';
import LeadModal from '../components/dashboard/LeadModal';
import ScheduleViewingModal from '../components/dashboard/ScheduleViewingModal';
import ShareListingModal from '../components/dashboard/ShareListingModal';
import AddPropertyModal from '../components/dashboard/AddPropertyModal';
import Pagination from '../components/Pagination';

const AgentDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get active tab from URL path
  const getTabFromPath = useCallback(() => {
    const path = location.pathname;
    if (path.includes('/agent/leads')) return 'leads';
    if (path.includes('/agent/listings')) return 'listings';
    if (path.includes('/agent/clients')) return 'clients';
    if (path.includes('/agent/analytics')) return 'analytics';
    if (path.includes('/agent/messages')) return 'messages';
    if (path.includes('/agent/tickets')) return 'support';
    return 'overview';
  }, [location.pathname]);
  
  const [activeTab, setActiveTab] = useState(getTabFromPath());
  const [stats, setStats] = useState({
    totalListings: 0,
    activeDeals: 0,
    closedDeals: 0,
    totalCommission: 0,
    clientCount: 0,
    viewingsScheduled: 0,
    rating: 0,
    reviewCount: 0
  });

  const [leads, setLeads] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [isViewingModalOpen, setIsViewingModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAddPropertyModalOpen, setIsAddPropertyModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);

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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <DashboardHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </main>
        <DashboardFooter />
      </div>
    );
  }

  if (user?.role !== 'agent' && user?.role !== 'admin') {
    toast.error('Agent access required');
    navigate('/dashboard');
    return null;
  }

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [statsRes, leadsRes, listingsRes] = await Promise.all([
        axios.get(`${Backendurl}/api/agent/stats`, { headers }).catch(() => ({ data: { stats: {} } })),
        axios.get(`${Backendurl}/api/agent/leads`, { headers }).catch(() => ({ data: { leads: [] } })),
        axios.get(`${Backendurl}/api/agent/listings`, { headers }).catch(() => ({ data: { listings: [] } }))
      ]);

      setStats(prev => ({ ...prev, ...statsRes.data.stats }));
      setLeads(leadsRes.data.leads || []);
      setListings(listingsRes.data.listings || []);
    } catch (error) {
      console.error('Error fetching agent data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabClick = (tab) => {
    navigate(tab.path);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Briefcase, path: '/agent' },
    { id: 'leads', label: 'Leads', icon: UserCheck, path: '/agent/leads' },
    { id: 'listings', label: 'Listings', icon: Building, path: '/agent/listings' },
    { id: 'clients', label: 'Clients', icon: Users, path: '/agent/clients' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, path: '/agent/messages' },
    { id: 'support', label: 'Support', icon: FileText, path: '/agent/tickets' }
  ];

  /* --- Lead Actions --- */
  const handleAddNewLead = () => {
    setEditingLead(null);
    setIsLeadModalOpen(true);
  };

  const handleEditLead = (lead) => {
    setEditingLead(lead);
    setIsLeadModalOpen(true);
  };

  const handleDeleteLead = async (leadId) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${Backendurl}/api/agent/leads/${leadId}`, {
         headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success('Lead deleted');
      setLeads(prev => prev.filter(l => l._id !== leadId));
    } catch {
      toast.error('Failed to delete lead');
    }
  };

  const handleLeadSaved = (savedLead) => {
    if (editingLead) {
      setLeads(leads.map(l => l._id === savedLead._id ? savedLead : l));
    } else {
      setLeads([savedLead, ...leads]);
    }
  };

  /* --- Quick Actions --- */
  const handleQuickAction = (action) => {
    switch(action) {
      case 'add_lead':
        handleAddNewLead();
        break;
      case 'schedule_viewing':
         setIsViewingModalOpen(true);
         break;
      case 'create_report':
         handleCreateReport();
         break;
      case 'share_listing':
         setIsShareModalOpen(true);
         break;
      default:
        break;
    }
  };

  const handleCreateReport = () => {
    try {
      // 1. Prepare Data
      const csvRows = [];
      // Stats Section
      csvRows.push(['--- Performance Stats ---', '']);
      csvRows.push(['Active Listings', stats.totalListings]);
      csvRows.push(['Active Deals', stats.activeDeals]);
      csvRows.push(['Closed Deals', stats.closedDeals]);
      csvRows.push(['Total Commission', stats.totalCommission]);
      
      // Leads Section
      csvRows.push([], ['--- Top Leads ---', '']);
      csvRows.push(['Name', 'Email', 'Status', 'Interest', 'Budget Min', 'Budget Max']);
      
      leads.forEach(lead => {
        csvRows.push([
           lead.name,
           lead.email,
           lead.status,
           lead.interest,
           lead.budget?.min || 0,
           lead.budget?.max || 0
        ]);
      });

      // Listings Section
      csvRows.push([], ['--- Active Listings ---', '']);
      csvRows.push(['Title', 'Location', 'Price', 'Status']);
      
      listings.forEach(listing => {
        csvRows.push([
           listing.title,
           listing.location,
           listing.price,
           listing.status
        ]);
      });

      // 2. Convert to CSV String
      const csvContent = "data:text/csv;charset=utf-8," + 
         csvRows.map(e => e.join(",")).join("\n");

      // 3. Trigger Download
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Agent_Report_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Report downloaded successfully');
    } catch (error) {
      console.error('Error creating report:', error);
      toast.error('Failed to create report');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Hot': return 'text-red-600 bg-red-50 border-red-100';
      case 'Warm': return 'text-orange-600 bg-orange-50 border-orange-100';
      case 'Cold': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'Converted': return 'text-green-600 bg-green-50 border-green-100';
      default: return 'text-gray-600 bg-gray-50 border-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DashboardHeader />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap
                ${activeTab === tab.id 
                  ? 'bg-[#bcaec6] text-white shadow-lg shadow-orange-500/20' 
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100 shadow-sm'
                }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : 'text-gray-500'}`} />
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
             <div className="animate-spin rounded-full h-12 w-12 border-2 border-purple-500 border-t-transparent"></div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Active Listings', value: stats.totalListings, icon: Building, color: 'blue', trend: '+3' },
                    { label: 'Active Deals', value: stats.activeDeals, icon: Target, color: 'orange', trend: '+2' },
                    { label: 'Closed Deals', value: stats.closedDeals, icon: CheckCircle, color: 'green', trend: '+5' },
                    { label: 'Total Commission', value: formatPrice(stats.totalCommission), icon: DollarSign, color: 'purple', trend: '+12%' }
                  ].map((stat, idx) => (
                    <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-xl bg-${stat.color}-50`}>
                          <stat.icon className={`w-6 h-6 text-${stat.color}-500`} />
                        </div>
                        <span className="flex items-center text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {stat.trend}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                      <p className="text-sm text-gray-500">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Secondary Grid */}
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Hot Leads */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 md:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Target className="w-5 h-5 text-red-500" />
                        Hot Leads
                      </h3>
                      <button onClick={() => navigate('/agent/leads')} className="text-sm text-purple-600 hover:text-purple-700 font-medium">View All</button>
                    </div>
                    <div className="space-y-4">
                      {leads.filter(l => l.status === 'Hot').length > 0 ? (
                        leads.filter(l => l.status === 'Hot').slice(0, 3).map(lead => (
                           <div key={lead._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold">
                                  {lead.name[0]}
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900">{lead.name}</h4>
                                  <p className="text-sm text-gray-500">{lead.interest} • {formatPrice(lead.budget.max)}</p>
                                </div>
                              </div>
                              <button onClick={() => handleEditLead(lead)} className="p-2 text-gray-400 hover:text-purple-600">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                           </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-400">No hot leads yet</div>
                      )}
                    </div>
                  </div>

                  {/* Performance Chart Placeholder */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-purple-500" />
                      Performance
                    </h3>
                    <div className="h-48 flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <div className="text-center text-gray-400">
                        <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <span className="text-sm">Performance analytics coming soon</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                 {/* Quick Actions */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-6">Quick Actions</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { id: 'add_lead', label: 'Add New Lead', icon: UserCheck, color: 'blue' },
                      { id: 'schedule_viewing', label: 'Schedule Viewing', icon: Calendar, color: 'green' },
                      { id: 'create_report', label: 'Create Report', icon: FileText, color: 'orange' },
                      { id: 'share_listing', label: 'Share Listing', icon: Share2, color: 'purple' }
                    ].map(action => (
                      <button
                        key={action.id}
                        onClick={() => handleQuickAction(action.id)}
                        className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-purple-100 hover:bg-purple-50 hover:shadow-md transition-all group text-left"
                      >
                        <div className={`p-2 rounded-lg bg-${action.color}-50 group-hover:bg-white transition-colors`}>
                          <action.icon className={`w-5 h-5 text-${action.color}-600`} />
                        </div>
                        <span className="font-medium text-gray-700 group-hover:text-purple-700">{action.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Other Tabs */}
            {activeTab === 'leads' && (
              <motion.div
                 key="leads"
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0 }}
                 className="space-y-6"
              >
                <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                   <h2 className="text-lg font-bold text-gray-900">All Leads</h2>
                   <button 
                     onClick={handleAddNewLead}
                     className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200"
                   >
                     <Plus className="w-4 h-4" />
                     Add Lead
                   </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {getPaginatedData(leads).map(lead => (
                      <div key={lead._id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                         <div className="flex justify-between items-start mb-4">
                           <div className="flex items-center gap-3">
                             <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg">
                               {lead.name[0]}
                             </div>
                             <div>
                               <h3 className="font-bold text-gray-900">{lead.name}</h3>
                               <p className="text-sm text-gray-500">{lead.email}</p>
                             </div>
                           </div>
                           <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(lead.status)}`}>
                             {lead.status}
                           </span>
                         </div>
                         
                         <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-50">
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Budget</p>
                              <p className="font-medium text-gray-900">{formatPrice(lead.budget.min)} - {formatPrice(lead.budget.max)}</p>
                            </div>
                            <div>
                               <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Interest</p>
                               <p className="font-medium text-gray-900">{lead.interest}</p>
                            </div>
                         </div>
                         
                         <div className="flex justify-end gap-2 mt-4 pt-2">
                            <button 
                               onClick={() => window.location.href = `mailto:${lead.email}`}
                               className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
                               title="Email"
                            >
                               <Mail className="w-4 h-4" />
                            </button>
                            <button 
                               onClick={() => window.location.href = `tel:${lead.phone}`}
                               className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                               title="Call"
                            >
                               <Phone className="w-4 h-4" />
                            </button>
                            <button 
                               onClick={() => handleEditLead(lead)} 
                               className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                               title="Edit"
                            >
                               <FileText className="w-4 h-4" />
                            </button>
                             <button
                                onClick={() => handleDeleteLead(lead._id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                title="Delete"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                            </button>
                         </div>
                      </div>
                   ))}
                   {leads.length === 0 && (
                      <div className="col-span-full py-12 text-center text-gray-500">
                         No leads found. Click &quot;Add Lead&quot; to get started.
                      </div>
                   )}
                </div>
                
                 <Pagination 
                  currentPage={currentPage}
                  totalItems={leads.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              </motion.div>
            )}

            {activeTab === 'listings' && (
               <motion.div key="listings" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6">
                     <h2 className="text-lg font-bold text-gray-900">My Listings</h2>
                     <button 
                       onClick={() => setIsAddPropertyModalOpen(true)}
                       className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200"
                     >
                       <Plus className="w-4 h-4" />
                       Add Listing
                     </button>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getPaginatedData(listings).map(property => (
                      <div key={property._id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all">
                        <div className="relative aspect-[4/3] bg-gray-100">
                          <img 
                             src={property.image[0] || '/placeholder.jpg'} 
                             alt={property.title} 
                             className="w-full h-full object-cover"
                          />
                          <div className="absolute top-3 right-3">
                             <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold shadow-sm">
                               {property.status}
                             </span>
                          </div>
                        </div>
                        <div className="p-5">
                           <div className="flex justify-between items-start mb-2">
                              <h3 className="font-bold text-gray-900 line-clamp-1">{property.title}</h3>
                              <p className="font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg text-sm">
                                {formatPrice(property.price)}
                              </p>
                           </div>
                           <p className="text-gray-500 text-sm flex items-center gap-1 mb-4">
                             <MapPin className="w-3 h-3" /> {property.location}
                           </p>
                           <div className="flex gap-2">
                              <button className="flex-1 py-2 bg-gray-50 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100">
                                View Details
                              </button>
                              <button className="flex-1 py-2 bg-purple-50 text-purple-700 text-sm font-medium rounded-lg hover:bg-purple-100">
                                Edit
                              </button>
                           </div>
                        </div>
                      </div>
                    ))}
                    {listings.length === 0 && (
                       <div className="col-span-full py-12 text-center text-gray-500 border-2 border-dashed border-gray-200 rounded-2xl">
                          <Building className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p>No listings found assigned to you.</p>
                       </div>
                    )}
                  </div>
                  <Pagination 
                    currentPage={currentPage}
                    totalItems={listings.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                  />
               </motion.div>
            )}
            
            {activeTab === 'clients' && (
                <motion.div key="clients" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                   <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <table className="w-full">
                         <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                               <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                               <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                               <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Interest</th>
                               <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-50">
                            {getPaginatedData(leads).map(client => (
                               <tr key={client._id} className="hover:bg-gray-50/50">
                                  <td className="px-6 py-4">
                                     <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                                           {client.name[0]}
                                        </div>
                                        <div>
                                           <div className="font-semibold text-gray-900">{client.name}</div>
                                           <div className="text-sm text-gray-500">{client.email}</div>
                                        </div>
                                     </div>
                                  </td>
                                  <td className="px-6 py-4">
                                     <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(client.status)}`}>
                                        {client.status}
                                     </span>
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-600">{client.interest}</td>
                                  <td className="px-6 py-4 text-right">
                                     <button className="text-sm text-purple-600 font-medium hover:underline">View Profile</button>
                                  </td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                      {leads.length === 0 && (
                          <div className="p-8 text-center text-gray-500">No clients found.</div>
                      )}
                   </div>
                   <Pagination 
                      currentPage={currentPage}
                      totalItems={leads.length}
                      itemsPerPage={itemsPerPage}
                      onPageChange={setCurrentPage}
                    />
                </motion.div>
            )}

            {/* Messages Tab */}
            {activeTab === 'messages' && (
               <motion.div key="messages" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
                 <MessagesTab />
               </motion.div>
            )}

            {/* Tickets/Support Tab */}
            {activeTab === 'support' && (
               <motion.div key="support" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                 <TicketsTab />
               </motion.div>
            )}
            
            {/* Analytics Tab (Placeholder for now) */}
            {activeTab === 'analytics' && (
              <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                 <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
                    <PieChart className="w-16 h-16 mx-auto mb-4 text-purple-200" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Detailed Analytics</h3>
                    <p className="text-gray-500">Advanced reporting and analytics features are coming soon.</p>
                 </div>
              </motion.div>
            )}

          </AnimatePresence>
        )}
      </main>
      
      <DashboardFooter />

    
      {/* Lead Modal */}
      <LeadModal 
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        lead={editingLead}
        onSave={handleLeadSaved}
      />

      {/* Viewing Modal */}
      <ScheduleViewingModal 
        isOpen={isViewingModalOpen}
        onClose={() => setIsViewingModalOpen(false)}
        listings={listings}
        leads={leads}
      />

      {/* Share Modal */}
      <ShareListingModal 
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        listings={listings}
      />

       {/* Add Property Modal */}
       <AddPropertyModal 
        isOpen={isAddPropertyModalOpen}
        onClose={() => setIsAddPropertyModalOpen(false)}
        onSave={() => {
            fetchDashboardData(); 
            // Also refresh listings specifically if needed, but fetchDashboardData covers it
        }}
      />
    </div>
  );
};

export default AgentDashboard;
