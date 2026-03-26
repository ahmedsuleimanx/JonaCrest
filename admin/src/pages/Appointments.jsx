import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  User,
  Home,
  Check,
  X,
  Loader,
  Filter,
  Search,
  Link as LinkIcon,
  Send,
  DollarSign,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { backendurl } from "../config/constants";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingMeetingLink, setEditingMeetingLink] = useState(null);
  const [meetingLink, setMeetingLink] = useState("");
  const [paymentModal, setPaymentModal] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDescription, setPaymentDescription] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendurl}/api/appointments/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (response.data.success) {
        // Filter out appointments with missing user data
        const validAppointments = response.data.appointments.filter(
          (apt) => apt.userId && apt.propertyId
        );
        setAppointments(validAppointments);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Failed to fetch appointments");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      const response = await axios.put(
        `${backendurl}/api/appointments/status`,
        {
          appointmentId,
          status: newStatus,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.data.success) {
        toast.success(`Appointment ${newStatus} successfully`);
        fetchAppointments();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error updating appointment:", error);
      toast.error("Failed to update appointment status");
    }
  };

  const handleMeetingLinkUpdate = async (appointmentId) => {
    try {
      if (!meetingLink) {
        toast.error("Please enter a meeting link");
        return;
      }

      const response = await axios.put(
        `${backendurl}/api/appointments/update-meeting`,
        {
          appointmentId,
          meetingLink,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.data.success) {
        toast.success("Meeting link sent successfully");
        setEditingMeetingLink(null);
        setMeetingLink("");
        fetchAppointments();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error updating meeting link:", error);
      toast.error("Failed to update meeting link");
    }
  };

  const handleRequestPayment = async (appointment) => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    try {
      setPaymentLoading(true);
      const response = await axios.post(
        `${backendurl}/api/payment/request`,
        {
          userId: appointment.userId?._id,
          referenceType: "viewing",
          referenceId: appointment._id,
          amount: parseFloat(paymentAmount),
          description: paymentDescription || `Payment for viewing: ${appointment.propertyId?.title || 'Property'}`,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (response.data.success) {
        toast.success("Payment request sent successfully");
        setPaymentModal(null);
        setPaymentAmount("");
        setPaymentDescription("");
      } else {
        toast.error(response.data.message || "Failed to request payment");
      }
    } catch (error) {
      console.error("Error requesting payment:", error);
      toast.error(error.response?.data?.message || "Failed to request payment");
    } finally {
      setPaymentLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      searchTerm === "" ||
      apt.propertyId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filter === "all" || apt.status === filter;

    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <Loader className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header and Search Section - Keep existing code */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              Appointments
            </h1>
            <p className="text-gray-600">
              Manage and track property viewing appointments
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="rounded-lg border border-gray-200 px-4 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Appointments</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Meeting Link
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAppointments.map((appointment) => (
                  <motion.tr
                    key={appointment._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="hover:bg-gray-50"
                  >
                    {/* Property Details */}
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Home className="w-5 h-5 text-gray-400 mr-2" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {appointment.propertyId.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {appointment.propertyId.location}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Client Details */}
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <User className="w-5 h-5 text-gray-400 mr-2" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {appointment.userId?.name || "Unknown"}
                          </p>
                          <p className="text-sm text-gray-500">
                            {appointment.userId?.email || "Unknown"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Date & Time */}
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {new Date(appointment.date).toLocaleDateString()}
                          </p>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-4 h-4 mr-1" />
                            {appointment.time}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          appointment.status
                        )}`}
                      >
                        {appointment.status.charAt(0).toUpperCase() +
                          appointment.status.slice(1)}
                      </span>
                    </td>

                    {/* Meeting Link */}
                    <td className="px-6 py-4">
                      {editingMeetingLink === appointment._id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="url"
                            value={meetingLink}
                            onChange={(e) => setMeetingLink(e.target.value)}
                            placeholder="Enter meeting link"
                            className="px-2 py-1 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm w-full"
                          />
                          <button
                            onClick={() =>
                              handleMeetingLinkUpdate(appointment._id)
                            }
                            className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingMeetingLink(null);
                              setMeetingLink("");
                            }}
                            className="p-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          {appointment.meetingLink ? (
                            <a
                              href={appointment.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                            >
                              <LinkIcon className="w-4 h-4" />
                              View Link
                            </a>
                          ) : (
                            <span className="text-gray-500">No link yet</span>
                          )}
                          {appointment.status === "confirmed" && (
                            <button
                              onClick={() => {
                                setEditingMeetingLink(appointment._id);
                                setMeetingLink(appointment.meetingLink || "");
                              }}
                              className="ml-2 text-gray-400 hover:text-gray-600"
                            >
                              <LinkIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {appointment.status === "pending" && (
                          <>
                            <button
                              onClick={() =>
                                handleStatusChange(appointment._id, "confirmed")
                              }
                              className="p-1 bg-green-500 text-white rounded hover:bg-green-600"
                              title="Confirm"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleStatusChange(appointment._id, "cancelled")
                              }
                              className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            setPaymentModal(appointment);
                            setPaymentAmount("");
                            setPaymentDescription("");
                          }}
                          className="p-1 bg-amber-500 text-white rounded hover:bg-amber-600"
                          title="Request Payment"
                        >
                          <DollarSign className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAppointments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No appointments found
            </div>
          )}
        </div>
      </div>

      {/* Payment Request Modal */}
      <AnimatePresence>
        {paymentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setPaymentModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-amber-500" />
                  Request Payment
                </h3>
                <button
                  onClick={() => setPaymentModal(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500">Viewing for</p>
                  <p className="font-semibold text-gray-800">
                    {paymentModal.propertyId?.title || "Property"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Client: {paymentModal.userId?.name || "Unknown"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (GHS) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    value={paymentDescription}
                    onChange={(e) => setPaymentDescription(e.target.value)}
                    placeholder="e.g. Viewing fee, Inspection fee..."
                    rows={2}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
                  />
                </div>

                <button
                  onClick={() => handleRequestPayment(paymentModal)}
                  disabled={paymentLoading || !paymentAmount}
                  className="w-full py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {paymentLoading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Payment Request
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Appointments;
