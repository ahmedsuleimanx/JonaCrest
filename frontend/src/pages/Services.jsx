import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { Backendurl } from '../App';
import {
  Truck,
  SprayCan,
  Wrench,
  Scale,
  ClipboardCheck,
  HelpCircle,
  X,
  Calendar,
  MapPin,
  Phone,
  FileText,
  Loader,
  CheckCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const services = [
  {
    id: 'Moving',
    title: 'Moving Services',
    description: 'Professional moving services to help you relocate seamlessly. We handle packing, transportation, and unpacking with care.',
    icon: Truck,
    color: 'from-blue-500 to-indigo-600',
    features: ['Local & Long Distance', 'Packing & Unpacking', 'Furniture Assembly', 'Insurance Coverage']
  },
  {
    id: 'Cleaning',
    title: 'Cleaning Services',
    description: 'Comprehensive cleaning solutions for your property. From deep cleaning to regular maintenance.',
    icon: SprayCan,
    color: 'from-emerald-500 to-teal-600',
    features: ['Deep Cleaning', 'Move-in/Move-out', 'Regular Maintenance', 'Eco-Friendly Products']
  },
  {
    id: 'Maintenance',
    title: 'Maintenance & Repairs',
    description: 'Expert maintenance and repair services to keep your property in top condition.',
    icon: Wrench,
    color: 'from-orange-500 to-amber-600',
    features: ['Plumbing', 'Electrical', 'HVAC', 'General Repairs']
  },
  {
    id: 'Legal',
    title: 'Legal Services',
    description: 'Professional legal assistance for property transactions, documentation, and disputes.',
    icon: Scale,
    color: 'from-purple-500 to-violet-600',
    features: ['Title Searches', 'Contract Review', 'Dispute Resolution', 'Documentation']
  },
  {
    id: 'Inspection',
    title: 'Property Inspection',
    description: 'Thorough property inspections to ensure your investment is sound and secure.',
    icon: ClipboardCheck,
    color: 'from-rose-500 to-pink-600',
    features: ['Pre-Purchase', 'Pre-Rental', 'Structural Assessment', 'Detailed Reports']
  },
  {
    id: 'Other',
    title: 'Other Services',
    description: 'Custom services tailored to your specific property needs. Contact us for personalized solutions.',
    icon: HelpCircle,
    color: 'from-gray-500 to-slate-600',
    features: ['Custom Requests', 'Consultation', 'Property Staging', 'Photography']
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' }
  }
};

const Services = () => {
  const { user } = useAuth();
  const [selectedService, setSelectedService] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    details: '',
    location: '',
    scheduledDate: '',
    contactPhone: ''
  });

  const openModal = (service) => {
    if (!user) {
      toast.info('Please login to request a service.');
      return;
    }
    setSelectedService(service);
    setIsModalOpen(true);
    setFormData({ details: '', location: '', scheduledDate: '', contactPhone: '' });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedService(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedService) return;
    setLoading(true);

    try {
      const response = await axios.post(
        `${Backendurl}/api/services/create`,
        {
          serviceType: selectedService.id,
          details: formData.details,
          location: formData.location,
          scheduledDate: formData.scheduledDate,
          contactPhone: formData.contactPhone
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      if (response.data.success) {
        toast.success('Service request submitted successfully!');
        closeModal();
      } else {
        toast.error(response.data.message || 'Failed to submit request');
      }
    } catch (error) {
      console.error('Service request error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Services | Jona Crest Properties</title>
        <meta name="description" content="Explore our range of property services including moving, cleaning, maintenance, legal, and inspections." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-20 pb-16">
        {/* Hero Section */}
        <section className="relative py-16 px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-[#c9a227]" />
              <span className="text-sm font-medium text-[#00796b] uppercase tracking-wider">Premium Services</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Property <span className="text-[#00796b]">Services</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive property services to make your real estate journey seamless.
              From moving to maintenance, we have got you covered.
            </p>
          </motion.div>
        </section>

        {/* Services Grid */}
        <section className="max-w-7xl mx-auto px-4 pb-16">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {services.map((service) => {
              const IconComponent = service.icon;
              return (
                <motion.div
                  key={service.id}
                  variants={cardVariants}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl overflow-hidden border border-white/20 group"
                >
                  <div className={`h-2 w-full bg-gradient-to-r ${service.color}`} />
                  <div className="p-6">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${service.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                    <p className="text-gray-600 mb-4 text-sm">{service.description}</p>
                    <ul className="space-y-2 mb-6">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-500">
                          <CheckCircle className="w-4 h-4 text-[#00796b]" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openModal(service)}
                      className={`w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${service.color} shadow-lg flex items-center justify-center gap-2 transition-all hover:shadow-xl`}
                    >
                      Request Service
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </section>
      </div>

      {/* Request Modal */}
      <AnimatePresence>
        {isModalOpen && selectedService && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div className={`p-6 bg-gradient-to-r ${selectedService.color} text-white relative`}>
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-4">
                  {(() => {
                    const Icon = selectedService.icon;
                    return <Icon className="w-10 h-10" />;
                  })()}
                  <div>
                    <h2 className="text-2xl font-bold">{selectedService.title}</h2>
                    <p className="text-white/80 text-sm">Fill out the form below</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    Details / Description
                  </label>
                  <textarea
                    name="details"
                    value={formData.details}
                    onChange={handleChange}
                    required
                    rows={3}
                    placeholder="Describe your service needs..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00796b]/30 focus:border-[#00796b] transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    Location / Address
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    placeholder="Enter your address"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00796b]/30 focus:border-[#00796b] transition-all"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    name="scheduledDate"
                    value={formData.scheduledDate}
                    onChange={handleChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00796b]/30 focus:border-[#00796b] transition-all"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    required
                    placeholder="0548185948"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#00796b]/30 focus:border-[#00796b] transition-all"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-4 rounded-xl font-semibold text-white bg-gradient-to-r ${selectedService.color} shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Submit Request
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Services;
