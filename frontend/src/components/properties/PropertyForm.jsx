import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Home, MapPin, DollarSign, Bed, Bath, Maximize,
  Upload, Plus, X, Save, Loader2, Image as ImageIcon
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Backendurl } from '../../App';
import GhanaAddressInput from '../ui/GhanaAddressInput';

/**
 * Property Form Component for Landlords
 * PRD Section 3.2.2 - Landlord Property Management
 */

const PropertyForm = ({ 
  property = null, // null for new, object for edit
  onSuccess,
  onCancel 
}) => {
  const isEditMode = !!property;
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [imagePreview, setImagePreview] = useState(property?.image || []);
  
  const [formData, setFormData] = useState({
    title: property?.title || '',
    description: property?.description || '',
    price: property?.price || '',
    currency: property?.currency || 'GHS',
    location: property?.location || '',
    digitalAddress: property?.digitalAddress || '',
    type: property?.type || 'Apartment',
    purpose: property?.purpose || 'Rent',
    bedrooms: property?.bedrooms || 1,
    bathrooms: property?.bathrooms || 1,
    size: property?.size || '',
    amenities: property?.amenities?.join(', ') || '',
    story: property?.story || '',
  });

  const propertyTypes = ['Apartment', 'House', 'Villa', 'Condo', 'Townhouse', 'Studio', 'Duplex', 'Penthouse'];
  const purposes = ['Rent', 'Sale', 'Short Stay'];
  const currencies = ['GHS', 'USD', 'EUR'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 4) {
      toast.warning('Maximum 4 images allowed');
      return;
    }

    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });

    setImages(prev => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setImagePreview(prev => prev.filter((_, i) => i !== index));
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.price || !formData.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      };

      // Prepare form data for upload
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'amenities') {
          submitData.append(key, formData[key].split(',').map(a => a.trim()).filter(Boolean));
        } else {
          submitData.append(key, formData[key]);
        }
      });

      // Append images
      images.forEach((image, index) => {
        submitData.append(`image${index + 1}`, image);
      });

      let response;
      if (isEditMode) {
        response = await axios.put(
          `${Backendurl}/api/landlord/properties/${property._id}`,
          submitData,
          { headers }
        );
      } else {
        response = await axios.post(
          `${Backendurl}/api/products/add`,
          submitData,
          { headers }
        );
      }

      if (response.data.success) {
        toast.success(isEditMode ? 'Property updated!' : 'Property added!');
        if (onSuccess) onSuccess(response.data);
      }
    } catch (error) {
      console.error('Property save error:', error);
      toast.error(error.response?.data?.message || 'Failed to save property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
        <Home className="w-6 h-6 text-teal-600" />
        {isEditMode ? 'Edit Property' : 'Add New Property'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Modern 3BR Apartment in Airport"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
            >
              {propertyTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            placeholder="Describe your property..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none resize-none"
          />
        </div>

        {/* Pricing */}
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0"
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
            >
              {currencies.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Purpose
            </label>
            <select
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
            >
              {purposes.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Location */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location *
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Airport Residential, Accra"
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                required
              />
            </div>
          </div>

          <GhanaAddressInput
            value={formData.digitalAddress}
            onChange={(value) => setFormData(prev => ({ ...prev, digitalAddress: value }))}
            label="Ghana Digital Address"
          />
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Bed className="inline w-4 h-4 mr-1" /> Bedrooms
            </label>
            <input
              type="number"
              name="bedrooms"
              value={formData.bedrooms}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Bath className="inline w-4 h-4 mr-1" /> Bathrooms
            </label>
            <input
              type="number"
              name="bathrooms"
              value={formData.bathrooms}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Maximize className="inline w-4 h-4 mr-1" /> Size (m²)
            </label>
            <input
              type="number"
              name="size"
              value={formData.size}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
        </div>

        {/* Amenities */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amenities (comma-separated)
          </label>
          <input
            type="text"
            name="amenities"
            value={formData.amenities}
            onChange={handleChange}
            placeholder="e.g., Pool, Gym, Parking, Security"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
          />
        </div>

        {/* Property Story */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Story (optional)
          </label>
          <textarea
            name="story"
            value={formData.story}
            onChange={handleChange}
            rows={3}
            placeholder="Share what makes this property special to you..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none resize-none"
          />
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Property Images (Max 4)
          </label>
          <div className="grid grid-cols-4 gap-4">
            {imagePreview.map((img, idx) => (
              <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {imagePreview.length < 4 && (
              <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                <Plus className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Add Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  multiple
                />
              </label>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-6 border-t border-gray-100">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-xl hover:shadow-lg transition-all font-medium disabled:opacity-50"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>
            ) : (
              <><Save className="w-5 h-5" /> {isEditMode ? 'Update Property' : 'Add Property'}</>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default PropertyForm;
