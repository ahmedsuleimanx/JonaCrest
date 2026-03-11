import React from 'react';
import { motion } from 'framer-motion';
import { 
  Building, ShoppingCart, GraduationCap, Stethoscope,
  UtensilsCrossed, Bus, TreePine, Shield, Dumbbell,
  Coffee, ShoppingBag, Landmark
} from 'lucide-react';

/**
 * Neighborhood Insights Component
 * PRD Section 4.7.4 - Local amenities and neighborhood information
 */

const NeighborhoodInsights = ({ 
  insights = [],
  walkScore,
  transitScore,
  safetyScore,
  className = ''
}) => {
  // Default categories with icons
  const categoryIcons = {
    shopping: ShoppingCart,
    education: GraduationCap,
    healthcare: Stethoscope,
    dining: UtensilsCrossed,
    transit: Bus,
    parks: TreePine,
    safety: Shield,
    fitness: Dumbbell,
    cafes: Coffee,
    retail: ShoppingBag,
    landmarks: Landmark,
    default: Building,
  };

  const getIcon = (category) => {
    const key = category?.toLowerCase() || 'default';
    return categoryIcons[key] || categoryIcons.default;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    if (score >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return "Walker's Paradise";
    if (score >= 70) return 'Very Walkable';
    if (score >= 50) return 'Somewhat Walkable';
    if (score >= 25) return 'Car-Dependent';
    return 'Almost All Errands Require a Car';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Scores Section */}
      {(walkScore || transitScore || safetyScore) && (
        <div className="grid grid-cols-3 gap-4">
          {walkScore && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-4 border border-gray-100 text-center"
            >
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full ${getScoreColor(walkScore)} font-bold text-xl mb-2`}>
                {walkScore}
              </div>
              <p className="font-semibold text-gray-900 text-sm">Walk Score</p>
              <p className="text-xs text-gray-500 mt-1">{getScoreLabel(walkScore)}</p>
            </motion.div>
          )}

          {transitScore && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-4 border border-gray-100 text-center"
            >
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full ${getScoreColor(transitScore)} font-bold text-xl mb-2`}>
                {transitScore}
              </div>
              <p className="font-semibold text-gray-900 text-sm">Transit Score</p>
              <p className="text-xs text-gray-500 mt-1">
                {transitScore >= 70 ? 'Excellent Transit' : 'Some Transit'}
              </p>
            </motion.div>
          )}

          {safetyScore && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-4 border border-gray-100 text-center"
            >
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full ${getScoreColor(safetyScore)} font-bold text-xl mb-2`}>
                {safetyScore}
              </div>
              <p className="font-semibold text-gray-900 text-sm">Safety Score</p>
              <p className="text-xs text-gray-500 mt-1">
                {safetyScore >= 70 ? 'Very Safe' : 'Moderate Safety'}
              </p>
            </motion.div>
          )}
        </div>
      )}

      {/* Nearby Amenities */}
      {insights.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-4">What's Nearby</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {insights.map((item, idx) => {
              const Icon = getIcon(item.category);
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Icon className="w-4 h-4 text-teal-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">
                      {item.name}
                    </p>
                    {item.distance && (
                      <p className="text-xs text-gray-500">{item.distance}</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {insights.length === 0 && !walkScore && !transitScore && (
        <div className="text-center py-8 text-gray-500">
          <Building className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p>Neighborhood insights coming soon</p>
        </div>
      )}
    </div>
  );
};

export default NeighborhoodInsights;
