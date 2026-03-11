import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { backendurl } from '../config/constants';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Upload, Home, Building2, Briefcase, Castle, Hotel, Store,
  DollarSign, MapPin, Bed, Bath, Maximize, Phone, Check, ChevronRight,
  ChevronLeft, Image as ImageIcon, Video, Sparkles, Loader2, ArrowLeft,
  Wifi, Car, Trees, Waves, Dumbbell, Shield, Wind, Flame, Coffee
} from 'lucide-react';

const PROPERTY_TYPES = [
  { value: 'House', icon: Home, color: 'blue' },
  { value: 'Apartment', icon: Building2, color: 'purple' },
  { value: 'Villa', icon: Castle, color: 'amber' },
  { value: 'Office', icon: Briefcase, color: 'green' },
  { value: 'Hotel', icon: Hotel, color: 'pink' },
  { value: 'Commercial', icon: Store, color: 'orange' },
];

const LISTING_TYPES = [
  { value: 'For Sale', label: 'For Sale', color: 'blue' },
  { value: 'For Rent', label: 'For Rent', color: 'green' },
  { value: 'Short Stay', label: 'Short Stay', color: 'purple' },
];

const CURRENCIES = [
  { code: 'GHS', symbol: '₵', name: 'Ghana Cedi' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
];

const AMENITIES = [
  { name: 'WiFi', icon: Wifi },
  { name: 'Parking', icon: Car },
  { name: 'Garden', icon: Trees },
  { name: 'Pool', icon: Waves },
  { name: 'Gym', icon: Dumbbell },
  { name: 'Security', icon: Shield },
  { name: 'AC', icon: Wind },
  { name: 'Fireplace', icon: Flame },
  { name: 'Lake View', icon: Coffee },
  { name: 'Garage', icon: Car },
  { name: 'Central Heating', icon: Flame },
  { name: 'Home Theater', icon: Video },
  { name: 'Master Bathroom', icon: Bath },
  { name: 'Guest Bathroom', icon: Bath },
  { name: 'Exercise Room', icon: Dumbbell },
  { name: 'Covered Parking', icon: Car },
  { name: 'High-speed Internet', icon: Wifi },
  { name: 'Dock', icon: Waves },
];

const STEPS = [
  { id: 1, title: 'Basic Info', description: 'Property details' },
  { id: 2, title: 'Features', description: 'Rooms & amenities' },
  { id: 3, title: 'Media', description: 'Photos & video' },
  { id: 4, title: 'Review', description: 'Confirm changes' },
];

const Update = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    listingType: 'For Sale',
    price: '',
    currency: 'GHS',
    location: '',
    description: '',
    beds: '',
    baths: '',
    sqft: '',
    phone: '',
    availability: '',
    amenities: [],
    images: [],
    videoUrl: '',
    featured: false
  });
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingProperty, setFetchingProperty] = useState(true);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setFetchingProperty(true);
        const response = await axios.get(`${backendurl}/api/products/single/${id}`);
        if (response.data.success) {
          const property = response.data.property;
          // Parse amenities if needed
          let parsedAmenities = property.amenities || [];
          if (typeof parsedAmenities === 'string') {
            try {
              parsedAmenities = JSON.parse(parsedAmenities);
            } catch (e) {
              parsedAmenities = [];
            }
          }
          if (Array.isArray(parsedAmenities) && parsedAmenities.length > 0 && typeof parsedAmenities[0] === 'string') {
            try {
              parsedAmenities = JSON.parse(parsedAmenities[0].replace(/'/g, '"'));
            } catch (e) {
              // Keep as is
            }
          }
          
          setFormData({
            title: property.title || '',
            type: property.type || property.propertyType || '',
            listingType: property.listingType || property.availability || 'For Sale',
            price: property.price || '',
            currency: property.currency || 'GHS',
            location: property.location || '',
            description: property.description || '',
            beds: property.beds || '',
            baths: property.baths || '',
            sqft: property.sqft || '',
            phone: property.phone || '',
            availability: property.availability || '',
            amenities: parsedAmenities,
            images: [],
            videoUrl: property.videoUrl || '',
            featured: property.featured || false
          });
          setExistingImages(property.image || []);
          setPreviewUrls(property.image || []);
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        console.error('Error fetching property:', error);
        toast.error('Failed to load property');
      } finally {
        setFetchingProperty(false);
      }
    };

    fetchProperty();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAmenityToggle = (amenity) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFiles = (files) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    const totalImages = existingImages.length + newImages.length + imageFiles.length;
    if (totalImages > 6) {
      toast.error('Maximum 6 images allowed');
      return;
    }
    const newPreviews = imageFiles.map(file => URL.createObjectURL(file));
    setNewImages(prev => [...prev, ...imageFiles]);
    setPreviewUrls(prev => [...prev, ...newPreviews]);
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const removeImage = (index) => {
    if (index < existingImages.length) {
      setExistingImages(prev => prev.filter((_, i) => i !== index));
      setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    } else {
      const newIndex = index - existingImages.length;
      setNewImages(prev => prev.filter((_, i) => i !== newIndex));
      setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    }
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.title && formData.type && formData.listingType && formData.price && formData.location;
      case 2:
        return formData.beds && formData.baths;
      case 3:
        return existingImages.length > 0 || newImages.length > 0;
      default:
        return true;
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const submitData = new FormData();
      submitData.append('id', id);
      submitData.append('title', formData.title);
      submitData.append('type', formData.type);
      submitData.append('listingType', formData.listingType);
      submitData.append('price', formData.price);
      submitData.append('currency', formData.currency);
      submitData.append('location', formData.location);
      submitData.append('description', formData.description);
      submitData.append('beds', formData.beds);
      submitData.append('baths', formData.baths);
      submitData.append('sqft', formData.sqft);
      submitData.append('phone', formData.phone);
      submitData.append('availability', formData.listingType === 'For Rent' ? 'rent' : 'sale');
      submitData.append('amenities', JSON.stringify(formData.amenities));
      submitData.append('videoUrl', formData.videoUrl || '');
      submitData.append('featured', formData.featured);
      submitData.append('existingImages', JSON.stringify(existingImages));
      
      newImages.forEach((image, index) => {
        submitData.append(`image${index + 1}`, image);
      });

      const response = await axios.post(`${backendurl}/api/products/update`, submitData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        toast.success('Property updated successfully!');
        navigate('/properties');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update property');
    } finally {
      setLoading(false);
    }
  };

  const getCurrencySymbol = () => {
    return CURRENCIES.find(c => c.code === formData.currency)?.symbol || '₵';
  };

  // Loading state
  if (fetchingProperty) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  // Step content renderers
  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Property Title */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Property Title *</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="e.g., Modern 3-Bedroom Villa in East Legon"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      {/* Property Type */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Property Type *</label>
        <div className="grid grid-cols-3 gap-3">
          {PROPERTY_TYPES.map(({ value, icon: Icon, color }) => (
            <button
              key={value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, type: value }))}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                formData.type === value
                  ? `border-${color}-500 bg-${color}-50 text-${color}-700`
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-sm font-medium">{value}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Listing Type */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Listing Type *</label>
        <div className="flex gap-3">
          {LISTING_TYPES.map(({ value, label, color }) => (
            <button
              key={value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, listingType: value }))}
              className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all ${
                formData.listingType === value
                  ? `border-${color}-500 bg-${color}-500 text-white`
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Price with Currency */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Price *</label>
        <div className="flex gap-3">
          <select
            name="currency"
            value={formData.currency}
            onChange={handleInputChange}
            className="w-32 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50 font-medium"
          >
            {CURRENCIES.map(({ code, symbol, name }) => (
              <option key={code} value={code}>{symbol} {code}</option>
            ))}
          </select>
          <div className="flex-1 relative">
            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="Enter price"
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Location *</label>
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="e.g., East Legon, Accra"
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={4}
          placeholder="Describe the property features, neighborhood, and unique selling points..."
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Property Details */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Bedrooms *</label>
          <div className="relative">
            <Bed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              name="beds"
              value={formData.beds}
              onChange={handleInputChange}
              min="0"
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Bathrooms *</label>
          <div className="relative">
            <Bath className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              name="baths"
              value={formData.baths}
              onChange={handleInputChange}
              min="0"
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Sq. Feet</label>
          <div className="relative">
            <Maximize className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              name="sqft"
              value={formData.sqft}
              onChange={handleInputChange}
              min="0"
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Contact Phone */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Phone</label>
        <div className="relative">
          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="+233 XX XXX XXXX"
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Amenities */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Amenities</label>
        <div className="grid grid-cols-3 gap-2">
          {AMENITIES.map(({ name, icon: Icon }) => (
            <button
              key={name}
              type="button"
              onClick={() => handleAmenityToggle(name)}
              className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-sm ${
                formData.amenities.includes(name)
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="truncate">{name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Featured Toggle */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-amber-500" />
          <div>
            <p className="font-semibold text-gray-900">Featured Property</p>
            <p className="text-sm text-gray-500">Highlight this property on the homepage</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setFormData(prev => ({ ...prev, featured: !prev.featured }))}
          className={`w-14 h-7 rounded-full transition-all ${
            formData.featured ? 'bg-amber-500' : 'bg-gray-300'
          }`}
        >
          <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
            formData.featured ? 'translate-x-8' : 'translate-x-1'
          }`} />
        </button>
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Image Upload */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Property Images ({previewUrls.length}/6)
        </label>
        
        {/* Image Grid */}
        {previewUrls.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-4">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative group aspect-square rounded-xl overflow-hidden">
                <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {index === 0 && (
                  <span className="absolute top-2 left-2 px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                    Cover
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Drag & Drop Zone */}
        {previewUrls.length < 6 && (
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Drag and drop images here, or</p>
            <label className="inline-block px-6 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition-colors">
              Browse Files
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
            <p className="text-xs text-gray-400 mt-2">PNG, JPG, WEBP up to 10MB each</p>
          </div>
        )}
      </div>

      {/* Video URL */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Video URL (Optional)</label>
        <div className="relative">
          <Video className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="url"
            name="videoUrl"
            value={formData.videoUrl}
            onChange={handleInputChange}
            placeholder="YouTube or Vimeo link"
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </motion.div>
  );

  const renderStep4 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Property Summary</h3>
        
        {/* Preview Image */}
        {previewUrls.length > 0 && (
          <div className="relative h-48 rounded-xl overflow-hidden mb-4">
            <img src={previewUrls[0]} alt="Cover" className="w-full h-full object-cover" />
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 bg-white/90 text-gray-800 text-sm font-medium rounded-full">
                {formData.type}
              </span>
            </div>
            <div className="absolute top-4 right-4">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                formData.listingType === 'For Rent' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
              }`}>
                {formData.listingType}
              </span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-gray-600">Title</span>
            <span className="font-semibold text-gray-900">{formData.title || '-'}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-gray-600">Price</span>
            <span className="font-bold text-2xl text-blue-600">
              {getCurrencySymbol()}{Number(formData.price).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-gray-600">Location</span>
            <span className="font-medium text-gray-900">{formData.location || '-'}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-gray-600">Details</span>
            <span className="font-medium text-gray-900">
              {formData.beds} Beds • {formData.baths} Baths • {formData.sqft} sqft
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-gray-600">Images</span>
            <span className="font-medium text-gray-900">{previewUrls.length} photos</span>
          </div>
          {formData.amenities.length > 0 && (
            <div className="py-2">
              <span className="text-gray-600 block mb-2">Amenities</span>
              <div className="flex flex-wrap gap-2">
                {formData.amenities.slice(0, 6).map((amenity, i) => (
                  <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                    {amenity}
                  </span>
                ))}
                {formData.amenities.length > 6 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    +{formData.amenities.length - 6} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/properties')}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Property</h1>
            <p className="text-gray-500 mt-1">Update property details</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => setCurrentStep(step.id)}
                className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all ${
                  currentStep === step.id
                    ? 'bg-blue-500 text-white'
                    : currentStep > step.id
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-400'
                }`}
              >
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStep === step.id
                    ? 'bg-white/20'
                    : currentStep > step.id
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200'
                }`}>
                  {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
                </span>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold">{step.title}</p>
                  <p className={`text-xs ${currentStep === step.id ? 'text-blue-100' : ''}`}>
                    {step.description}
                  </p>
                </div>
              </button>
              {index < STEPS.length - 1 && (
                <ChevronRight className="w-5 h-5 text-gray-300 mx-2 hidden sm:block" />
              )}
            </div>
          ))}
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
          <AnimatePresence mode="wait">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={prevStep}
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
              onClick={nextStep}
              disabled={!validateStep(currentStep)}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-medium transition-all ${
                validateStep(currentStep)
                  ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/25'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Next Step
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/25 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Update Property
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Update;