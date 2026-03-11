import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Car, PersonStanding, Clock, ExternalLink } from 'lucide-react';

/**
 * PropertyMap Component
 * PRD Section 4.1.3 - Google Maps Integration
 * Displays property location with map, nearby amenities, and directions
 */

const PropertyMap = ({ 
  latitude, 
  longitude, 
  address,
  digitalAddress, // Ghana GPS address
  title 
}) => {
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [showDirections, setShowDirections] = useState(false);

  // Fallback coordinates (Accra, Ghana)
  const lat = latitude || 5.6037;
  const lng = longitude || -0.1870;

  useEffect(() => {
    // Load Google Maps script if not already loaded
    if (window.google && window.google.maps) {
      initMap();
      return;
    }

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn('Google Maps API key not configured');
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = initMap;
    document.head.appendChild(script);

    return () => {
      // Cleanup
    };
  }, [lat, lng]);

  const initMap = () => {
    if (!mapRef.current || !window.google) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat, lng },
      zoom: 15,
      styles: getMapStyles(),
      disableDefaultUI: true,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: true,
      fullscreenControl: true,
    });

    // Custom marker
    new window.google.maps.Marker({
      position: { lat, lng },
      map,
      title: title || 'Property Location',
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: '#00796B',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
      },
    });

    setMapLoaded(true);
    
    // Fetch nearby places
    if (window.google.maps.places) {
      fetchNearbyPlaces(map);
    }
  };

  const fetchNearbyPlaces = (map) => {
    const service = new window.google.maps.places.PlacesService(map);
    const types = ['school', 'hospital', 'supermarket', 'restaurant', 'transit_station'];
    
    types.forEach(type => {
      service.nearbySearch({
        location: { lat, lng },
        radius: 1000,
        type,
      }, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          setNearbyPlaces(prev => [...prev, ...results.slice(0, 2)]);
        }
      });
    });
  };

  const getMapStyles = () => [
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#e9e9e9' }] },
    { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
    { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#eeeeee' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
    { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
    { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
  ];

  const openDirections = () => {
    const destination = `${lat},${lng}`;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, '_blank');
  };

  const openStreetView = () => {
    window.open(`https://www.google.com/maps?q=&layer=c&cbll=${lat},${lng}`, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Map Container */}
      <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
        {/* Map */}
        <div 
          ref={mapRef}
          className="h-80 w-full bg-gray-100"
        />
        
        {/* Loading State */}
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center text-gray-500">
              <MapPin className="w-8 h-8 mx-auto mb-2 animate-pulse text-teal-600" />
              <p>Loading map...</p>
            </div>
          </div>
        )}

        {/* Address Overlay */}
        <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-teal-100 rounded-lg">
              <MapPin className="w-5 h-5 text-teal-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{address || 'Property Location'}</p>
              {digitalAddress && (
                <p className="text-sm text-teal-600 font-medium">📍 {digitalAddress}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={openDirections}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors font-medium"
        >
          <Navigation className="w-5 h-5" />
          Get Directions
        </button>
        <button
          onClick={openStreetView}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
        >
          <ExternalLink className="w-5 h-5" />
          Street View
        </button>
      </div>

      {/* Nearby Places */}
      {nearbyPlaces.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold text-gray-900 mb-3">Nearby Amenities</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {nearbyPlaces.slice(0, 6).map((place, idx) => (
              <div 
                key={idx}
                className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl"
              >
                <div className="w-2 h-2 rounded-full bg-teal-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900 line-clamp-1">{place.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{place.types?.[0]?.replace('_', ' ')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Distance Info Placeholder */}
      <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Car className="w-4 h-4" />
          <span>~5 min drive to center</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <PersonStanding className="w-4 h-4" />
          <span>~15 min walk to mall</span>
        </div>
      </div>
    </div>
  );
};

export default PropertyMap;
