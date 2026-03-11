import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { backendurl } from '../config/constants';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light'); // light, dark, system
  const [compactMode, setCompactMode] = useState(false);
  const [resolvedTheme, setResolvedTheme] = useState('light'); // actual applied theme
  const [loading, setLoading] = useState(true);

  // Detect system preference
  const getSystemTheme = useCallback(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }, []);

  // Resolve the actual theme to apply
  const resolveTheme = useCallback((themeValue) => {
    if (themeValue === 'system') {
      return getSystemTheme();
    }
    return themeValue;
  }, [getSystemTheme]);

  // Apply theme to document
  const applyTheme = useCallback((themeValue, compact) => {
    const resolved = resolveTheme(themeValue);
    setResolvedTheme(resolved);

    // Apply dark mode class
    if (resolved === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Apply compact mode class
    if (compact) {
      document.documentElement.classList.add('compact');
    } else {
      document.documentElement.classList.remove('compact');
    }

    // Store in localStorage for persistence
    localStorage.setItem('admin-theme', themeValue);
    localStorage.setItem('admin-compact', String(compact));
  }, [resolveTheme]);

  // Fetch settings from backend
  const fetchSettings = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axios.get(`${backendurl}/api/admin/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success && response.data.settings?.appearance) {
        const { theme: savedTheme, compactMode: savedCompact } = response.data.settings.appearance;
        setTheme(savedTheme || 'light');
        setCompactMode(savedCompact || false);
        applyTheme(savedTheme || 'light', savedCompact || false);
      }
    } catch (error) {
      console.error('Failed to fetch theme settings:', error);
      // Fall back to localStorage
      const savedTheme = localStorage.getItem('admin-theme') || 'light';
      const savedCompact = localStorage.getItem('admin-compact') === 'true';
      setTheme(savedTheme);
      setCompactMode(savedCompact);
      applyTheme(savedTheme, savedCompact);
    } finally {
      setLoading(false);
    }
  }, [applyTheme]);

  // Initialize on mount
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      applyTheme('system', compactMode);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, compactMode, applyTheme]);

  // Update theme
  const updateTheme = useCallback(async (newTheme) => {
    setTheme(newTheme);
    applyTheme(newTheme, compactMode);

    // Save to backend
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await axios.put(
          `${backendurl}/api/admin/settings`,
          { appearance: { theme: newTheme, compactMode } },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  }, [compactMode, applyTheme]);

  // Update compact mode
  const updateCompactMode = useCallback(async (compact) => {
    setCompactMode(compact);
    applyTheme(theme, compact);

    // Save to backend
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await axios.put(
          `${backendurl}/api/admin/settings`,
          { appearance: { theme, compactMode: compact } },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (error) {
      console.error('Failed to save compact mode:', error);
    }
  }, [theme, applyTheme]);

  // Refresh settings (called after Settings page saves)
  const refreshSettings = useCallback(() => {
    fetchSettings();
  }, [fetchSettings]);

  const value = {
    theme,
    compactMode,
    resolvedTheme,
    loading,
    updateTheme,
    updateCompactMode,
    refreshSettings,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
