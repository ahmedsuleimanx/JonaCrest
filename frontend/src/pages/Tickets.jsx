import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { 
  Plus, Search, Filter, Clock, AlertTriangle, CheckCircle,
  FileText, MessageSquare, ChevronRight, User, Calendar,
  Tag, X, Send, Paperclip
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Backendurl } from '../App';
import { useAuth } from '../context/AuthContext';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardFooter from '../components/dashboard/DashboardFooter';

const Tickets = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { ticketId } = useParams(); // Get ticket ID from URL
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState(null);

  // Auto-select ticket from URL parameter
  useEffect(() => {
    if (ticketId && tickets.length > 0 && !selectedTicket) {
      const ticket = tickets.find(t => t._id === ticketId);
      if (ticket) {
        setSelectedTicket(ticket);
      } else {
        // If not in list, fetch directly
        fetchTicketById(ticketId);
      }
    }
  }, [ticketId, tickets]);

  // Fetch single ticket by ID (when coming from direct URL)
  const fetchTicketById = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${Backendurl}/api/tickets/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setSelectedTicket(response.data.ticket);
      }
    } catch (error) {
      console.error('Failed to fetch ticket:', error);
      toast.error('Ticket not found');
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchTickets();
    fetchStats();
  }, [user, filter]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);
      
      const endpoint = user?.role === 'admin' 
        ? `/api/tickets/all?${params}`
        : `/api/tickets/my-tickets?${params}`;
      
      const response = await axios.get(`${Backendurl}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setTickets(response.data.tickets);
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${Backendurl}/api/tickets/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      open: 'bg-blue-100 text-blue-700',
      in_progress: 'bg-amber-100 text-amber-700',
      waiting_response: 'bg-purple-100 text-purple-700',
      resolved: 'bg-green-100 text-green-700',
      closed: 'bg-gray-100 text-gray-700'
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      low: 'bg-gray-100 text-gray-600',
      medium: 'bg-blue-100 text-blue-600',
      high: 'bg-orange-100 text-orange-600',
      urgent: 'bg-red-100 text-red-600'
    };
    return styles[priority] || 'bg-gray-100 text-gray-600';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DashboardHeader />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user?.role === 'admin' ? 'Ticket Management' : 'Support Tickets'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {user?.role === 'admin' 
                ? 'Manage and respond to user support tickets'
                : 'Get help with issues and track your requests'}
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
          >
            <Plus className="w-4 h-4" />
            New Ticket
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Total</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-blue-100">
              <p className="text-2xl font-bold text-blue-600">{stats.open}</p>
              <p className="text-sm text-gray-500">Open</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-amber-100">
              <p className="text-2xl font-bold text-amber-600">{stats.inProgress}</p>
              <p className="text-sm text-gray-500">In Progress</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-green-100">
              <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              <p className="text-sm text-gray-500">Resolved</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-2xl font-bold text-gray-600">{stats.closed}</p>
              <p className="text-sm text-gray-500">Closed</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['all', 'open', 'in_progress', 'resolved', 'closed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                filter === status 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Tickets List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
            <p className="text-gray-500 mb-4">
              {filter !== 'all' 
                ? `No ${filter.replace('_', ' ')} tickets` 
                : 'You haven\'t created any support tickets yet'}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create your first ticket
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <motion.div
                key={ticket._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-gray-400">{ticket.ticketNumber}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadge(ticket.status)}`}>
                            {ticket.status.replace('_', ' ')}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityBadge(ticket.priority)}`}>
                            {ticket.priority}
                          </span>
                        </div>
                        <h4 className="font-medium text-gray-900">{ticket.subject}</h4>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{ticket.description}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(ticket.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {ticket.responses?.length || 0} responses
                      </span>
                      {user?.role === 'admin' && ticket.creator && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {ticket.creator.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <DashboardFooter />

      {/* Create Ticket Modal */}
      <CreateTicketModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          fetchTickets();
          fetchStats();
        }}
      />

      {/* Ticket Detail Modal */}
      <TicketDetailModal
        ticket={selectedTicket}
        isAdmin={user?.role === 'admin'}
        onClose={() => setSelectedTicket(null)}
        onUpdate={() => {
          fetchTickets();
          fetchStats();
        }}
      />
    </div>
  );
};

// Create Ticket Modal Component
const CreateTicketModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    type: 'issue',
    category: 'other',
    subject: '',
    description: '',
    priority: 'medium'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(`${Backendurl}/api/tickets`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        toast.success('Ticket created successfully!');
        onSuccess();
        onClose();
        setFormData({
          type: 'issue',
          category: 'other',
          subject: '',
          description: '',
          priority: 'medium'
        });
      }
    } catch (error) {
      toast.error('Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Create Support Ticket</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="issue">Issue</option>
                <option value="inquiry">Inquiry</option>
                <option value="complaint">Complaint</option>
                <option value="moderation">Moderation Request</option>
                <option value="property_dispute">Property Dispute</option>
                <option value="feature_request">Feature Request</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="property">Property</option>
                <option value="payment">Payment</option>
                <option value="account">Account</option>
                <option value="technical">Technical</option>
                <option value="listing">Listing</option>
                <option value="tenant">Tenant Issue</option>
                <option value="landlord">Landlord Issue</option>
                <option value="agent">Agent Issue</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <div className="flex gap-2">
              {['low', 'medium', 'high', 'urgent'].map((priority) => (
                <button
                  key={priority}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority })}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors capitalize ${
                    formData.priority === priority
                      ? priority === 'urgent' ? 'bg-red-500 text-white' :
                        priority === 'high' ? 'bg-orange-500 text-white' :
                        priority === 'medium' ? 'bg-blue-500 text-white' :
                        'bg-gray-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
              maxLength={200}
              placeholder="Brief description of your issue"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={5}
              maxLength={5000}
              placeholder="Provide detailed information about your issue..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Ticket
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// Ticket Detail Modal Component
const TicketDetailModal = ({ ticket, isAdmin, onClose, onUpdate }) => {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddResponse = async () => {
    if (!response.trim()) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.post(`${Backendurl}/api/tickets/${ticket._id}/responses`, 
        { message: response },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Response added');
      setResponse('');
      onUpdate();
    } catch (error) {
      toast.error('Failed to add response');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${Backendurl}/api/tickets/${ticket._id}`, 
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Ticket updated');
      onUpdate();
    } catch (error) {
      toast.error('Failed to update ticket');
    }
  };

  if (!ticket) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono text-gray-400">{ticket.ticketNumber}</span>
              <h2 className="text-xl font-bold text-gray-900 mt-1">{ticket.subject}</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-gray-700">{ticket.description}</p>
            <p className="text-xs text-gray-400 mt-2">
              Created {new Date(ticket.createdAt).toLocaleString()}
            </p>
          </div>

          {isAdmin && (
            <div className="flex gap-2 mb-4">
              {['in_progress', 'waiting_response', 'resolved', 'closed'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium capitalize ${
                    ticket.status === status 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Responses</h3>
            {ticket.responses?.length === 0 ? (
              <p className="text-gray-500 text-sm">No responses yet</p>
            ) : (
              ticket.responses?.map((res, idx) => (
                <div key={idx} className={`p-4 rounded-lg ${res.isAdminResponse ? 'bg-emerald-50 border border-emerald-100' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-sm">{res.user?.name || 'User'}</span>
                    {res.isAdminResponse && (
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Admin</span>
                    )}
                  </div>
                  <p className="text-gray-700 text-sm">{res.message}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(res.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-100">
          <div className="flex gap-2">
            <textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Add a response..."
              rows={2}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            />
            <button
              onClick={handleAddResponse}
              disabled={loading || !response.trim()}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Tickets;
