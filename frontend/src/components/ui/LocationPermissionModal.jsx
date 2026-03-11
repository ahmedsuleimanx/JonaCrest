import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, X, Loader2 } from 'lucide-react';
import { useGeolocation } from '../../hooks/usePerformance';

/**
 * Location Permission Modal
 * PRD Section 4.6 - Location-Based Property Discovery
 * Requests user location for nearest properties feature
 */

const LocationPermissionModal = ({ 
  isOpen, 
  onClose, 
  onLocationGranted,
  onSkip 
}) => {
  const { location, error, loading, requestLocation } = useGeolocation();
  const [hasRequested, setHasRequested] = useState(false);

  useEffect(() => {
    if (location && hasRequested) {
      onLocationGranted(location);
      onClose();
    }
  }, [location, hasRequested, onLocationGranted, onClose]);

  const handleEnableLocation = () => {
    setHasRequested(true);
    requestLocation();
  };

  const handleSkip = () => {
    if (onSkip) onSkip();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={handleSkip}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Icon */}
          <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Navigation className="w-10 h-10 text-white" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
            Find Properties Near You
          </h2>

          {/* Description */}
          <p className="text-gray-600 text-center mb-8">
            Allow location access to discover properties closest to you, 
            see distances, and get personalized recommendations.
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm text-center">
              {error}. Please enable location in your browser settings.
            </div>
          )}

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleEnableLocation}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Getting Location...
                </>
              ) : (
                <>
                  <MapPin className="w-5 h-5" />
                  Enable Location
                </>
              )}
            </button>

            <button
              onClick={handleSkip}
              className="w-full py-4 text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Maybe Later
            </button>
          </div>

          {/* Privacy Note */}
          <p className="mt-6 text-xs text-gray-500 text-center">
            Your location is only used to show nearby properties.
            We never share your location with third parties.
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LocationPermissionModal;
