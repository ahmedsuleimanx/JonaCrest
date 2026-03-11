import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon, User, Bell, Lock, Globe, Palette,
  Mail, Shield, Database, Save, Eye, EyeOff, Check, AlertCircle,
  Upload, Camera, Loader, Sun, Moon, Monitor
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { backendurl } from '../config/constants';
import { useTheme } from '../contexts/ThemeContext';

const Settings = () => {
  const { theme: currentTheme, compactMode: currentCompact, updateTheme, updateCompactMode } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  const [settings, setSettings] = useState({
    profile: {
      name: 'Administrator',
      email: 'admin@jonacrest.com',
      phone: '+233 XX XXX XXXX',
      avatar: ''
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      newUserAlerts: true,
      propertyAlerts: true,
      appointmentReminders: true,
      weeklyReports: false
    },
    security: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      twoFactorAuth: false,
      sessionTimeout: '30'
    },
    appearance: {
      theme: 'light',
      sidebarCollapsed: false,
      compactMode: false
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${backendurl}/api/admin/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        const fetchedSettings = response.data.settings;
        setSettings(prev => ({
          ...prev,
          ...fetchedSettings,
          security: {
            ...prev.security,
            ...fetchedSettings.security
          }
        }));
        // Sync theme context with fetched appearance settings
        if (fetchedSettings.appearance) {
          if (fetchedSettings.appearance.theme && fetchedSettings.appearance.theme !== currentTheme) {
            updateTheme(fetchedSettings.appearance.theme);
          }
          if (fetchedSettings.appearance.compactMode !== currentCompact) {
            updateCompactMode(fetchedSettings.appearance.compactMode || false);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${backendurl}/api/admin/settings`,
        settings,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        toast.success('Settings saved successfully');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${backendurl}/api/admin/settings/avatar`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        updateSettings('profile', 'avatar', response.data.avatarUrl);
        toast.success('Avatar updated successfully');
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
              <div className="flex items-start gap-6 mb-6">
                <div className="relative">
                  {settings.profile.avatar ? (
                    <img
                      src={settings.profile.avatar}
                      alt="Admin Avatar"
                      className="w-24 h-24 rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold">
                      {settings.profile.name?.charAt(0)?.toUpperCase() || 'A'}
                    </div>
                  )}
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                      <Loader className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarUpload}
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    <Camera className="w-4 h-4" />
                    {uploadingAvatar ? 'Uploading...' : 'Change Avatar'}
                  </button>
                  <p className="text-sm text-gray-500 mt-2">JPG, PNG, GIF or WebP. Max 2MB</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={settings.profile.name}
                    onChange={(e) => updateSettings('profile', 'name', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={settings.profile.email}
                    onChange={(e) => updateSettings('profile', 'email', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={settings.profile.phone}
                    onChange={(e) => updateSettings('profile', 'phone', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
            
            <div className="space-y-4">
              {[
                { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive notifications via email' },
                { key: 'pushNotifications', label: 'Push Notifications', desc: 'Browser push notifications' },
                { key: 'newUserAlerts', label: 'New User Alerts', desc: 'Get notified when new users register' },
                { key: 'propertyAlerts', label: 'Property Alerts', desc: 'Notifications for new property listings' },
                { key: 'appointmentReminders', label: 'Appointment Reminders', desc: 'Reminders for upcoming appointments' },
                { key: 'weeklyReports', label: 'Weekly Reports', desc: 'Receive weekly analytics report' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900">{label}</p>
                    <p className="text-sm text-gray-500">{desc}</p>
                  </div>
                  <button
                    onClick={() => updateSettings('notifications', key, !settings.notifications[key])}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      settings.notifications[key] ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        settings.notifications[key] ? 'right-1' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
            
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800">Password Requirements</p>
                  <p className="text-sm text-amber-600">
                    Password must be at least 8 characters with uppercase, lowercase, and numbers
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={settings.security.currentPassword}
                    onChange={(e) => updateSettings('security', 'currentPassword', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <input
                    type="password"
                    value={settings.security.newPassword}
                    onChange={(e) => updateSettings('security', 'newPassword', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={settings.security.confirmPassword}
                    onChange={(e) => updateSettings('security', 'confirmPassword', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-500">Add an extra layer of security</p>
                  </div>
                  <button
                    onClick={() => updateSettings('security', 'twoFactorAuth', !settings.security.twoFactorAuth)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      settings.security.twoFactorAuth ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        settings.security.twoFactorAuth ? 'right-1' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'appearance':
        const themeOptions = [
          { id: 'light', label: 'Light', icon: Sun, preview: 'bg-gray-100' },
          { id: 'dark', label: 'Dark', icon: Moon, preview: 'bg-gray-800' },
          { id: 'system', label: 'System', icon: Monitor, preview: 'bg-gradient-to-r from-gray-100 to-gray-800' }
        ];

        const handleThemeChange = (theme) => {
          updateSettings('appearance', 'theme', theme);
          updateTheme(theme); // Apply immediately via context
        };

        const handleCompactChange = () => {
          const newValue = !settings.appearance.compactMode;
          updateSettings('appearance', 'compactMode', newValue);
          updateCompactMode(newValue); // Apply immediately via context
        };

        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Appearance Settings</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
              <div className="grid grid-cols-3 gap-4">
                {themeOptions.map(({ id, label, icon: Icon, preview }) => (
                  <button
                    key={id}
                    onClick={() => handleThemeChange(id)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      currentTheme === id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className={`w-full h-16 rounded-lg mb-3 flex items-center justify-center ${preview}`}>
                      <Icon className={`w-8 h-8 ${id === 'dark' ? 'text-gray-300' : 'text-gray-600'}`} />
                    </div>
                    <p className="text-sm font-medium capitalize">{label}</p>
                    {currentTheme === id && (
                      <div className="flex items-center justify-center mt-2">
                        <Check className="w-4 h-4 text-blue-500" />
                        <span className="text-xs text-blue-500 ml-1">Active</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div>
                  <p className="font-medium text-gray-900">Compact Mode</p>
                  <p className="text-sm text-gray-500">Reduce spacing and padding throughout the interface</p>
                </div>
                <button
                  onClick={handleCompactChange}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    currentCompact ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      currentCompact ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>
              
              {currentCompact && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Compact mode is enabled. Interface spacing has been reduced.
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account and preferences</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className="glass-card p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            {renderContent()}

            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
