import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BedDouble, 
  Bath, 
  Maximize, 
  ArrowLeft, 
  Phone, 
  Calendar, 
  MapPin,
  Building,
  Share2,
  ChevronLeft,
  ChevronRight,
  Compass,
  Eye,
  User,
  Copy
} from "lucide-react";
import { Backendurl } from "../../App.jsx";
import ScheduleViewing from "./ScheduleViewing";
import ServiceRequestForm from "./ServiceRequestForm";
import { useCurrency } from "../../context/CurrencyContext";
import ReviewSection from "../reviews/ReviewSection";

const PropertyDetails = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showServiceRequest, setShowServiceRequest] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);
  const [hasMapAccess, setHasMapAccess] = useState(false);
  const { formatPrice, getCurrencySymbol } = useCurrency();

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${Backendurl}/api/products/single/${id}`);

        if (response.data.success) {
          const propertyData = response.data.property;
          setProperty({
            ...propertyData,
            amenities: parseAmenities(propertyData.amenities)
          });
          setError(null);
        } else {
          setError(response.data.message || "Failed to load property details.");
        }
      } catch (err) {
        console.error("Error fetching property details:", err);
        setError("Failed to load property details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  useEffect(() => {
    // Reset scroll position and active image when component mounts
    window.scrollTo(0, 0);
    setActiveImage(0);
  }, [id]);

  // Check if user has map access for this property
  useEffect(() => {
    const checkMapAccessStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token || !id) {
          return;
        }
        const response = await axios.get(`${Backendurl}/api/viewings/map-access/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          setHasMapAccess(response.data.hasAccess);
        }
      } catch {
        // User not logged in or no access - map stays hidden
        setHasMapAccess(false);
      }
    };
    checkMapAccessStatus();
  }, [id]);

  const parseAmenities = (amenities) => {
    if (!amenities || !Array.isArray(amenities)) return [];
    
    try {
      if (typeof amenities[0] === "string") {
        return JSON.parse(amenities[0].replace(/'/g, '"'));
      }
      return amenities;
    } catch (error) {
      console.error("Error parsing amenities:", error);
      return [];
    }
  };

  const handleKeyNavigation = useCallback((e) => {
    if (e.key === 'ArrowLeft') {
      setActiveImage(prev => (prev === 0 ? property.image.length - 1 : prev - 1));
    } else if (e.key === 'ArrowRight') {
      setActiveImage(prev => (prev === property.image.length - 1 ? 0 : prev + 1));
    } else if (e.key === 'Escape' && showSchedule) {
      setShowSchedule(false);
    }
  }, [property?.image?.length, showSchedule]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyNavigation);
    return () => window.removeEventListener('keydown', handleKeyNavigation);
  }, [handleKeyNavigation]);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: property.title,
          text: `Check out this ${property.type}: ${property.title}`,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Navigation Skeleton */}
          <div className="flex items-center justify-between mb-8">
            <div className="w-32 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="w-24 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
          
          {/* Main Content Skeleton */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Image Gallery Skeleton */}
            <div className="relative h-[500px] bg-gray-200 rounded-xl mb-8 animate-pulse">
              {/* Image Navigation Buttons */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/50 rounded-full"></div>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/50 rounded-full"></div>
              
              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-20 h-8 bg-black/20 rounded-full"></div>
            </div>
  
            {/* Content Skeleton */}
            <div className="p-8">
              {/* Title and Location */}
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-3 w-full max-w-md">
                  <div className="h-10 bg-gray-200 rounded-lg w-3/4 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded-lg w-1/2 animate-pulse"></div>
                </div>
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
              </div>
  
              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Price Box */}
                  <div className="h-28 bg-blue-50/50 rounded-lg animate-pulse"></div>
                  
                  {/* Features Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse"></div>
                    ))}
                  </div>
                  
                  {/* Contact */}
                  <div className="space-y-2">
                    <div className="h-7 bg-gray-200 rounded-lg w-1/3 animate-pulse"></div>
                    <div className="h-6 bg-gray-200 rounded-lg w-1/2 animate-pulse"></div>
                  </div>
                  
                  {/* Button */}
                  <div className="h-12 bg-blue-200 rounded-lg animate-pulse"></div>
                </div>
                
                {/* Right Column */}
                <div className="space-y-6">
                  {/* Description */}
                  <div className="space-y-2">
                    <div className="h-7 bg-gray-200 rounded-lg w-1/3 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded-lg w-full animate-pulse mt-2"></div>
                    <div className="h-4 bg-gray-200 rounded-lg w-full animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded-lg w-4/5 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded-lg w-full animate-pulse"></div>
                  </div>
                  
                  {/* Amenities */}
                  <div className="space-y-2">
                    <div className="h-7 bg-gray-200 rounded-lg w-1/3 animate-pulse"></div>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-6 bg-gray-200 rounded-lg animate-pulse"></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Map Location Skeleton */}
          <div className="mt-8 p-6 bg-blue-50/50 rounded-xl animate-pulse">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
              <div className="h-7 bg-gray-300 rounded-lg w-1/6"></div>
            </div>
            <div className="h-5 bg-gray-300 rounded-lg w-4/5 mb-4"></div>
            <div className="h-6 bg-gray-300 rounded-lg w-1/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Link
            to="/properties"
            className="text-blue-600 hover:underline flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 pt-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <nav className="flex items-center justify-between mb-8">
          <Link
            to="/properties"
            className="inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Properties
          </Link>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
              hover:bg-gray-100 transition-colors relative"
          >
            {copySuccess ? (
              <span className="text-green-600">
                <Copy className="w-5 h-5" />
                Copied!
              </span>
            ) : (
              <>
                <Share2 className="w-5 h-5" />
                Share
              </>
            )}
          </button>
        </nav>

        <div className="bg-white/90 backdrop-blur-md border border-white/40 rounded-2xl shadow-xl overflow-hidden">
          {/* Image Gallery */}
          <div className="relative h-[500px] bg-gray-900 rounded-2xl overflow-hidden mb-8 m-2">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImage}
                src={property.image[activeImage]}
                alt={`${property.title} - View ${activeImage + 1}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

            {/* Image Navigation */}
            {property.image.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImage(prev => 
                    prev === 0 ? property.image.length - 1 : prev - 1
                  )}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full
                    bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setActiveImage(prev => 
                    prev === property.image.length - 1 ? 0 : prev + 1
                  )}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full
                    bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Image Counter */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 
              bg-black/50 backdrop-blur-md border border-white/10 text-white px-4 py-2 rounded-full text-sm">
              {activeImage + 1} / {property.image.length}
            </div>

            {/* Virtual Tour Button */}
            {property.videoUrl && (
               <a 
                 href={property.videoUrl} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="absolute bottom-6 right-6 flex items-center gap-2 bg-blue-600/90 backdrop-blur-md text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
               >
                 <Eye className="w-4 h-4" />
                 Virtual Tour
               </a>
            )}
          </div>

          <div className="p-8">
            <div className="flex justify-between items-start mb-8 border-b border-gray-100 pb-8">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {property.title}
                </h1>
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-5 h-5 mr-2 text-blue-500" />
                  {property.location} 
                  {property.address?.customLocation && <span className="mx-2">•</span>}
                  {property.address?.customLocation}
                </div>
                {property.address?.ghanaPostGps && (
                    <div className="flex items-center text-blue-600 mt-2 font-medium">
                        <MapPin className="w-5 h-5 mr-2 text-yellow-500" />
                        <span className="bg-blue-50 px-2 py-1 rounded text-sm border border-blue-100">
                           GPS: {property.address.ghanaPostGps}
                        </span>
                    </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-3">
                 <div className="flex gap-2">
                    <span className="px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 font-medium text-sm">
                       {property.type}
                    </span>
                    <span className={`px-4 py-1.5 rounded-full text-white font-medium text-sm
                       ${property.listingType === 'Sale' ? 'bg-purple-600' : 'bg-emerald-600'}`}>
                       For {property.listingType}
                    </span>
                 </div>
                 <button
                   onClick={handleShare}
                   className="p-2 rounded-full hover:bg-gray-100 border border-gray-200"
                 >
                   <Share2 className="w-5 h-5 text-gray-600" />
                 </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-8">
                 {/* Stats */}
                 <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-2xl text-center border border-blue-100">
                    <BedDouble className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600">
                      {property.beds} <span className="text-gray-500 font-normal">Bedroom{property.beds !== 1 && 's'}</span>
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-2xl text-center border border-blue-100">
                    <Bath className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600">
                      {property.baths} <span className="text-gray-500 font-normal">Bathroom{property.baths !== 1 && 's'}</span>
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-2xl text-center border border-blue-100">
                    <Maximize className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600">{property.sqft} <span className="text-gray-500 font-normal">sqft</span></p>
                  </div>
                </div>

                {/* Property Story */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h2 className="text-2xl font-bold mb-4 font-serif text-gray-900 flex items-center gap-2">
                     <span className="w-1 h-8 bg-gold-500 rounded-full bg-yellow-500 display-block" />
                     Property Story
                  </h2>
                  <p className="text-gray-600 leading-relaxed text-lg font-light">
                    {property.description}
                  </p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h2 className="text-xl font-bold mb-4">Premium Amenities</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {property.amenities.map((amenity, index) => (
                      <div 
                        key={index}
                        className="flex items-center text-gray-700 bg-gray-50 p-3 rounded-lg"
                      >
                        <div className="w-2 h-2 rounded-full bg-blue-500 mr-3" />
                        {amenity}
                      </div>
                    ))}
                  </div>
                </div>

                 {/* Map Location - Only visible when viewing is confirmed */}
                <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                  <div className="flex items-center gap-2 text-blue-800 mb-4">
                    <Compass className="w-5 h-5" />
                    <h3 className="text-lg font-bold">Location & Neighborhood</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Situated in {property.location}, this property offers convenient access to local amenities.
                  </p>

                  {hasMapAccess ? (
                    <>
                      {(property.coordinates?.lat || property.address?.ghanaPostGps) && (
                        <div className="w-full h-64 bg-gray-200 rounded-xl overflow-hidden mb-4 relative">
                          {property.coordinates?.lat && property.coordinates?.lng ? (
                            <iframe
                              title="Property Location"
                              width="100%"
                              height="100%"
                              style={{ border: 0 }}
                              loading="lazy"
                              allowFullScreen
                              referrerPolicy="no-referrer-when-downgrade"
                              src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${property.coordinates.lat},${property.coordinates.lng}&zoom=15`}
                            />
                          ) : (
                            <iframe
                              title="Property Location"
                              width="100%"
                              height="100%"
                              style={{ border: 0 }}
                              loading="lazy"
                              allowFullScreen
                              referrerPolicy="no-referrer-when-downgrade"
                              src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(property.location)}`}
                            />
                          )}
                        </div>
                      )}
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${property.coordinates?.lat && property.coordinates?.lng ? `${property.coordinates.lat},${property.coordinates.lng}` : encodeURIComponent(property.location)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <MapPin className="w-4 h-4" />
                        Open in Google Maps
                      </a>
                    </>
                  ) : (
                    <div className="bg-white rounded-xl p-6 border border-blue-200 text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPin className="w-8 h-8 text-blue-400" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">Location Hidden</h4>
                      <p className="text-gray-500 text-sm mb-4">
                        The exact location and map will be revealed once your viewing request is confirmed by our team.
                      </p>
                      <button
                        onClick={() => setShowSchedule(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        <Calendar className="w-4 h-4" />
                        Schedule a Viewing to Unlock
                      </button>
                    </div>
                  )}
                </div>

                {/* Reviews Section */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                   <div className="p-6">
                      <ReviewSection targetId={property._id} targetType="Property" targetModel="Product" />
                   </div>
                </div>

              </div>

              {/* Right Sidebar */}
              <div className="space-y-6">
                 {/* Agent/Owner Info */}
                 {property.ownerId && (
                     <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                           <div className="w-14 h-14 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                              {property.ownerId.image ? (
                                  <img src={property.ownerId.image} alt={property.ownerId.name} className="w-full h-full object-cover" />
                              ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                                      <User className="w-8 h-8" />
                                  </div>
                              )}
                           </div>
                           <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Listed by</p>
                              <h3 className="font-bold text-gray-900 text-lg hover:text-blue-600 transition-colors">
                                  <Link to={`/user/${property.ownerId._id}`}>
                                      {property.ownerId.name || 'Property Owner'}
                                  </Link>
                              </h3>
                              {property.ownerId.agencyName && (
                                  <p className="text-sm text-blue-600 font-medium">{property.ownerId.agencyName}</p>
                              )}
                           </div>
                        </div>
                     </div>
                 )}

                 <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg sticky top-24">
                    <p className="text-sm text-gray-500 mb-1 font-medium tracking-wide uppercase">Price</p>
                    <div className="flex items-baseline gap-1 mb-2">
                       <span className="text-4xl font-bold text-gray-900">{getCurrencySymbol()}{formatPrice(property.price, { showSymbol: false })}</span>
                       {property.listingType === 'Rent' && <span className="text-gray-500 font-medium">/month</span>}
                    </div>
                    <div className="h-px bg-gray-100 my-4" />
                    
                    <div className="flex items-center text-gray-600 mb-6">
                        <Phone className="w-5 h-5 mr-3 text-blue-500" />
                        <span className="font-medium">{property.phone}</span>
                    </div>

                    <button
                      onClick={() => setShowSchedule(true)}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl
                        hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-blue-500/20 
                        flex items-center justify-center gap-3 font-bold text-lg mb-4"
                    >
                      <Calendar className="w-5 h-5" />
                      Schedule Viewing
                    </button>

                    <button
                      onClick={() => setShowServiceRequest(true)}
                      className="w-full bg-white text-blue-600 border border-blue-200 py-3 rounded-xl
                        hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                      <Building className="w-5 h-5" />
                      Need Moving Services?
                    </button>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Viewing Modal */}
        <AnimatePresence>
          {showSchedule && (
            <ScheduleViewing
              propertyId={property._id}
              propertyTitle={property.title}
              propertyLocation={property.location}
              propertyImage={property.image[0]}
              onClose={() => setShowSchedule(false)}
            />
          )}
        </AnimatePresence>

        {/* Service Request Modal */}
        <AnimatePresence>
            {showServiceRequest && (
                <ServiceRequestForm
                   onClose={() => setShowServiceRequest(false)}
                   initialServiceType="Moving"
                />
            )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default PropertyDetails;