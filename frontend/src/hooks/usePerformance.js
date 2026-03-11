import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom React Hooks for Performance Optimization
 * PRD Section 4.1.2.4 - Debounce/Throttle for search and filters
 */

/**
 * useDebounce - Debounces a value by specified delay
 * @param {any} value - The value to debounce
 * @param {number} delay - Delay in milliseconds (default: 300ms)
 * @returns {any} - The debounced value
 */
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * useDebouncedCallback - Returns a debounced version of a callback
 * @param {Function} callback - The callback function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Debounced callback
 */
export const useDebouncedCallback = (callback, delay = 300) => {
  const timeoutRef = useRef(null);

  const debouncedCallback = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
};

/**
 * useThrottle - Throttles a value by specified interval
 * @param {any} value - The value to throttle
 * @param {number} interval - Interval in milliseconds
 * @returns {any} - The throttled value
 */
export const useThrottle = (value, interval = 500) => {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastRan = useRef(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= interval) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, interval - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, interval]);

  return throttledValue;
};

/**
 * useInfiniteScroll - Hook for infinite scroll pagination
 * @param {Function} fetchMore - Function to call when more items needed
 * @param {boolean} hasMore - Whether more items are available
 * @param {number} threshold - Distance from bottom to trigger (default: 100px)
 * @returns {Object} - { loadingMore, ref }
 */
export const useInfiniteScroll = (fetchMore, hasMore, threshold = 100) => {
  const [loadingMore, setLoadingMore] = useState(false);
  const observerRef = useRef(null);
  const targetRef = useRef(null);

  const handleObserver = useCallback((entries) => {
    const target = entries[0];
    if (target.isIntersecting && hasMore && !loadingMore) {
      setLoadingMore(true);
      fetchMore().finally(() => setLoadingMore(false));
    }
  }, [fetchMore, hasMore, loadingMore]);

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: `${threshold}px`,
      threshold: 0,
    };

    observerRef.current = new IntersectionObserver(handleObserver, option);

    if (targetRef.current) {
      observerRef.current.observe(targetRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver, threshold]);

  return { loadingMore, ref: targetRef };
};

/**
 * useLocalStorage - Sync state with localStorage
 * @param {string} key - localStorage key
 * @param {any} initialValue - Initial value if not in storage
 * @returns {[any, Function]} - [value, setValue]
 */
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading localStorage:', error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error setting localStorage:', error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
};

/**
 * useGeolocation - Get user's current location
 * @returns {Object} - { location, error, loading, requestLocation }
 */
export const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes cache
      }
    );
  }, []);

  return { location, error, loading, requestLocation };
};

export default {
  useDebounce,
  useDebouncedCallback,
  useThrottle,
  useInfiniteScroll,
  useLocalStorage,
  useGeolocation,
};
