import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck, Wrench, Sparkles, Scale, Search, ClipboardCheck,
  ArrowRight, CheckCircle, Clock, Star, Phone, Mail,
  ChevronRight, Loader2, X
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Backendurl } from '../../App';

const SERVICES = [
  {
    id: 'moving',
    title: 'Moving Services',
    description: 'Professional moving and relocation assistance for a stress-free transition to your new home.',
    icon: Truck,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
    features: ['Packing & Unpacking', 'Furniture Assembly', 'Local & Long Distance', 'Storage Solutions'],
    price: 'From $200'
  },
  {
    id: 'cleaning',
    title: 'Cleaning Services',
    description: 'Deep cleaning and maintenance services for move-in, move-out, or regular upkeep.',
    icon: Sparkles,
    color: 'from-emerald-500 to-emerald-600',
    bgColor: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    features: ['Deep Cleaning', 'Move-in/Move-out', 'Regular Maintenance', 'Carpet & Upholstery'],
    price: 'From $100'
  },
  {
    id: 'maintenance',
    title: 'Maintenance & Repairs',
    description: 'Expert maintenance and repair services to keep your property in perfect condition.',
    icon: Wrench,
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-50',
    iconColor: 'text-orange-600',
    features: ['Plumbing', 'Electrical', 'HVAC', 'General Repairs'],
    price: 'From $50'
  },
  {
    id: 'legal',
    title: 'Legal Services',
    description: 'Professional legal assistance for property documentation, contracts, and transfers.',
    icon: Scale,
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-50',
    iconColor: 'text-purple-600',
    features: ['Contract Review', 'Title Transfer', 'Due Diligence', 'Legal Consultation'],
    price: 'From $150'
  },
  {
    id: 'inspection',
    title: 'Property Inspection',
    description: 'Comprehensive property inspections to ensure your investment is sound.',
    icon: Search,
    color: 'from-red-500 to-red-600',
    bgColor: 'bg-red-50',
    iconColor: 'text-red-600',
    features: ['Structural Assessment', 'Pest Inspection', 'Systems Check', 'Detailed Report'],
    price: 'From $200'
  },
  {
    id: 'valuation',
    title: 'Property Valuation',
    description: 'Professional property valuation services for buying, selling, or refinancing.',
    icon: ClipboardCheck,
    color: 'from-amber-500 to-amber-600',
    bgColor: 'bg-amber-50',
    iconColor: 'text-amber-600',
    features: ['Market Analysis', 'Comparative Valuation', 'Investment Analysis', 'Official Report'],
    price: 'From $100'
  }
];

const ServiceCard = ({ service, onRequest }) => {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = service.icon;

  return (
    <motion.div
      layout
      whileHover={{ y: -5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="dash-glass-card overflow-hidden group"
    >
      <div className={`h-2 bg-gradient-to-r ${service.color}`} />
      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className={`p-3 rounded-xl ${service.bgColor}`}>
            <Icon className={`w-6 h-6 ${service.iconColor}`} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-[var(--text-primary)] text-lg">{service.title}</h3>
            <p className="text-sm text-[var(--accent)] font-semibold">{service.price}</p>
          </div>
        </div>
        
        <p className="text-sm text-[var(--text-secondary)] mb-4">{service.description}</p>
        
        <div className="space-y-2 mb-6">
          {service.features.map((feature, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => onRequest(service)}
          className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
            isHovered
              ? `bg-gradient-to-r ${service.color} text-white`
              : 'bg-[var(--glass-bg)] text-[var(--text-primary)] border border-[var(--glass-border)]'
          }`}
        >
          Request Service
          <ArrowRight className={`w-4 h-4 transition-transform ${isHovered ? 'translate-x-1' : ''}`} />
        </button>
      </div>
    </motion.div>
  );
};

const RequestModal = ({ service, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    propertyAddress: '',
    preferredDate: '',
    preferredTime: '',
    description: '',
    urgency: 'normal'
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        serviceType: service.id,
        serviceName: service.title,
        ...formData
      });
      onClose();
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`p-6 bg-gradient-to-r ${service.color} text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <service.icon className="w-8 h-8" />
              <div>
                <h3 className="text-xl font-bold">Request {service.title}</h3>
                <p className="text-sm opacity-90">{service.price}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Address *</label>
            <input
              type="text"
              required
              value={formData.propertyAddress}
              onChange={(e) => setFormData({ ...formData, propertyAddress: e.target.value })}
              placeholder="Enter the property address"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date *</label>
              <input
                type="date"
                required
                value={formData.preferredDate}
                onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
              <select
                value={formData.preferredTime}
                onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
              >
                <option value="">Any time</option>
                <option value="morning">Morning (8AM - 12PM)</option>
                <option value="afternoon">Afternoon (12PM - 5PM)</option>
                <option value="evening">Evening (5PM - 8PM)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
            <div className="flex gap-3">
              {['normal', 'urgent', 'emergency'].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setFormData({ ...formData, urgency: level })}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    formData.urgency === level
                      ? level === 'emergency' 
                        ? 'bg-red-500 text-white'
                        : level === 'urgent'
                        ? 'bg-orange-500 text-white'
                        : 'bg-[var(--accent)] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Details</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what you need help with..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all bg-gradient-to-r ${service.color} hover:opacity-90 disabled:opacity-50`}
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                Submit Request
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

const ServicesTab = () => {
  const [selectedService, setSelectedService] = useState(null);

  const handleServiceRequest = async (data) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to request services');
        return;
      }

      const response = await axios.post(
        `${Backendurl}/api/services/create`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Service request submitted successfully!');
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error(error.response?.data?.message || 'Failed to submit request');
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Our Services</h2>
        <p className="text-[var(--text-secondary)]">Professional services to support your property journey</p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SERVICES.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            onRequest={setSelectedService}
          />
        ))}
      </div>

      {/* Contact Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="dash-glass-card p-6"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">Need Custom Service?</h3>
            <p className="text-[var(--text-secondary)]">
              Can't find what you're looking for? Contact us for personalized assistance.
            </p>
          </div>
          <div className="flex gap-4">
            <a
              href="tel:+233000000000"
              className="px-6 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl font-medium flex items-center gap-2 hover:bg-[var(--accent)]/10 transition-colors"
            >
              <Phone className="w-5 h-5" />
              Call Us
            </a>
            <a
              href="mailto:support@jonacrest.com"
              className="px-6 py-3 bg-[var(--accent)] text-white rounded-xl font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Mail className="w-5 h-5" />
              Email Us
            </a>
          </div>
        </div>
      </motion.div>

      {/* Request Modal */}
      <AnimatePresence>
        {selectedService && (
          <RequestModal
            service={selectedService}
            onClose={() => setSelectedService(null)}
            onSubmit={handleServiceRequest}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ServicesTab;
