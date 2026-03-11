import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList, Search, Filter, Check, X, Clock,
  Eye, ChevronLeft, ChevronRight, Loader, AlertCircle,
  CheckCircle, XCircle, Timer, User, Building2, Phone
} from 'lucide-react';
import { backendurl } from '../config/constants';
import { TablePageShimmer } from '../components/ShimmerLoading';
import toast from 'react-hot-toast';

const statusConfig = {
  pending: { color: 'bg-amber-100 text-amber-700', icon: Clock, label: 'Pending' },
  approved: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Approved' },
  'in-progress': { color: 'bg-blue-100 text-blue-700', icon: Timer, label: 'In Progress' },
  completed: { color: 'bg-emerald-100 text-emerald-700', icon: Check, label: 'Completed' },
  cancelled: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Cancelled' },
  rejected: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Rejected' },
};

const ServiceRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 10;

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${backendurl}/api/service-requests/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.data.success) {
        setRequests(res.data.serviceRequests || []);
      }
    } catch (err) {
      console.error('Error fetching service requests:', err);
      toast.error('Failed to fetch service requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      setActionLoading(requestId);
      const res = await axios.put(
        `${backendurl}/api/service-requests/${requestId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      if (res.data.success) {
        toast.success(`Request ${newStatus} successfully`);
        setRequests(prev => prev.map(r =>
          r._id === requestId ? { ...r, status: newStatus } : r
        ));
        if (selectedRequest?._id === requestId) {
          setSelectedRequest(prev => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch =
      req.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.serviceType?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredRequests.length / perPage);
  const paginated = filteredRequests.slice((currentPage - 1) * perPage, currentPage * perPage);

  if (loading) return <TablePageShimmer />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Service Requests</h1>
          <p className="text-gray-500 mt-1">
            {requests.filter(r => r.status === 'pending').length} pending approval
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass-badge text-amber-700 bg-amber-50 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {requests.filter(r => r.status === 'pending').length} Pending
          </div>
          <div className="glass-badge text-green-700 bg-green-50 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" />
            {requests.filter(r => r.status === 'approved' || r.status === 'completed').length} Approved
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by user or service type..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="glass-input w-full pl-10 text-sm"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {['all', 'pending', 'approved', 'in-progress', 'completed', 'rejected'].map(status => (
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
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {paginated.map((req, idx) => {
          const config = statusConfig[req.status] || statusConfig.pending;
          const StatusIcon = config.icon;
          return (
            <motion.div
              key={req._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="glass-card p-5 hover:shadow-lg transition-all group"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                    {req.userId?.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-800">{req.userId?.name || 'Unknown User'}</h3>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {config.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      <span className="font-medium text-gray-700">{req.serviceType}</span>
                      {req.propertyId?.title && (
                        <span> · {req.propertyId.title}</span>
                      )}
                    </p>
                    {req.details && (
                      <p className="text-sm text-gray-400 mt-1 line-clamp-2">{req.details}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {req.createdAt && new Date(req.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => { setSelectedRequest(req); setShowModal(true); }}
                    className="p-2 rounded-lg hover:bg-blue-100 text-gray-500 hover:text-blue-600 transition-all"
                    title="View details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {req.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(req._id, 'approved')}
                        disabled={actionLoading === req._id}
                        className="p-2 rounded-lg hover:bg-green-100 text-gray-500 hover:text-green-600 transition-all disabled:opacity-50"
                        title="Approve"
                      >
                        {actionLoading === req._id ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(req._id, 'rejected')}
                        disabled={actionLoading === req._id}
                        className="p-2 rounded-lg hover:bg-red-100 text-gray-500 hover:text-red-600 transition-all disabled:opacity-50"
                        title="Reject"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {paginated.length === 0 && (
        <div className="glass-card p-16 text-center">
          <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No service requests found</p>
          <p className="text-gray-400 text-sm">Requests will appear here when users submit them</p>
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

      {/* Detail Modal */}
      <AnimatePresence>
        {showModal && selectedRequest && (
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
              className="glass-card p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Request Details</h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                {/* User Info */}
                <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50/80">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-semibold text-gray-800">{selectedRequest.userId?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{selectedRequest.userId?.email}</p>
                  </div>
                </div>

                {/* Service Type */}
                <div className="p-4 rounded-xl bg-gray-50/80">
                  <p className="text-xs text-gray-500 mb-1">Service Type</p>
                  <p className="font-semibold text-gray-800">{selectedRequest.serviceType}</p>
                </div>

                {/* Property */}
                {selectedRequest.propertyId && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50/80">
                    <Building2 className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-semibold text-gray-800">{selectedRequest.propertyId.title || 'Unknown Property'}</p>
                      <p className="text-xs text-gray-500">{selectedRequest.propertyId.address || selectedRequest.propertyId.location}</p>
                    </div>
                  </div>
                )}

                {/* Details */}
                {selectedRequest.details && (
                  <div className="p-4 rounded-xl bg-gray-50/80">
                    <p className="text-xs text-gray-500 mb-1">Details</p>
                    <p className="text-sm text-gray-700">{selectedRequest.details}</p>
                  </div>
                )}

                {/* Contact */}
                {selectedRequest.contactPhone && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50/80">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-700">{selectedRequest.contactPhone}</span>
                  </div>
                )}

                {/* Status */}
                <div className="p-4 rounded-xl bg-gray-50/80">
                  <p className="text-xs text-gray-500 mb-2">Status</p>
                  {(() => {
                    const config = statusConfig[selectedRequest.status] || statusConfig.pending;
                    const StatusIcon = config.icon;
                    return (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${config.color}`}>
                        <StatusIcon className="w-4 h-4" />
                        {config.label}
                      </span>
                    );
                  })()}
                </div>

                {/* Action Buttons */}
                {selectedRequest.status === 'pending' && (
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => handleStatusUpdate(selectedRequest._id, 'approved')}
                      disabled={actionLoading === selectedRequest._id}
                      className="flex-1 glass-btn flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 disabled:opacity-50"
                    >
                      {actionLoading === selectedRequest._id ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedRequest._id, 'rejected')}
                      disabled={actionLoading === selectedRequest._id}
                      className="flex-1 glass-btn flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-rose-600 disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ServiceRequests;
