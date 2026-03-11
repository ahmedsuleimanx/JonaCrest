import React from 'react';
import { Sun, Moon, CloudSun, Sunset, Stars } from 'lucide-react';

/**
 * Time of Day Visualization Component
 * PRD Section 4.7.3 - Shows property appearance at different times
 */

const TimeOfDayVisualization = ({ 
  images = {},  // { morning, afternoon, evening, night }
  currentImage,
  onChange 
}) => {
  const timeSlots = [
    { 
      id: 'morning', 
      label: 'Morning',
      time: '6:00 AM',
      icon: CloudSun, 
      gradient: 'from-orange-200 via-yellow-100 to-blue-200',
      iconColor: 'text-orange-400'
    },
    { 
      id: 'afternoon', 
      label: 'Afternoon',
      time: '12:00 PM', 
      icon: Sun, 
      gradient: 'from-blue-300 via-blue-200 to-yellow-100',
      iconColor: 'text-yellow-500'
    },
    { 
      id: 'evening', 
      label: 'Evening',
      time: '6:00 PM', 
      icon: Sunset, 
      gradient: 'from-orange-300 via-pink-200 to-purple-300',
      iconColor: 'text-orange-500'
    },
    { 
      id: 'night', 
      label: 'Night',
      time: '9:00 PM', 
      icon: Stars, 
      gradient: 'from-indigo-900 via-purple-900 to-gray-900',
      iconColor: 'text-indigo-300'
    },
  ];

  const currentSlot = timeSlots.find(slot => slot.id === currentImage) || timeSlots[1];

  return (
    <div className="space-y-4">
      {/* Time Selector */}
      <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-2">
        {timeSlots.map((slot) => {
          const Icon = slot.icon;
          const isActive = currentImage === slot.id;
          const hasImage = images[slot.id];

          return (
            <button
              key={slot.id}
              onClick={() => hasImage && onChange && onChange(slot.id)}
              disabled={!hasImage}
              className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-xl transition-all
                ${isActive 
                  ? 'bg-white shadow-md' 
                  : hasImage 
                    ? 'hover:bg-white/50' 
                    : 'opacity-40 cursor-not-allowed'
                }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? slot.iconColor : 'text-gray-400'}`} />
              <span className={`text-xs font-medium ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                {slot.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Visualization Header */}
      <div className={`bg-gradient-to-r ${currentSlot.gradient} rounded-2xl p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${currentSlot.id === 'night' ? 'bg-white/20' : 'bg-white/50'}`}>
              <currentSlot.icon className={`w-6 h-6 ${currentSlot.iconColor}`} />
            </div>
            <div>
              <p className={`font-semibold ${currentSlot.id === 'night' ? 'text-white' : 'text-gray-900'}`}>
                {currentSlot.label} View
              </p>
              <p className={`text-sm ${currentSlot.id === 'night' ? 'text-white/70' : 'text-gray-600'}`}>
                Around {currentSlot.time}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Text */}
      <p className="text-xs text-gray-500 text-center">
        See how this property looks at different times of day
      </p>
    </div>
  );
};

export default TimeOfDayVisualization;
