import React, { useState, useCallback } from 'react';
import { MapPin, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

/**
 * Ghana Digital Address (GhanaPostGPS) Input Component
 * PRD Section 4.8.2 - Ghana Digital Address validation and auto-fill
 * 
 * Ghana Digital Address Format: XX-XXX-XXXX (e.g., GA-123-4567)
 * - First 2 letters: Region code (e.g., GA = Greater Accra)
 * - 3 digits: District code
 * - 4 digits: Property code
 */

const REGION_CODES = {
  'GA': 'Greater Accra',
  'AS': 'Ashanti',
  'WE': 'Western',
  'CE': 'Central',
  'ER': 'Eastern',
  'VR': 'Volta',
  'BA': 'Bono Ahafo',
  'NR': 'Northern',
  'UE': 'Upper East',
  'UW': 'Upper West',
  'AH': 'Ahafo',
  'BO': 'Bono',
  'BE': 'Bono East',
  'NE': 'North East',
  'OT': 'Oti',
  'SV': 'Savannah',
  'WN': 'Western North',
};

const GhanaAddressInput = ({
  value = '',
  onChange,
  onValidAddress,
  placeholder = 'Enter Ghana Digital Address (e.g., GA-123-4567)',
  label = 'Ghana Digital Address',
  required = false,
  className = '',
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [isValidating, setIsValidating] = useState(false);
  const [validationState, setValidationState] = useState(null); // 'valid', 'invalid', null
  const [regionName, setRegionName] = useState('');

  // Format input as user types
  const formatAddress = (input) => {
    // Remove all non-alphanumeric characters
    const cleaned = input.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    // Apply format: XX-XXX-XXXX
    let formatted = '';
    if (cleaned.length > 0) formatted += cleaned.slice(0, 2);
    if (cleaned.length > 2) formatted += '-' + cleaned.slice(2, 5);
    if (cleaned.length > 5) formatted += '-' + cleaned.slice(5, 9);
    
    return formatted;
  };

  // Validate Ghana Digital Address format
  const validateAddress = (address) => {
    const pattern = /^[A-Z]{2}-\d{3}-\d{4}$/;
    return pattern.test(address);
  };

  // Lookup region from code
  const getRegionFromCode = (address) => {
    if (address.length >= 2) {
      const code = address.slice(0, 2).toUpperCase();
      return REGION_CODES[code] || null;
    }
    return null;
  };

  // Handle input change
  const handleChange = useCallback((e) => {
    const rawValue = e.target.value;
    const formatted = formatAddress(rawValue);
    
    setInputValue(formatted);
    setValidationState(null);
    
    // Check region
    const region = getRegionFromCode(formatted);
    setRegionName(region || '');

    // Validate when complete
    if (formatted.length === 11) { // XX-XXX-XXXX
      setIsValidating(true);
      
      // Simulate API validation (in production, call GhanaPostGPS API)
      setTimeout(() => {
        const isValid = validateAddress(formatted);
        setValidationState(isValid ? 'valid' : 'invalid');
        setIsValidating(false);
        
        if (isValid && onValidAddress) {
          onValidAddress({
            digitalAddress: formatted,
            region: region,
            // In production, these would come from GhanaPostGPS API
            coordinates: null,
            fullAddress: null,
          });
        }
      }, 500);
    }

    if (onChange) {
      onChange(formatted);
    }
  }, [onChange, onValidAddress]);

  // Get input border color based on state
  const getBorderColor = () => {
    if (isValidating) return 'border-blue-400 ring-2 ring-blue-100';
    if (validationState === 'valid') return 'border-green-500 ring-2 ring-green-100';
    if (validationState === 'invalid') return 'border-red-500 ring-2 ring-red-100';
    return 'border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100';
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <MapPin className={`w-5 h-5 ${validationState === 'valid' ? 'text-green-500' : 'text-gray-400'}`} />
        </div>
        
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          placeholder={placeholder}
          maxLength={11}
          className={`w-full pl-12 pr-12 py-3 rounded-xl border transition-all outline-none
            ${getBorderColor()} ${className}`}
        />
        
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
          {isValidating && (
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          )}
          {validationState === 'valid' && (
            <CheckCircle className="w-5 h-5 text-green-500" />
          )}
          {validationState === 'invalid' && (
            <AlertCircle className="w-5 h-5 text-red-500" />
          )}
        </div>
      </div>

      {/* Region indicator */}
      {regionName && (
        <p className="mt-1.5 text-sm text-teal-600 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5" />
          {regionName} Region
        </p>
      )}

      {/* Validation messages */}
      {validationState === 'valid' && (
        <p className="mt-1.5 text-sm text-green-600 flex items-center gap-1">
          <CheckCircle className="w-3.5 h-3.5" />
          Valid Ghana Digital Address
        </p>
      )}
      {validationState === 'invalid' && (
        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          Invalid address format. Use: XX-XXX-XXXX
        </p>
      )}

      {/* Format hint */}
      <p className="mt-2 text-xs text-gray-500">
        Format: XX-XXX-XXXX (e.g., GA-123-4567)
      </p>
    </div>
  );
};

export default GhanaAddressInput;
