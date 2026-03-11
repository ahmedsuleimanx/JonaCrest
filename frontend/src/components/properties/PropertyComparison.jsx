import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Plus, Check, MapPin, Bed, Bath, Maximize, 
  Building, Home, Calendar, Heart, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Property Comparison Tool
 * PRD Section 4.7.6 - Side-by-side property comparison
 */

const PropertyComparison = ({ 
  properties = [], 
  onRemove, 
  onClose,
  isOpen = false 
}) => {
  const maxCompare = 3;

  const features = [
    { key: 'price', label: 'Price', format: (p) => `${p.currency || 'GHS'} ${p.price?.toLocaleString() || 'N/A'}` },
    { key: 'bedrooms', label: 'Bedrooms', icon: Bed },
    { key: 'bathrooms', label: 'Bathrooms', icon: Bath },
    { key: 'size', label: 'Size', format: (p) => `${p.size || p.squareFeet || 0} m²`, icon: Maximize },
    { key: 'location', label: 'Location', icon: MapPin },
    { key: 'type', label: 'Type', icon: Building },
    { key: 'listed', label: 'Listed', format: (p) => p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'N/A', icon: Calendar },
  ];

  const amenityList = ['Pool', 'Garage', 'Garden', 'AC', 'WiFi', 'Security', 'Gym', 'Parking'];

  const hasAmenity = (property, amenity) => {
    const amenities = property.amenities || [];
    if (Array.isArray(amenities)) {
      return amenities.some(a => 
        (typeof a === 'string' && a.toLowerCase().includes(amenity.toLowerCase())) ||
        (typeof a === 'object' && a.name?.toLowerCase().includes(amenity.toLowerCase()))
      );
    }
    return false;
  };

  const getBestValue = (propertyIndex, key) => {
    if (properties.length < 2) return false;
    const values = properties.map(p => p[key] || 0);
    
    if (key === 'price') {
      const minPrice = Math.min(...values.filter(v => v > 0));
      return properties[propertyIndex][key] === minPrice;
    }
    
    const maxValue = Math.max(...values);
    return properties[propertyIndex][key] === maxValue;
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="min-h-screen flex items-start justify-center p-4 py-16"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-500 p-6 text-white flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Compare Properties</h2>
              <p className="text-teal-100">Side-by-side comparison of {properties.length} properties</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Properties Grid */}
          <div className="p-6 overflow-x-auto">
            <div className="min-w-max">
              {/* Property Images and Titles */}
              <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${properties.length}, 1fr)` }}>
                <div className="font-semibold text-gray-500 self-end pb-4">Property</div>
                {properties.map((property, idx) => (
                  <div key={property._id} className="relative">
                    <button
                      onClick={() => onRemove(property._id)}
                      className="absolute -top-2 -right-2 z-10 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="bg-gray-50 rounded-2xl p-4 h-full">
                      <img
                        src={property.image?.[0] || '/placeholder.jpg'}
                        alt={property.title}
                        className="w-full h-40 object-cover rounded-xl mb-3"
                      />
                      <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mb-2">
                        {property.title}
                      </h3>
                      <Link
                        to={`/properties/single/${property._id}`}
                        className="text-teal-600 text-sm font-medium flex items-center gap-1 hover:underline"
                      >
                        View Details <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
                {properties.length < maxCompare && (
                  <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 flex flex-col items-center justify-center text-gray-400 min-h-[240px]">
                    <Plus className="w-8 h-8 mb-2" />
                    <span className="text-sm">Add Property</span>
                  </div>
                )}
              </div>

              {/* Comparison Rows */}
              <div className="mt-8 space-y-1">
                {features.map((feature) => (
                  <div 
                    key={feature.key}
                    className="grid gap-4 py-3 border-b border-gray-100"
                    style={{ gridTemplateColumns: `200px repeat(${Math.max(properties.length, 1)}, 1fr)` }}
                  >
                    <div className="flex items-center gap-2 text-gray-600 font-medium">
                      {feature.icon && <feature.icon className="w-4 h-4" />}
                      {feature.label}
                    </div>
                    {properties.map((property, idx) => {
                      const value = feature.format 
                        ? feature.format(property) 
                        : property[feature.key] || 'N/A';
                      const isBest = getBestValue(idx, feature.key);
                      
                      return (
                        <div 
                          key={property._id}
                          className={`font-semibold ${isBest ? 'text-green-600' : 'text-gray-900'} flex items-center gap-2`}
                        >
                          {value}
                          {isBest && <Check className="w-4 h-4" />}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Amenities Section */}
              <div className="mt-8">
                <h4 className="font-bold text-gray-900 mb-4">Amenities</h4>
                <div className="space-y-1">
                  {amenityList.map((amenity) => (
                    <div 
                      key={amenity}
                      className="grid gap-4 py-2 border-b border-gray-50"
                      style={{ gridTemplateColumns: `200px repeat(${Math.max(properties.length, 1)}, 1fr)` }}
                    >
                      <div className="text-gray-600">{amenity}</div>
                      {properties.map((property) => (
                        <div key={property._id}>
                          {hasAmenity(property, amenity) ? (
                            <Check className="w-5 h-5 text-green-500" />
                          ) : (
                            <X className="w-5 h-5 text-gray-300" />
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Best Match Recommendation */}
              {properties.length >= 2 && (
                <div className="mt-8 p-4 bg-gradient-to-r from-teal-50 to-teal-100 rounded-2xl border border-teal-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-500 rounded-full">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-teal-900">
                        {properties[0]?.title} offers the best value
                      </p>
                      <p className="text-teal-700 text-sm">
                        Based on price, size, and amenities
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Compare Button Component (to add to property cards)
export const CompareButton = ({ propertyId, isInCompare, onToggle }) => (
  <button
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      onToggle(propertyId);
    }}
    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
      isInCompare 
        ? 'bg-teal-600 text-white' 
        : 'bg-white/80 backdrop-blur text-gray-700 hover:bg-teal-50 border border-gray-200'
    }`}
  >
    {isInCompare ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
    {isInCompare ? 'Comparing' : 'Compare'}
  </button>
);

// Compare Bar (floating at bottom when comparing)
export const CompareBar = ({ compareList, onCompare, onClear }) => {
  if (compareList.length === 0) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-40 p-4"
    >
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-gray-900">
            {compareList.length} properties selected
          </span>
          <div className="flex -space-x-2">
            {compareList.slice(0, 3).map((prop) => (
              <img
                key={prop._id}
                src={prop.image?.[0] || '/placeholder.jpg'}
                className="w-10 h-10 rounded-full border-2 border-white object-cover"
              />
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClear}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
          >
            Clear All
          </button>
          <button
            onClick={onCompare}
            disabled={compareList.length < 2}
            className="px-6 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Compare Now
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyComparison;
