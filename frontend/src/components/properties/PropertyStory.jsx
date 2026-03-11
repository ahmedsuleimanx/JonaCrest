import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Home, Heart, Quote, User, Calendar, MapPin, 
  ChevronDown, ChevronUp, Sparkles
} from 'lucide-react';

/**
 * Property Story Component
 * PRD Section 4.7.7 - "Property Story" humanizing feature
 * Owner/landlord personal narrative about the property
 */

const PropertyStory = ({ 
  story,
  ownerName,
  ownerImage,
  yearsOwned,
  highlights = [],
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!story) return null;

  // Truncate story for preview
  const maxPreviewLength = 250;
  const needsTruncation = story.length > maxPreviewLength;
  const previewText = needsTruncation 
    ? story.slice(0, maxPreviewLength) + '...' 
    : story;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 rounded-3xl p-6 md:p-8 border border-amber-100 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-amber-100 rounded-xl">
          <Sparkles className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-lg">The Story Behind This Home</h3>
          <p className="text-sm text-gray-500">Shared by the owner</p>
        </div>
      </div>

      {/* Quote Icon */}
      <Quote className="w-10 h-10 text-amber-200 mb-4" />

      {/* Story Content */}
      <div className="relative">
        <p className="text-gray-700 leading-relaxed text-lg italic">
          {isExpanded ? story : previewText}
        </p>

        {needsTruncation && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-amber-600 font-medium mt-3 hover:text-amber-700 transition-colors"
          >
            {isExpanded ? (
              <>Show Less <ChevronUp className="w-4 h-4" /></>
            ) : (
              <>Read Full Story <ChevronDown className="w-4 h-4" /></>
            )}
          </button>
        )}
      </div>

      {/* Owner Info */}
      <div className="flex items-center gap-4 mt-8 pt-6 border-t border-amber-100">
        {ownerImage ? (
          <img 
            src={ownerImage} 
            alt={ownerName}
            className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-xl shadow-md">
            {ownerName?.charAt(0) || 'O'}
          </div>
        )}
        <div>
          <p className="font-semibold text-gray-900">{ownerName || 'Property Owner'}</p>
          {yearsOwned && (
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Owner for {yearsOwned} years
            </p>
          )}
        </div>
      </div>

      {/* Highlights */}
      {highlights.length > 0 && (
        <div className="mt-6 pt-6 border-t border-amber-100">
          <p className="text-sm font-medium text-gray-500 mb-3">Owner's Favorite Things</p>
          <div className="flex flex-wrap gap-2">
            {highlights.map((item, idx) => (
              <span
                key={idx}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/70 rounded-full text-sm text-gray-700 border border-amber-100"
              >
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                {item}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default PropertyStory;
