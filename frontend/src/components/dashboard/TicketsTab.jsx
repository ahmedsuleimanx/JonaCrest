import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertCircle, Search, Filter, Plus, Clock, 
  CheckCircle, MessageSquare, ChevronRight, Circle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Backendurl } from '../../App';
import CreateTicketModal from './CreateTicketModal';
import { useAuth } from '../../context/AuthContext';
import Pagination from '../Pagination';

const TicketsTab = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all'); // all, open, closed
  const [iscreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Determine endpoint based on role
      const endpoint = user.role === 'admin' 
        ? `${Backendurl}/api/tickets/all`
        : `${Backendurl}/api/tickets/my-tickets`;
      
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setTickets(response.data.tickets);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [user.role]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-700 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-500 bg-red-50';
      case 'high': return 'text-orange-500 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-blue-500 bg-blue-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const filteredTickets = tickets.filter(ticket => {
    // Status Filter
    if (activeFilter === 'open' && (ticket.status === 'resolved' || ticket.status === 'closed')) return false;
    if (activeFilter === 'closed' && (ticket.status !== 'resolved' && ticket.status !== 'closed')) return false;
    
    // Search Query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        ticket.subject.toLowerCase().includes(query) ||
        ticket.ticketNumber.toLowerCase().includes(query) ||
        ticket.description.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTickets = filteredTickets.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeFilter === 'all' 
                ? 'bg-purple-100 text-purple-700' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            All Tickets
          </button>
          <button
            onClick={() => setActiveFilter('open')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeFilter === 'open' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Open
          </button>
          <button
            onClick={() => setActiveFilter('closed')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeFilter === 'closed' 
                ? 'bg-green-100 text-green-700' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Closed
          </button>
        </div>

        <div className="flex w-full sm:w-auto gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm"
            />
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Ticket</span>
            <span className="inline sm:hidden">New</span>
          </button>
        </div>
      </div>

      {/* Tickets List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent"></div>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
          <p className="text-gray-500">
            {searchQuery 
              ? `No results matching "${searchQuery}"`
              : "Create a new ticket to get support."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-50">
            {currentTickets.map((ticket) => (
              <motion.div
                key={ticket._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => navigate(`/tickets/${ticket._id}`)}
                className="p-4 sm:p-6 hover:bg-gray-50 transition-colors cursor-pointer group"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-gray-500">#{ticket.ticketNumber}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${getPriorityColor(ticket.priority)}`}>
                        <Circle className="w-2 h-2 fill-current" />
                        {ticket.priority}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
                      {ticket.subject}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                      {ticket.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(ticket.createdAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {ticket.responses?.length || 0} responses
                      </div>
                      {user.role === 'admin' && ticket.creator && (
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                          Created by {ticket.creator.name}
                        </div>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-purple-400 transition-colors mt-2" />
                </div>
              </motion.div>
            ))}
          </div>
          
          <Pagination 
            currentPage={currentPage}
            totalItems={filteredTickets.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Create Ticket Modal */}
      <CreateTicketModal
        isOpen={iscreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTicketCreated={(newTicket) => {
          setTickets([newTicket, ...tickets]);
          setIsCreateModalOpen(false);
        }}
      />
    </div>
  );
};

export default TicketsTab;
