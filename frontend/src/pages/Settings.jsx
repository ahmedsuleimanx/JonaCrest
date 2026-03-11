import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Sun, Moon, Bell, Mail, Lock, Eye, EyeOff, 
  Save, User, Building, Shield, Palette, 
  Globe, BellRing, MessageSquare, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Backendurl } from '../App';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardFooter from '../components/dashboard/DashboardFooter';

const Settings = () => {
  const { user, loading: authLoading } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const [activeSection, setActiveSection] = useState('appearance');
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    viewingReminders: true,
    priceAlerts: true,
    newListingAlerts: true,
    messageNotifications: true
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const userRole = user?.role || 'tenant';

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${Backendurl}/api/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setSettings(prev => ({ ...prev, ...response.data.settings }));
      }
    } catch (error) {
      // Settings endpoint may not exist yet, use defaults
      console.log('Using default settings');
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${Backendurl}/api/settings`, settings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${Backendurl}/api/auth/change-password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'privacy', label: 'Privacy', icon: Shield }
  ];

  // Role-specific sections
  if (userRole === 'landlord') {
    sections.push({ id: 'property', label: 'Property Defaults', icon: Building });
  } else if (userRole === 'agent') {
    sections.push({ id: 'agent', label: 'Agent Settings', icon: User });
  } else if (userRole === 'admin') {
    sections.push({ id: 'system', label: 'System Settings', icon: Globe });
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <DashboardHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </main>
        <DashboardFooter />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <DashboardHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Please Log In</h2>
            <p className="text-gray-500 dark:text-gray-400">You need to be logged in to access settings.</p>
          </div>
        </main>
        <DashboardFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-300">
      <DashboardHeader />
      
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your account preferences and settings</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                    activeSection === section.id
                      ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <section.icon className="w-5 h-5" />
                  <span className="font-medium">{section.label}</span>
                  <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${
                    activeSection === section.id ? 'rotate-90' : ''
                  }`} />
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
            >
              {/* Appearance Section */}
              {activeSection === 'appearance' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Appearance</h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <div className="flex items-center gap-4">
                        {isDark ? <Moon className="w-6 h-6 text-indigo-500" /> : <Sun className="w-6 h-6 text-amber-500" />}
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">Theme</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Currently using {isDark ? 'dark' : 'light'} mode
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={toggleTheme}
                        className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                          isDark ? 'bg-indigo-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform ${
                            isDark ? 'translate-x-9' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => toggleTheme()}
                        className={`p-6 rounded-xl border-2 transition-all ${
                          !isDark 
                            ? 'border-emerald-500 bg-white shadow-lg' 
                            : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'
                        }`}
                      >
                        <Sun className={`w-8 h-8 mx-auto mb-3 ${!isDark ? 'text-amber-500' : 'text-gray-400'}`} />
                        <p className={`font-medium ${!isDark ? 'text-gray-900' : 'text-gray-500 dark:text-gray-400'}`}>Light Mode</p>
                      </button>
                      <button
                        onClick={() => toggleTheme()}
                        className={`p-6 rounded-xl border-2 transition-all ${
                          isDark 
                            ? 'border-emerald-500 bg-gray-800 shadow-lg' 
                            : 'border-gray-200 bg-gray-900'
                        }`}
                      >
                        <Moon className={`w-8 h-8 mx-auto mb-3 ${isDark ? 'text-indigo-400' : 'text-gray-600'}`} />
                        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-400'}`}>Dark Mode</p>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Section */}
              {activeSection === 'notifications' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Notifications</h2>
                  
                  <div className="space-y-4">
                    {[
                      { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates via email', icon: Mail },
                      { key: 'pushNotifications', label: 'Push Notifications', desc: 'Get instant notifications', icon: BellRing },
                      { key: 'viewingReminders', label: 'Viewing Reminders', desc: 'Reminders for scheduled viewings', icon: Bell },
                      { key: 'priceAlerts', label: 'Price Alerts', desc: 'Notifications when prices change', icon: Bell },
                      { key: 'newListingAlerts', label: 'New Listing Alerts', desc: 'Be notified of new properties', icon: Building },
                      { key: 'messageNotifications', label: 'Message Notifications', desc: 'Get notified of new messages', icon: MessageSquare }
                    ].map(item => (
                      <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <div className="flex items-center gap-4">
                          <item.icon className="w-5 h-5 text-gray-400" />
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">{item.label}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setSettings(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            settings[item.key] ? 'bg-emerald-600' : 'bg-gray-200 dark:bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                              settings[item.key] ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={saveSettings}
                    disabled={loading}
                    className="mt-6 flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              )}

              {/* Security Section */}
              {activeSection === 'security' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Security</h2>
                  
                  <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        >
                          {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        >
                          {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="Confirm new password"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                    >
                      <Lock className="w-4 h-4" />
                      {loading ? 'Changing...' : 'Change Password'}
                    </button>
                  </form>
                </div>
              )}

              {/* Privacy Section */}
              {activeSection === 'privacy' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Privacy</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">Marketing Emails</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Receive promotional emails and offers</p>
                      </div>
                      <button
                        onClick={() => setSettings(prev => ({ ...prev, marketingEmails: !prev.marketingEmails }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.marketingEmails ? 'bg-emerald-600' : 'bg-gray-200 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                            settings.marketingEmails ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                      <h3 className="font-medium text-yellow-800 dark:text-yellow-200">Data Privacy</h3>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                        Your personal data is protected and handled according to our privacy policy. 
                        Contact support for data export or deletion requests.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={saveSettings}
                    disabled={loading}
                    className="mt-6 flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              )}

              {/* Role-specific sections */}
              {activeSection === 'property' && userRole === 'landlord' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Property Defaults</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Configure default settings for your property listings.
                  </p>
                  {/* Add landlord-specific settings here */}
                </div>
              )}

              {activeSection === 'agent' && userRole === 'agent' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Agent Settings</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Configure your agent profile and lead management preferences.
                  </p>
                  {/* Add agent-specific settings here */}
                </div>
              )}

              {activeSection === 'system' && userRole === 'admin' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">System Settings</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Configure system-wide settings and preferences.
                  </p>
                  {/* Add admin-specific settings here */}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>

      <DashboardFooter />
    </div>
  );
};

export default Settings;
