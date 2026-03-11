import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating, setRating, readOnly = false, size = "md" }) => {
  const [hover, setHover] = useState(0);

  const starSize = size === "sm" ? "w-4 h-4" : size === "lg" ? "w-8 h-8" : "w-5 h-5";

  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;

        return (
          <button
            type="button"
            key={index}
            className={`${readOnly ? 'cursor-default' : 'cursor-pointer'} transition-colors duration-150 focus:outline-none`}
            onClick={() => !readOnly && setRating(ratingValue)}
            onMouseEnter={() => !readOnly && setHover(ratingValue)}
            onMouseLeave={() => !readOnly && setHover(0)}
            disabled={readOnly}
          >
             <Star 
                className={`${starSize} ${
                    ratingValue <= (hover || rating) 
                        ? "fill-amber-400 text-amber-400" 
                        : "text-gray-300 dark:text-gray-600"
                }`} 
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
