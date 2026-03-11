import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ticket, Search, Filter, Clock, CheckCircle, XCircle, AlertCircle,
  Eye, ChevronLeft, ChevronRight, Loader, MessageSquare, Send,
  User, Calendar, Tag, ArrowRight, RefreshCw, X
} from 'lucide-react';
import { backendurl } from '../config/constants';
import { TablePageShimmer } from '../components/ShimmerLoading';
import toast from 'react-hot-toast';

const priorityConfig = {
  low: { color: 'bg-gray-100 text-gray-600', label: 'Low' },
  medium: { color: 'bg-amber-100 text-amber-700', label: 'Medium' },
  high: { color: 'bg-orange-100 text-orange-700', label: 'High' },
  urgent: { color: 'bg-red-100 text-red-700', label: 'Urgent' },
};

const statusConfig = {
  open: { color: 'bg-blue-100 text-blue-700', icon: AlertCircle, label: 'Open' },
  'in-progress': { color: 'bg-amber-100 text-amber-700', icon: Clock, label: 'In Progress' },
  resolved: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Resolved' },
  closed: { color: 'bg-gray-100 text-gray-600', icon: XCircle, label: 'Closed' },
};

const categoryLabels = {
  general: 'General Inquiry',
  technical: 'Technical Issue',
  billing: 'Billing',
  property: 'Property Related',
  account: 'Account Issue',
  other: 'Other',
};

