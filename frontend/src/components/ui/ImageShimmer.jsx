import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * ImageShimmer Component
 * Displays a liquid-glass shimmer effect while image is loading
 * Features smooth gradient animation with glass-morphism styling
 */
const ImageShimmer = ({ 
  src, 
  alt = '', 
  className = '', 
  containerClassName = '',
  aspectRatio = 'aspect-video',
  objectFit = 'cover',
  onLoad,
  onError
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Reset states when src changes
  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [src]);

  const handleLoad = (e) => {
    setImageLoaded(true);
    onLoad?.(e);
  };

  const handleError = (e) => {
    setImageError(true);
    onError?.(e);
  };

  return (
    <div className={`relative overflow-hidden ${aspectRatio} ${containerClassName}`}>
      {/* Shimmer effect - visible while loading */}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 shimmer-container">
          {/* Base glass layer */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200/60 via-gray-100/40 to-gray-200/60 backdrop-blur-sm" />
          
          {/* Animated shimmer overlay */}
          <div className="absolute inset-0 shimmer-effect" />
          
          {/* Glass reflection */}
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/30" />
          
          {/* Subtle border glow */}
          <div className="absolute inset-0 ring-1 ring-inset ring-white/20" />
        </div>
      )}

      {/* Error state */}
      {imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center text-gray-400">
            <svg 
              className="w-12 h-12 mx-auto mb-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
            <span className="text-sm">Image unavailable</span>
          </div>
        </div>
      )}

      {/* Actual image */}
      <img
        src={src}
        alt={alt}
        className={`
          absolute inset-0 w-full h-full transition-opacity duration-500 ease-out
          ${objectFit === 'cover' ? 'object-cover' : objectFit === 'contain' ? 'object-contain' : ''}
          ${imageLoaded ? 'opacity-100' : 'opacity-0'}
          ${className}
        `}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
      />

      {/* CSS for shimmer animation */}
      <style>{`
        .shimmer-container {
          isolation: isolate;
        }
        
        .shimmer-effect {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.4) 20%,
            rgba(255, 255, 255, 0.8) 50%,
            rgba(255, 255, 255, 0.4) 80%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s ease-in-out infinite;
        }
        
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
        
        /* Liquid glass effect with subtle movement */
        .shimmer-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(
              ellipse 80% 50% at 50% 0%,
              rgba(255, 255, 255, 0.3) 0%,
              transparent 50%
            );
          animation: liquid 3s ease-in-out infinite;
        }
        
        @keyframes liquid {
          0%, 100% {
            transform: translateY(0) scale(1);
            opacity: 0.5;
          }
          50% {
            transform: translateY(5px) scale(1.02);
            opacity: 0.3;
          }
        }
      `}</style>
    </div>
  );
};

ImageShimmer.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  className: PropTypes.string,
  containerClassName: PropTypes.string,
  aspectRatio: PropTypes.string,
  objectFit: PropTypes.oneOf(['cover', 'contain', 'fill', 'none']),
  onLoad: PropTypes.func,
  onError: PropTypes.func
};

export default ImageShimmer;
