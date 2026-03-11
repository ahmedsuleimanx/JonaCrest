import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  BedDouble, 
  Bath, 
  Maximize,
  Share2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import PropTypes from 'prop-types';
import { useCurrency } from '../../context/CurrencyContext';


const PropertyCard = ({ property, viewType }) => {
  const isGrid = viewType === 'grid';
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const { formatPrice, getCurrencySymbol } = useCurrency();

  const handleNavigateToDetails = () => {
    navigate(`/properties/single/${property._id}`);
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    try {
      if (navigator.share) {
        await navigator.share({
          title: property.title,
          text: `Check out this property: ${property.title}`,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleImageNavigation = (e, direction) => {
    e.stopPropagation();
    const imagesCount = property.image.length;
    if (direction === 'next') {
      setCurrentImageIndex((prev) => (prev + 1) % imagesCount);
    } else {
      setCurrentImageIndex((prev) => (prev - 1 + imagesCount) % imagesCount);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className={`group bg-white/90 backdrop-blur-md border border-white/40 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300
        ${isGrid ? 'flex flex-col' : 'flex flex-row gap-6'}`}
      onClick={handleNavigateToDetails}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Image Carousel Section */}
      <div className={`relative ${isGrid ? 'h-64' : 'w-96'}`}>
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImageIndex}
            src={property.image[currentImageIndex]}
            alt={property.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />

        {/* Image Navigation Controls */}
        {showControls && property.image.length > 1 && (
          <div className="absolute inset-0 flex items-center justify-between px-2 z-10">
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.1 }}
              onClick={(e) => handleImageNavigation(e, 'prev')}
              className="p-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/40"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.1 }}
              onClick={(e) => handleImageNavigation(e, 'next')}
              className="p-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/40"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        )}

        {/* Image Indicators */}
        {property.image.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {property.image.map((_, index) => (
              <div
                key={index}
                className={`h-1 rounded-full transition-all duration-300 shadow-sm
                  ${index === currentImageIndex ? 'bg-white w-4' : 'bg-white/50 w-1.5'}`}
              />
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={handleShare}
            className="p-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full hover:bg-white/40 
              transition-colors shadow-lg text-white"
          >
            <Share2 className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Property Tags */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          <motion.span 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-blue-600/90 backdrop-blur-sm text-white 
              px-3 py-1 rounded-xl text-xs font-semibold shadow-lg border border-white/10"
          >
            {property.type}
          </motion.span>
          <motion.span 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`px-3 py-1 rounded-xl text-xs font-semibold shadow-lg border border-white/10 backdrop-blur-sm text-white
              ${property.availability === 'Sold' ? 'bg-red-500/90' : 'bg-emerald-500/90'}`}
          >
            {property.availability}
          </motion.span>
        </div>
        
        {/* GPS Badge */}
        {property.address?.ghanaPostGps && (
             <div className="absolute bottom-3 left-3 z-10">
                <span className="flex items-center gap-1 bg-black/40 backdrop-blur-md border border-white/20 text-white text-[10px] px-2 py-1 rounded-lg">
                    <MapPin className="w-3 h-3 text-yellow-400" />
                    GPS Verified
                </span>
             </div>
        )}
      </div>

      {/* Content Section */}
      <div className={`flex-1 p-5 ${isGrid ? '' : 'flex flex-col justify-between'}`}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-500 text-xs font-medium">
              <MapPin className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
              <span className="line-clamp-1">{property.location}</span>
            </div>
          </div>

          <h3 className="text-lg font-bold text-gray-900 line-clamp-1 
            group-hover:text-blue-600 transition-colors">
            {property.title}
          </h3>

          <div className="flex items-baseline gap-1.5">
             <span className="text-blue-600 font-bold text-lg">{getCurrencySymbol()}</span>
             <span className="text-2xl font-bold text-gray-900 tracking-tight">
                {formatPrice(property.price, { showSymbol: false })}
             </span>
             {property.listingType === 'Rent' && <span className="text-sm text-gray-500 font-medium">/month</span>}
          </div>
        </div>

        {/* Property Features */}
        <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-gray-100">
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-gray-50 group-hover:bg-blue-50 transition-colors">
            <BedDouble className="w-4 h-4 text-gray-400 group-hover:text-blue-500 mb-1" />
            <span className="text-xs font-semibold text-gray-700">
              {property.beds} <span className="text-gray-400 font-normal">Beds</span>
            </span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-gray-50 group-hover:bg-blue-50 transition-colors">
            <Bath className="w-4 h-4 text-gray-400 group-hover:text-blue-500 mb-1" />
            <span className="text-xs font-semibold text-gray-700">
              {property.baths} <span className="text-gray-400 font-normal">Baths</span>
            </span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-gray-50 group-hover:bg-blue-50 transition-colors">
            <Maximize className="w-4 h-4 text-gray-400 group-hover:text-blue-500 mb-1" />
            <span className="text-xs font-semibold text-gray-700">
              {property.sqft} <span className="text-gray-400 font-normal">sqft</span>
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

PropertyCard.propTypes = {
  property: PropTypes.object.isRequired,
  viewType: PropTypes.string.isRequired
};

export default PropertyCard;