const TicketsManagement = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [responseText, setResponseText] = useState('');
  const [stats, setStats] = useState({ open: 0, inProgress: 0, resolved: 0, closed: 0 });
  const perPage = 10;

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`${backendurl}/api/admin/tickets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setTickets(res.data.tickets || []);
        // Calculate stats
        const ticketList = res.data.tickets || [];
        setStats({
          open: ticketList.filter(t => t.status === 'open').length,
          inProgress: ticketList.filter(t => t.status === 'in-progress').length,
          resolved: ticketList.filter(t => t.status === 'resolved').length,
          closed: ticketList.filter(t => t.status === 'closed').length,
        });
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
      toast.error('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const handleStatusUpdate = async (ticketId, newStatus) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.patch(
        `${backendurl}/api/admin/tickets/${ticketId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success(`Ticket ${newStatus.replace('-', ' ')}`);
        setTickets(prev => prev.map(t =>
          t._id === ticketId ? { ...t, status: newStatus } : t
        ));
        if (selectedTicket?._id === ticketId) {
          setSelectedTicket(prev => ({ ...prev, status: newStatus }));
        }
        // Update stats
        fetchTickets();
      }
    } catch (err) {
      toast.error('Failed to update ticket status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendResponse = async () => {
    if (!responseText.trim() || !selectedTicket) return;
    
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${backendurl}/api/admin/tickets/${selectedTicket._id}/responses`,
        { message: responseText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success('Response sent successfully');
        setResponseText('');
        // Update the selected ticket with new response
        setSelectedTicket(res.data.ticket);
        // Update tickets list
        setTickets(prev => prev.map(t =>
          t._id === selectedTicket._id ? res.data.ticket : t
        ));
      }
    } catch (err) {
      toast.error('Failed to send response');
    } finally {
      setActionLoading(false);
    }
  };

  const openTicketDetail = async (ticket) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${backendurl}/api/admin/tickets/${ticket._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setSelectedTicket(res.data.ticket);
        setShowModal(true);
      }
    } catch (err) {
      toast.error('Failed to load ticket details');
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch =
      ticket.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.ticketNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.creator?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const totalPages = Math.ceil(filteredTickets.length / perPage);
  const paginated = filteredTickets.slice((currentPage - 1) * perPage, currentPage * perPage);

  if (loading) return <TablePageShimmer />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Support Tickets</h1>
          <p className="text-gray-500 mt-1">
            Manage and respond to user support requests
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchTickets}
            className="p-2 glass-card hover:bg-gray-50 transition-colors"
            style={{ borderRadius: '10px' }}
          >
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.open}</p>
              <p className="text-xs text-gray-500">Open</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
              <p className="text-xs text-gray-500">In Progress</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.resolved}</p>
              <p className="text-xs text-gray-500">Resolved</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.closed}</p>
              <p className="text-xs text-gray-500">Closed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-col lg:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by ticket #, subject, or user..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="glass-input w-full pl-10 text-sm"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500 font-medium">Status:</span>
          {['all', 'open', 'in-progress', 'resolved', 'closed'].map(status => (
            <button
              key={status}
              onClick={() => { setFilterStatus(status); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterStatus === status
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'glass-badge text-gray-600 hover:text-gray-800'
              }`}
            >
              {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500 font-medium">Priority:</span>
          {['all', 'low', 'medium', 'high', 'urgent'].map(priority => (
            <button
              key={priority}
              onClick={() => { setFilterPriority(priority); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterPriority === priority
                  ? 'bg-indigo-500 text-white shadow-md'
                  : 'glass-badge text-gray-600 hover:text-gray-800'
              }`}
            >
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {paginated.map((ticket, idx) => {
          const statusCfg = statusConfig[ticket.status] || statusConfig.open;
          const priorityCfg = priorityConfig[ticket.priority] || priorityConfig.medium;
          const StatusIcon = statusCfg.icon;
          
          return (
            <motion.div
              key={ticket._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="glass-card p-5 hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => openTicketDetail(ticket)}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                    <Ticket className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-gray-400">{ticket.ticketNumber}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${statusCfg.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusCfg.label}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${priorityCfg.color}`}>
                        {priorityCfg.label}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-800 mt-1 line-clamp-1">{ticket.subject}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {ticket.creator?.name || 'Unknown'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {categoryLabels[ticket.category] || ticket.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                      {ticket.responses?.length > 0 && (
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {ticket.responses.length} responses
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {paginated.length === 0 && (
        <div className="glass-card p-16 text-center">
          <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No tickets found</p>
          <p className="text-gray-400 text-sm">Tickets will appear here when users submit them</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Page {currentPage} of {totalPages}</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 glass-card disabled:opacity-30"
              style={{ borderRadius: '10px' }}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 glass-card disabled:opacity-30"
              style={{ borderRadius: '10px' }}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Ticket Detail Modal */}
      <AnimatePresence>
        {showModal && selectedTicket && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="glass-card p-6 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-gray-400">{selectedTicket.ticketNumber}</span>
                    {(() => {
                      const cfg = statusConfig[selectedTicket.status] || statusConfig.open;
                      const Icon = cfg.icon;
                      return (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.color}`}>
                          <Icon className="w-3 h-3" />
                          {cfg.label}
                        </span>
                      );
                    })()}
                    {(() => {
                      const cfg = priorityConfig[selectedTicket.priority] || priorityConfig.medium;
                      return (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.color}`}>
                          {cfg.label} Priority
                        </span>
                      );
                    })()}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">{selectedTicket.subject}</h3>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Ticket Info */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-xs text-gray-500">Created by</p>
                  <p className="font-medium text-gray-800">{selectedTicket.creator?.name || 'Unknown'}</p>
                  <p className="text-xs text-gray-500">{selectedTicket.creator?.email}</p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50">
                  <p className="text-xs text-gray-500">Category</p>
                  <p className="font-medium text-gray-800">{categoryLabels[selectedTicket.category] || selectedTicket.category}</p>
                  <p className="text-xs text-gray-500">{new Date(selectedTicket.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Original Message */}
              <div className="p-4 rounded-xl bg-blue-50 mb-4">
                <p className="text-xs text-blue-600 font-medium mb-1">Original Message</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedTicket.description}</p>
              </div>

              {/* Responses */}
              <div className="flex-1 overflow-y-auto mb-4 space-y-3 max-h-[200px]">
                {selectedTicket.responses?.map((response, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl ${
                      response.isAdmin ? 'bg-indigo-50 ml-4' : 'bg-gray-50 mr-4'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold ${response.isAdmin ? 'text-indigo-600' : 'text-gray-600'}`}>
                        {response.isAdmin ? 'Admin' : response.user?.name || 'User'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(response.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{response.message}</p>
                  </div>
                ))}
                {(!selectedTicket.responses || selectedTicket.responses.length === 0) && (
                  <p className="text-sm text-gray-400 text-center py-4">No responses yet</p>
                )}
              </div>

              {/* Response Input */}
              {selectedTicket.status !== 'closed' && (
                <div className="border-t pt-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="Type your response..."
                      className="glass-input flex-1 text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && handleSendResponse()}
                    />
                    <button
                      onClick={handleSendResponse}
                      disabled={!responseText.trim() || actionLoading}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium text-sm disabled:opacity-50 flex items-center gap-2"
                    >
                      {actionLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Send
                    </button>
                  </div>
                </div>
              )}

              {/* Status Actions */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                <span className="text-xs text-gray-500">Change status:</span>
                {['open', 'in-progress', 'resolved', 'closed'].map(status => {
                  const cfg = statusConfig[status];
                  return (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(selectedTicket._id, status)}
                      disabled={selectedTicket.status === status || actionLoading}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-30 ${
                        selectedTicket.status === status ? cfg.color : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TicketsManagement;
