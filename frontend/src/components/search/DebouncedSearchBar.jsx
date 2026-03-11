import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Loader2, ArrowRight, Home, MapPin } from 'lucide-react';
import { useDebounce } from '../../hooks/usePerformance';
import axios from 'axios';
import { Backendurl } from '../../App';
import { Link } from 'react-router-dom';

/**
 * Debounced Search Bar Component
 * PRD Section 4.1.2.4 - Debounce/Throttle for search
 * Includes instant suggestions with 300ms debounce
 */

const DebouncedSearchBar = ({
  placeholder = 'Search properties, locations...',
  onSearch,
  className = ''
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Debounce the search query
  const debouncedQuery = useDebounce(query, 300);

  // Fetch suggestions when debounced query changes
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      fetchSuggestions(debouncedQuery);
    } else {
      setSuggestions([]);
    }
  }, [debouncedQuery]);

  const fetchSuggestions = async (searchQuery) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${Backendurl}/api/products/list?search=${encodeURIComponent(searchQuery)}&limit=5`
      );
      
      const properties = response.data.products || [];
      setSuggestions(properties);
    } catch (error) {
      console.error('Search error:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(value.length >= 1);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && onSearch) {
      onSearch(query.trim());
      setIsOpen(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => query.length >= 1 && setIsOpen(true)}
            placeholder={placeholder}
            className="w-full pl-12 pr-12 py-4 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent shadow-sm transition-all"
          />
          
          {/* Search Icon */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            {loading ? (
              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
            ) : (
              <Search className="w-5 h-5 text-gray-400" />
            )}
          </div>
          
          {/* Clear/Submit Buttons */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
            <button
              type="submit"
              className="p-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {isOpen && (suggestions.length > 0 || loading) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
          {loading && suggestions.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
              Searching...
            </div>
          ) : (
            <>
              {/* Property Suggestions */}
              <div className="py-2">
                {suggestions.map((property) => (
                  <Link
                    key={property._id}
                    to={`/properties/single/${property._id}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <img
                      src={property.image?.[0] || '/placeholder.jpg'}
                      alt={property.title}
                      className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{property.title}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {property.location}
                      </p>
                    </div>
                    <p className="text-teal-600 font-semibold text-sm">
                      {property.currency || 'GHS'} {property.price?.toLocaleString()}
                    </p>
                  </Link>
                ))}
              </div>

              {/* View All Results */}
              {suggestions.length > 0 && (
                <Link
                  to={`/properties?search=${encodeURIComponent(query)}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 text-teal-600 font-medium hover:bg-gray-100 transition-colors border-t border-gray-100"
                >
                  View all results for "{query}"
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </>
          )}
        </div>
      )}

      {/* No Results */}
      {isOpen && !loading && debouncedQuery.length >= 2 && suggestions.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-6 text-center z-50">
          <Home className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">No properties found</p>
          <p className="text-gray-400 text-sm mt-1">Try different keywords</p>
        </div>
      )}
    </div>
  );
};

export default DebouncedSearchBar;
