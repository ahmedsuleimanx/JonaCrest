import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, MapPin, Home, Building2, BedDouble, Bath, Maximize,
  Heart, Eye, ChevronDown, X, Sparkles, SlidersHorizontal, Grid3X3,
  List, ArrowUpDown, DollarSign, Calendar, Star, Loader2
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Backendurl } from '../../App';
import { Link } from 'react-router-dom';

const PROPERTY_TYPES = ['All', 'House', 'Apartment', 'Villa', 'Townhouse', 'Commercial', 'Land'];
const LOCATIONS = ['All Locations', 'Accra', 'Kumasi', 'Takoradi', 'Tema', 'East Legon', 'Cantonments', 'Airport'];
const PRICE_RANGES = [
  { label: 'Any Price', min: 0, max: Infinity },
  { label: 'Under $100k', min: 0, max: 100000 },
  { label: '$100k - $250k', min: 100000, max: 250000 },
  { label: '$250k - $500k', min: 250000, max: 500000 },
  { label: '$500k - $1M', min: 500000, max: 1000000 },
  { label: 'Over $1M', min: 1000000, max: Infinity },
];
const BEDROOMS = ['Any', '1+', '2+', '3+', '4+', '5+'];
const LISTING_TYPES = ['All', 'For Sale', 'For Rent'];

const PropertyCard = ({ property, onSave, saved, viewMode }) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const formatPrice = (price) => {
    if (!price) return 'Contact for price';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price);
  };

  const mainImage = property.image1 || property.images?.[0] || 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg';

  if (viewMode === 'list') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="dash-glass-card overflow-hidden"
      >
        <div className="flex flex-col md:flex-row">
          <div className="relative w-full md:w-72 h-48 md:h-auto flex-shrink-0">
            <img
              src={imageError ? 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg' : mainImage}
              alt={property.title}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
            <div className="absolute top-3 left-3 flex gap-2">
              <span className="px-2.5 py-1 bg-[var(--accent)] text-white text-xs font-semibold rounded-full">
                {property.propertyType || 'Property'}
              </span>
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                property.status === 'For Rent' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
              }`}>
                {property.status || 'Available'}
              </span>
            </div>
            <button
              onClick={() => onSave(property._id)}
              className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
                saved ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-600 hover:bg-red-50 hover:text-red-500'
              }`}
            >
              <Heart className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
            </button>
          </div>
          <div className="flex-1 p-5">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">{property.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {property.location || property.city || 'Ghana'}
                </p>
              </div>
              <p className="text-xl font-bold text-[var(--accent)]">{formatPrice(property.price)}</p>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-2">{property.description}</p>
            <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)] mb-4">
              <span className="flex items-center gap-1"><BedDouble className="w-4 h-4" /> {property.bedrooms || 0} Beds</span>
              <span className="flex items-center gap-1"><Bath className="w-4 h-4" /> {property.bathrooms || 0} Baths</span>
              <span className="flex items-center gap-1"><Maximize className="w-4 h-4" /> {property.area || 0} sqft</span>
            </div>
            <div className="flex gap-3">
              <Link
                to={`/property/${property._id}`}
                className="flex-1 dash-glass-btn text-center"
              >
                <Eye className="w-4 h-4 inline mr-2" />
                View Details
              </Link>
              <Link
                to={`/property/${property._id}?schedule=true`}
                className="px-4 py-2 bg-[var(--accent)] text-white rounded-xl font-medium hover:bg-[var(--accent-dark)] transition-colors"
              >
                Schedule Viewing
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="dash-glass-card overflow-hidden group"
    >
      <div className="relative h-52 overflow-hidden">
        <img
          src={imageError ? 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg' : mainImage}
          alt={property.title}
          className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}
          onError={() => setImageError(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-2.5 py-1 bg-[var(--accent)] text-white text-xs font-semibold rounded-full shadow-lg">
            {property.propertyType || 'Property'}
          </span>
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full shadow-lg ${
            property.status === 'For Rent' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
          }`}>
            {property.status || 'Available'}
          </span>
        </div>
        <button
          onClick={() => onSave(property._id)}
          className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all shadow-lg ${
            saved ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-600 hover:bg-red-50 hover:text-red-500'
          }`}
        >
          <Heart className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
        </button>
        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-xl font-bold text-white drop-shadow-lg">{formatPrice(property.price)}</p>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-[var(--text-primary)] mb-1 truncate">{property.title}</h3>
        <p className="text-sm text-[var(--text-secondary)] flex items-center gap-1 mb-3">
          <MapPin className="w-3.5 h-3.5" />
          {property.location || property.city || 'Ghana'}
        </p>
        <div className="flex items-center justify-between text-sm text-[var(--text-secondary)] mb-4 pb-4 border-b border-[var(--glass-border)]">
          <span className="flex items-center gap-1"><BedDouble className="w-4 h-4" /> {property.bedrooms || 0}</span>
          <span className="flex items-center gap-1"><Bath className="w-4 h-4" /> {property.bathrooms || 0}</span>
          <span className="flex items-center gap-1"><Maximize className="w-4 h-4" /> {property.area || 0}</span>
        </div>
        <Link
          to={`/property/${property._id}`}
          className="block w-full text-center dash-glass-btn"
        >
          View Details
        </Link>
      </div>
    </motion.div>
  );
};

