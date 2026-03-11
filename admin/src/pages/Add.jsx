import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { backendurl } from '../config/constants';
import { 
  Upload, X, Image, Video, MapPin, Home, DollarSign, 
  BedDouble, Bath, Maximize, Phone, Building2, Tag,
  CheckCircle, AlertCircle, Loader2, Plus, Trash2,
  ChevronRight, ChevronLeft, Sparkles, Eye, Save
} from 'lucide-react';

const PROPERTY_TYPES = [
  { value: 'House', icon: Home, color: 'bg-blue-100 text-blue-600' },
  { value: 'Apartment', icon: Building2, color: 'bg-purple-100 text-purple-600' },
  { value: 'Villa', icon: Home, color: 'bg-amber-100 text-amber-600' },
  { value: 'Townhouse', icon: Building2, color: 'bg-green-100 text-green-600' },
  { value: 'Commercial', icon: Building2, color: 'bg-red-100 text-red-600' },
  { value: 'Land', icon: MapPin, color: 'bg-teal-100 text-teal-600' },
];

const LISTING_TYPES = [
  { value: 'For Sale', label: 'For Sale', color: 'bg-green-500' },
  { value: 'For Rent', label: 'For Rent', color: 'bg-blue-500' },
  { value: 'Short Stay', label: 'Short Stay', color: 'bg-purple-500' },
];

const AMENITIES_LIST = [
  'Swimming Pool', 'Gym', 'Parking', 'Security', 'Garden', 
  'Air Conditioning', 'Furnished', 'Balcony', 'Elevator', 
  'Laundry', 'Storage', 'Pet Friendly', 'WiFi', 'CCTV',
  'Generator', 'Water Tank', 'Solar Power', 'Smart Home'
];

const CURRENCIES = [
  { value: 'GHS', label: 'GHS (₵)', symbol: '₵' },
  { value: 'USD', label: 'USD ($)', symbol: '$' },
  { value: 'EUR', label: 'EUR (€)', symbol: '€' },
  { value: 'GBP', label: 'GBP (£)', symbol: '£' },
];

const PropertyForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    listingType: 'For Sale',
    price: '',
    currency: 'GHS',
    location: '',
    address: { street: '', city: '', region: '', ghanaPostGps: '' },
    beds: '',
    baths: '',
    sqft: '',
    phone: '',
    amenities: [],
    videoUrl: '',
    featured: false,
  });

  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    handleFiles(files);
  }, []);

  const handleFiles = (files) => {
    if (files.length + images.length > 6) {
      toast.error('Maximum 6 images allowed');
      return;
    }

    const newImages = files.slice(0, 6 - images.length);
    const newPreviewUrls = newImages.map(file => URL.createObjectURL(file));
    
    setImages(prev => [...prev, ...newImages]);
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.title && formData.description && formData.type && formData.listingType;
      case 2:
        return formData.price && formData.location && formData.beds && formData.baths;
      case 3:
        return images.length > 0;
      default:
        return true;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const submitData = new FormData();
      
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('type', formData.type);
      submitData.append('listingType', formData.listingType);
      submitData.append('price', formData.price);
      submitData.append('currency', formData.currency);
      submitData.append('location', formData.location);
      submitData.append('address', JSON.stringify(formData.address));
      submitData.append('beds', formData.beds);
      submitData.append('baths', formData.baths);
      submitData.append('sqft', formData.sqft || '0');
      submitData.append('phone', formData.phone);
      submitData.append('amenities', JSON.stringify(formData.amenities));
      submitData.append('videoUrl', formData.videoUrl);
      submitData.append('featured', formData.featured);

      images.forEach((image, index) => {
        submitData.append(`image${index + 1}`, image);
      });

      const response = await axios.post(`${backendurl}/api/products/add`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        toast.success('Property added successfully!');
        navigate('/properties');
      } else {
        toast.error(response.data.message || 'Failed to add property');
      }
    } catch (error) {
      console.error('Error adding property:', error);
      toast.error(error.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Basic Info', icon: Home },
    { number: 2, title: 'Details', icon: Tag },
    { number: 3, title: 'Media', icon: Image },
    { number: 4, title: 'Review', icon: Eye },
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Property Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Modern 3-Bedroom Villa in East Legon"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Describe the property in detail..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Property Type *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {PROPERTY_TYPES.map(({ value, icon: Icon, color }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: value }))}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                      formData.type === value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium">{value}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Listing Type *
              </label>
              <div className="flex gap-3">
                {LISTING_TYPES.map(({ value, label, color }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, listingType: value }))}
                    className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all ${
                      formData.listingType === value
                        ? `${color} text-white border-transparent`
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price *
                </label>
                <div className="flex">
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="px-3 py-3 rounded-l-xl border border-r-0 border-gray-200 bg-gray-50"
                  >
                    {CURRENCIES.map(c => (
                      <option key={c.value} value={c.value}>{c.symbol}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className="flex-1 px-4 py-3 rounded-r-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Location *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., East Legon, Accra"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bedrooms *
                </label>
                <div className="relative">
                  <BedDouble className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    name="beds"
                    value={formData.beds}
                    onChange={handleInputChange}
                    min="0"
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bathrooms *
                </label>
                <div className="relative">
                  <Bath className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    name="baths"
                    value={formData.baths}
                    onChange={handleInputChange}
                    min="0"
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Area (sqft)
                </label>
                <div className="relative">
                  <Maximize className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    name="sqft"
                    value={formData.sqft}
                    onChange={handleInputChange}
                    min="0"
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contact Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+233 XX XXX XXXX"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Amenities
              </label>
              <div className="flex flex-wrap gap-2">
                {AMENITIES_LIST.map((amenity) => (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => handleAmenityToggle(amenity)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      formData.amenities.includes(amenity)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {amenity}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Property Images * (Upload up to 6)
              </label>
              
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="file"
                  id="images"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  Drag and drop images here, or{' '}
                  <label htmlFor="images" className="text-blue-500 cursor-pointer hover:underline">
                    browse
                  </label>
                </p>
                <p className="text-sm text-gray-400">PNG, JPG, WEBP up to 10MB each</p>
              </div>

              {previewUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-6">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative group rounded-xl overflow-hidden aspect-video">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {index === 0 && (
                        <span className="absolute top-2 left-2 px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                          Main
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Video URL (Optional)
              </label>
              <div className="relative">
                <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="url"
                  name="videoUrl"
                  value={formData.videoUrl}
                  onChange={handleInputChange}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <p className="text-sm text-gray-400 mt-1">YouTube or Vimeo video links supported</p>
            </div>

            <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                className="w-5 h-5 text-blue-500 rounded"
              />
              <label htmlFor="featured" className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span className="font-medium">Mark as Featured Property</span>
              </label>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Property Summary</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Title</p>
                  <p className="font-semibold">{formData.title || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-semibold">{formData.type || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Listing Type</p>
                  <p className="font-semibold">{formData.listingType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="font-semibold text-blue-600">
                    {CURRENCIES.find(c => c.value === formData.currency)?.symbol}
                    {Number(formData.price).toLocaleString() || '0'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-semibold">{formData.location || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Specifications</p>
                  <p className="font-semibold">
                    {formData.beds || 0} Beds • {formData.baths || 0} Baths • {formData.sqft || 0} sqft
                  </p>
                </div>
              </div>

              {formData.amenities.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">Amenities</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.amenities.map((a, i) => (
                      <span key={i} className="px-3 py-1 bg-white rounded-full text-sm">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {previewUrls.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">Images ({previewUrls.length})</p>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {previewUrls.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt={`Preview ${i + 1}`}
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-green-800">Ready to publish!</p>
                <p className="text-sm text-green-600">
                  Review the details above and click "Add Property" to publish your listing.
                </p>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Add New Property</h1>
          <p className="text-gray-500 mt-1">Create a stunning listing to attract buyers</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <button
                  type="button"
                  onClick={() => setCurrentStep(step.number)}
                  className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all ${
                    currentStep === step.number
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                      : currentStep > step.number
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  <step.icon className="w-5 h-5" />
                  <span className="font-medium hidden sm:inline">{step.title}</span>
                </button>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-1 mx-2 rounded ${
                    currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {renderStepContent()}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                disabled={currentStep === 1}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  currentStep === 1
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </button>

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (validateStep(currentStep)) {
                      setCurrentStep(prev => Math.min(4, prev + 1));
                    } else {
                      toast.error('Please fill in all required fields');
                    }
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-all"
                >
                  Next Step
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 shadow-lg shadow-green-500/25"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Adding Property...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Add Property
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PropertyForm;