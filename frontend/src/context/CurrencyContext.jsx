import React, { createContext, useState, useContext, useEffect, useCallback } from "react";

// Currency data with symbols, codes, and approximate exchange rates (from GHS base)
const CURRENCY_DATA = {
  GHS: { symbol: "₵", code: "GHS", name: "Ghana Cedi", rate: 1, locale: "en-GH" },
  USD: { symbol: "$", code: "USD", name: "US Dollar", rate: 0.08, locale: "en-US" },
  EUR: { symbol: "€", code: "EUR", name: "Euro", rate: 0.073, locale: "de-DE" },
  GBP: { symbol: "£", code: "GBP", name: "British Pound", rate: 0.063, locale: "en-GB" },
  NGN: { symbol: "₦", code: "NGN", name: "Nigerian Naira", rate: 125, locale: "en-NG" },
  KES: { symbol: "KSh", code: "KES", name: "Kenyan Shilling", rate: 10.3, locale: "en-KE" },
  ZAR: { symbol: "R", code: "ZAR", name: "South African Rand", rate: 1.45, locale: "en-ZA" },
  XOF: { symbol: "CFA", code: "XOF", name: "West African CFA", rate: 48, locale: "fr-SN" },
  INR: { symbol: "₹", code: "INR", name: "Indian Rupee", rate: 6.65, locale: "en-IN" },
  AED: { symbol: "د.إ", code: "AED", name: "UAE Dirham", rate: 0.29, locale: "ar-AE" },
  CAD: { symbol: "C$", code: "CAD", name: "Canadian Dollar", rate: 0.11, locale: "en-CA" },
  AUD: { symbol: "A$", code: "AUD", name: "Australian Dollar", rate: 0.12, locale: "en-AU" },
};

// Country to currency mapping
const COUNTRY_CURRENCY_MAP = {
  GH: "GHS", // Ghana
  US: "USD", // United States
  GB: "GBP", // United Kingdom
  DE: "EUR", // Germany
  FR: "EUR", // France
  IT: "EUR", // Italy
  ES: "EUR", // Spain
  NG: "NGN", // Nigeria
  KE: "KES", // Kenya
  ZA: "ZAR", // South Africa
  SN: "XOF", // Senegal
  CI: "XOF", // Ivory Coast
  IN: "INR", // India
  AE: "AED", // UAE
  CA: "CAD", // Canada
  AU: "AUD", // Australia
  NZ: "AUD", // New Zealand
  IE: "EUR", // Ireland
  NL: "EUR", // Netherlands
  BE: "EUR", // Belgium
  PT: "EUR", // Portugal
  AT: "EUR", // Austria
};

const CurrencyContext = createContext(null);

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState("GHS"); // Default to Ghana Cedi
  const [currencyData, setCurrencyData] = useState(CURRENCY_DATA.GHS);
  const [userCountry, setUserCountry] = useState("GH");
  const [loading, setLoading] = useState(true);
  const [detectionMethod, setDetectionMethod] = useState("default");

  // Detect user's location and set appropriate currency
  const detectUserCurrency = useCallback(async () => {
    setLoading(true);
    
    try {
      // Try IP-based geolocation first (more reliable, doesn't require permission)
      const response = await fetch("https://ipapi.co/json/", {
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      if (response.ok) {
        const data = await response.json();
        const countryCode = data.country_code || data.country;
        
        if (countryCode && COUNTRY_CURRENCY_MAP[countryCode]) {
          const detectedCurrency = COUNTRY_CURRENCY_MAP[countryCode];
          setCurrency(detectedCurrency);
          setCurrencyData(CURRENCY_DATA[detectedCurrency]);
          setUserCountry(countryCode);
          setDetectionMethod("ip-geolocation");
          
          // Store in localStorage for persistence
          localStorage.setItem("userCurrency", detectedCurrency);
          localStorage.setItem("userCountry", countryCode);
        }
      }
    } catch (error) {
      console.log("IP geolocation failed, using default currency (GHS):", error.message);
      
      // Check localStorage for previously stored preference
      const storedCurrency = localStorage.getItem("userCurrency");
      const storedCountry = localStorage.getItem("userCountry");
      
      if (storedCurrency && CURRENCY_DATA[storedCurrency]) {
        setCurrency(storedCurrency);
        setCurrencyData(CURRENCY_DATA[storedCurrency]);
        setUserCountry(storedCountry || "GH");
        setDetectionMethod("stored");
      } else {
        // Keep default GHS
        setDetectionMethod("default");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    detectUserCurrency();
  }, [detectUserCurrency]);

  // Format price with current currency
  const formatPrice = useCallback((amount, options = {}) => {
    if (amount === null || amount === undefined) return "N/A";
    
    const {
      showSymbol = true,
      showCode = false,
      convert = false, // If true, convert from GHS to user's currency
      decimals = 0,
    } = options;
    
    let displayAmount = Number(amount);
    
    // Convert from GHS to user's currency if requested
    if (convert && currency !== "GHS") {
      displayAmount = displayAmount * currencyData.rate;
    }
    
    // Format the number
    const formattedNumber = displayAmount.toLocaleString(currencyData.locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    
    // Build the display string
    let result = "";
    if (showSymbol) {
      result = `${currencyData.symbol}${formattedNumber}`;
    } else if (showCode) {
      result = `${currencyData.code} ${formattedNumber}`;
    } else {
      result = formattedNumber;
    }
    
    return result;
  }, [currency, currencyData]);

  // Format price with GHS as base (for display without conversion)
  const formatPriceGHS = useCallback((amount, options = {}) => {
    if (amount === null || amount === undefined) return "N/A";
    
    const { decimals = 0 } = options;
    const displayAmount = Number(amount);
    
    const formattedNumber = displayAmount.toLocaleString("en-GH", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    
    return `₵${formattedNumber}`;
  }, []);

  // Get currency symbol
  const getCurrencySymbol = useCallback(() => {
    return currencyData.symbol;
  }, [currencyData]);

  // Get currency code
  const getCurrencyCode = useCallback(() => {
    return currencyData.code;
  }, [currencyData]);

  // Manually set currency (for user preference override)
  const setUserCurrency = useCallback((currencyCode) => {
    if (CURRENCY_DATA[currencyCode]) {
      setCurrency(currencyCode);
      setCurrencyData(CURRENCY_DATA[currencyCode]);
      setDetectionMethod("user-selected");
      localStorage.setItem("userCurrency", currencyCode);
    }
  }, []);

  // Get all available currencies for selector
  const getAvailableCurrencies = useCallback(() => {
    return Object.entries(CURRENCY_DATA).map(([code, data]) => ({
      code,
      symbol: data.symbol,
      name: data.name,
    }));
  }, []);

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        currencyData,
        userCountry,
        loading,
        detectionMethod,
        formatPrice,
        formatPriceGHS,
        getCurrencySymbol,
        getCurrencyCode,
        setUserCurrency,
        getAvailableCurrencies,
        CURRENCY_DATA,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};

export default CurrencyContext;