const BrowsePropertiesTab = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedProperties, setSavedProperties] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [propertyType, setPropertyType] = useState('All');
  const [location, setLocation] = useState('All Locations');
  const [priceRange, setPriceRange] = useState(PRICE_RANGES[0]);
  const [bedrooms, setBedrooms] = useState('Any');
  const [listingType, setListingType] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // AI Search
  const [aiSearching, setAiSearching] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);

  const fetchProperties = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${Backendurl}/api/products/list`);
      if (response.data.success) {
        setProperties(response.data.property || []);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSavedProperties = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await axios.get(`${Backendurl}/api/users/saved-properties`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setSavedProperties(response.data.savedProperties?.map(p => p._id) || []);
      }
    } catch (error) {
      console.error('Error fetching saved properties:', error);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
    fetchSavedProperties();
  }, [fetchProperties, fetchSavedProperties]);

  const handleSaveProperty = async (propertyId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to save properties');
        return;
      }
      const response = await axios.post(
        `${Backendurl}/api/users/saved-properties/toggle`,
        { propertyId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        if (savedProperties.includes(propertyId)) {
          setSavedProperties(prev => prev.filter(id => id !== propertyId));
          toast.success('Property removed from saved');
        } else {
          setSavedProperties(prev => [...prev, propertyId]);
          toast.success('Property saved!');
        }
      }
    } catch (error) {
      toast.error('Failed to save property');
    }
  };

  const handleAISearch = async () => {
    if (!searchQuery.trim()) return;
    setAiSearching(true);
    try {
      const response = await axios.post(`${Backendurl}/api/ai/chat`, {
        message: `Help me find properties matching: ${searchQuery}. Suggest search filters.`,
        history: []
      });
      if (response.data.success) {
        setAiSuggestions([response.data.reply]);
      }
    } catch (error) {
      console.error('AI search error:', error);
    } finally {
      setAiSearching(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setPropertyType('All');
    setLocation('All Locations');
    setPriceRange(PRICE_RANGES[0]);
    setBedrooms('Any');
    setListingType('All');
    setSortBy('newest');
  };

  // Filter and sort properties
  const filteredProperties = properties.filter(property => {
    const matchesSearch = !searchQuery || 
      property.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = propertyType === 'All' || property.propertyType === propertyType;
    const matchesLocation = location === 'All Locations' || 
      property.location?.toLowerCase().includes(location.toLowerCase()) ||
      property.city?.toLowerCase().includes(location.toLowerCase());
    
    const matchesPrice = property.price >= priceRange.min && property.price <= priceRange.max;
    
    const matchesBedrooms = bedrooms === 'Any' || 
      (property.bedrooms >= parseInt(bedrooms));
    
    const matchesListing = listingType === 'All' || property.status === listingType;

    return matchesSearch && matchesType && matchesLocation && matchesPrice && matchesBedrooms && matchesListing;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price-low': return (a.price || 0) - (b.price || 0);
      case 'price-high': return (b.price || 0) - (a.price || 0);
      case 'beds': return (b.bedrooms || 0) - (a.bedrooms || 0);
      case 'newest':
      default: return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  const activeFiltersCount = [
    propertyType !== 'All',
    location !== 'All Locations',
    priceRange.label !== 'Any Price',
    bedrooms !== 'Any',
    listingType !== 'All'
  ].filter(Boolean).length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="dash-shimmer h-12 rounded-xl w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="dash-glass-card p-4 space-y-4">
              <div className="dash-shimmer h-48 rounded-xl" />
              <div className="dash-shimmer h-4 w-3/4 rounded" />
              <div className="dash-shimmer h-4 w-1/2 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Browse Properties</h2>
          <p className="text-[var(--text-secondary)]">{filteredProperties.length} properties found</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--glass-bg)] text-[var(--text-secondary)]'}`}
          >
            <Grid3X3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-[var(--accent)] text-white' : 'bg-[var(--glass-bg)] text-[var(--text-secondary)]'}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* AI-Powered Search Bar */}
      <div className="dash-glass-card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAISearch()}
              placeholder="Search by location, property type, features..."
              className="w-full pl-12 pr-4 py-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
            />
          </div>
          <button
            onClick={handleAISearch}
            disabled={aiSearching}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {aiSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            AI Search
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all ${
              showFilters || activeFiltersCount > 0
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--glass-bg)] text-[var(--text-primary)] border border-[var(--glass-border)]'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">{activeFiltersCount}</span>
            )}
          </button>
        </div>

        {/* AI Suggestions */}
        <AnimatePresence>
          {aiSuggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100"
            >
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-purple-900 mb-1">AI Suggestion</p>
                  <p className="text-sm text-purple-700">{aiSuggestions[0]}</p>
                </div>
                <button onClick={() => setAiSuggestions([])} className="text-purple-400 hover:text-purple-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-[var(--glass-border)]"
            >
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {/* Property Type */}
                <div>
                  <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">Property Type</label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
                  >
                    {PROPERTY_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">Location</label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
                  >
                    {LOCATIONS.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">Price Range</label>
                  <select
                    value={priceRange.label}
                    onChange={(e) => setPriceRange(PRICE_RANGES.find(p => p.label === e.target.value))}
                    className="w-full px-3 py-2.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
                  >
                    {PRICE_RANGES.map(range => (
                      <option key={range.label} value={range.label}>{range.label}</option>
                    ))}
                  </select>
                </div>

                {/* Bedrooms */}
                <div>
                  <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">Bedrooms</label>
                  <select
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
                  >
                    {BEDROOMS.map(bed => (
                      <option key={bed} value={bed}>{bed}</option>
                    ))}
                  </select>
                </div>

                {/* Listing Type */}
                <div>
                  <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">Listing Type</label>
                  <select
                    value={listingType}
                    onChange={(e) => setListingType(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
                  >
                    {LISTING_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="beds">Most Bedrooms</option>
                  </select>
                </div>
              </div>

              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="mt-4 text-sm text-[var(--accent)] hover:underline flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Clear all filters
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Properties Grid/List */}
      {filteredProperties.length === 0 ? (
        <div className="dash-glass-card p-12 text-center">
          <Home className="w-16 h-16 text-[var(--text-secondary)] mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">No properties found</h3>
          <p className="text-[var(--text-secondary)] mb-4">Try adjusting your filters or search query</p>
          <button onClick={clearFilters} className="dash-glass-btn">
            Clear Filters
          </button>
        </div>
      ) : (
        <motion.div
          layout
          className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
          }
        >
          <AnimatePresence mode="popLayout">
            {filteredProperties.map(property => (
              <PropertyCard
                key={property._id}
                property={property}
                onSave={handleSaveProperty}
                saved={savedProperties.includes(property._id)}
                viewMode={viewMode}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default BrowsePropertiesTab;
