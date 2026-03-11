import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['admin', 'system'],
    default: 'admin',
    unique: true
  },
  profile: {
    name: { type: String, default: 'Administrator' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    avatar: { type: String, default: '' }
  },
  notifications: {
    emailNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true },
    newUserAlerts: { type: Boolean, default: true },
    propertyAlerts: { type: Boolean, default: true },
    appointmentReminders: { type: Boolean, default: true },
    weeklyReports: { type: Boolean, default: false }
  },
  security: {
    twoFactorAuth: { type: Boolean, default: false },
    sessionTimeout: { type: String, default: '30' }
  },
  appearance: {
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'light' },
    sidebarCollapsed: { type: Boolean, default: false },
    compactMode: { type: Boolean, default: false }
  }
}, { timestamps: true });

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
