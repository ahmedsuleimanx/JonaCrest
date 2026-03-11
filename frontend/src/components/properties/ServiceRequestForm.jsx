import React, { useState } from 'react';
import { Truck, Calendar, Phone, MapPin, FileText, X, Loader, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Backendurl } from '../../App';

const ServiceRequestForm = ({ onClose, initialServiceType = 'Moving' }) => {
  const [formData, setFormData] = useState({
    serviceType: initialServiceType,
    location: '',
    scheduledDate: '',
    contactPhone: '',
    details: ''
  });
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const serviceTypes = ['Moving', 'Cleaning', 'Maintenance', 'Inspection', 'Other'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to submit a request');
        return;
      }

      setLoading(true);
      const response = await axios.post(
        `${Backendurl}/api/services/create`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setIsSuccess(true);
        setTimeout(() => {
          onClose && onClose();
        }, 3000);
      }
    } catch (error) {
      console.error('Service request error:', error);
      toast.error(error.response?.data?.message || 'Error submitting request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-lg shadow-2xl relative overflow-hidden"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full p-2 hover:bg-gray-100 transition-colors z-10"
          >
            <X size={20} />
          </button>

          {!isSuccess ? (
            <>
              <div className="mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600">
                  <Truck className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Request Service</h2>
                <p className="text-gray-500 mt-1">Get professional help for your property needs</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {serviceTypes.slice(0, 3).map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData({ ...formData, serviceType: type })}
                        className={`py-2 px-3 text-sm rounded-lg border transition-all
                          ${formData.serviceType === type 
                            ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium' 
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
                      <div className="relative">
                        <input
                          type="date"
                          required
                          value={formData.scheduledDate}
                          onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        />
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      </div>
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                      <div className="relative">
                        <input
                          type="tel"
                          required
                          placeholder="+233..."
                          value={formData.contactPhone}
                          onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        />
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      </div>
                   </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Property Address or GPS Address"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional Details</label>
                  <div className="relative">
                    <textarea
                      required
                      rows="3"
                      placeholder="Describe what you need help with..."
                      value={formData.details}
                      onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                    />
                    <FileText className="absolute left-3 top-4 text-gray-400 w-4 h-4" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 
                    transition-all shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2 font-medium disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Request Received!</h3>
              <p className="text-gray-500 mb-8 max-w-xs mx-auto">
                We've received your service request. Our team will contact you shortly to confirm the details.
              </p>
              <button
                onClick={onClose}
                className="bg-gray-100 text-gray-900 py-2.5 px-8 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                Close
              </button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ServiceRequestForm;
