import { Home, Filter, MapPin, Tag } from "lucide-react";
import { motion } from "framer-motion";
import { useCurrency } from "../../context/CurrencyContext";

const propertyTypes = ["House", "Apartment", "Villa", "Office", "Land"];
const listingTypes = ["Rent", "Sale", "Short-term"];
const regions = [
  "Greater Accra", "Ashanti", "Western", "Eastern", "Central", 
  "Northern", "Volta", "Brong Ahafo", "Upper East", "Upper West"
];

const FilterSection = ({ filters, setFilters, onApplyFilters }) => {
  const { getCurrencySymbol } = useCurrency();
  const currencySymbol = getCurrencySymbol();
  
  const priceRanges = [
    { min: 0, max: 2000, label: `Under ${currencySymbol}2,000` },
    { min: 2000, max: 5000, label: `${currencySymbol}2k - ${currencySymbol}5k` },
    { min: 5000, max: 10000, label: `${currencySymbol}5k - ${currencySymbol}10k` },
    { min: 10000, max: 50000, label: `${currencySymbol}10k - ${currencySymbol}50k` },
    { min: 50000, max: Number.MAX_SAFE_INTEGER, label: `Above ${currencySymbol}50k` }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePriceRangeChange = (min, max) => {
    setFilters(prev => ({
      ...prev,
      priceRange: [min, max]
    }));
  };

  const handleReset = () => {
    setFilters({
      propertyType: "",
      priceRange: [0, Number.MAX_SAFE_INTEGER],
      bedrooms: "0",
      bathrooms: "0",
      availability: "",
      searchQuery: "",
      sortBy: ""
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white p-6 rounded-xl shadow-lg"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold">Filters</h2>
        </div>
        <button
          onClick={handleReset}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Reset All
        </button>
      </div>

      <div className="space-y-6">
        {/* Property Type */}
        <div className="filter-group">
          <label className="filter-label">
            <Home className="w-4 h-4 mr-2" />
            Property Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {propertyTypes.map((type) => (
              <button
                key={type}
                onClick={() => handleChange({
                  target: { name: "propertyType", value: type.toLowerCase() }
                })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${filters.propertyType === type.toLowerCase()
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="filter-group">
          <label className="filter-label">
            <Tag className="w-4 h-4 mr-2" />
            Price Range
          </label>
          <div className="grid grid-cols-2 gap-2">
            {priceRanges.map(({ min, max, label }) => (
              <button
                key={label}
                onClick={() => handlePriceRangeChange(min, max)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${filters.priceRange[0] === min && filters.priceRange[1] === max
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Listing Type */}
        <div className="filter-group">
           <label className="filter-label">
              <Tag className="w-4 h-4 mr-2" />
              Listing Type
           </label>
           <div className="flex flex-wrap gap-2">
              {listingTypes.map((type) => (
                 <button
                    key={type}
                    onClick={() => handleChange({
                       target: { name: "listingType", value: type }
                    })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                       ${filters.listingType === type
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                 >
                    {type}
                 </button>
              ))}
           </div>
        </div>

        {/* Region */}
        <div className="filter-group">
           <label className="filter-label">
              <MapPin className="w-4 h-4 mr-2" />
              Region
           </label>
           <select
              name="region"
              value={filters.region}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
           >
              <option value="">All Regions</option>
              {regions.map((region) => (
                 <option key={region} value={region}>
                    {region}
                 </option>
              ))}
           </select>
        </div>

        {/* Rest of your existing filter groups */}
        {/* ... */}

        <div className="flex space-x-4 mt-8">
          <button
            onClick={() => onApplyFilters(filters)}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 
              transition-colors font-medium"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default FilterSection;