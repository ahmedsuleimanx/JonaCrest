import Settings from '../models/settingsModel.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Default admin settings
const defaultAdminSettings = {
  profile: {
    name: 'Administrator',
    email: process.env.ADMIN_EMAIL || 'admin@jonacrest.com',
    phone: ''
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
    twoFactorAuth: false,
    sessionTimeout: '30'
  },
  appearance: {
    theme: 'light',
    sidebarCollapsed: false,
    compactMode: false
  }
};

// Get admin settings
export const getAdminSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ type: 'admin' });
    
    if (!settings) {
      // Create default settings if none exist
      settings = new Settings({
        type: 'admin',
        ...defaultAdminSettings
      });
      await settings.save();
    }

    res.json({
      success: true,
      settings: {
        profile: settings.profile || defaultAdminSettings.profile,
        notifications: settings.notifications || defaultAdminSettings.notifications,
        security: settings.security || defaultAdminSettings.security,
        appearance: settings.appearance || defaultAdminSettings.appearance
      }
    });
  } catch (error) {
    console.error('Get admin settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings'
    });
  }
};

// Update admin settings
export const updateAdminSettings = async (req, res) => {
  try {
    const { profile, notifications, security, appearance } = req.body;

    let settings = await Settings.findOne({ type: 'admin' });
    
    if (!settings) {
      settings = new Settings({ type: 'admin' });
    }

    // Update only provided sections
    if (profile) {
      settings.profile = { ...settings.profile, ...profile };
    }
    if (notifications) {
      settings.notifications = { ...settings.notifications, ...notifications };
    }
    if (security) {
      // Don't store passwords in settings
      const { currentPassword, newPassword, confirmPassword, ...securitySettings } = security;
      settings.security = { ...settings.security, ...securitySettings };
    }
    if (appearance) {
      settings.appearance = { ...settings.appearance, ...appearance };
    }

    await settings.save();

    res.json({
      success: true,
      message: 'Settings updated successfully',
      settings: {
        profile: settings.profile,
        notifications: settings.notifications,
        security: settings.security,
        appearance: settings.appearance
      }
    });
  } catch (error) {
    console.error('Update admin settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings'
    });
  }
};

// Update admin password
export const updateAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // For now, admin password is managed via environment variables
    // This is a placeholder for future implementation
    res.json({
      success: true,
      message: 'Password update functionality coming soon'
    });
  } catch (error) {
    console.error('Update admin password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update password'
    });
  }
};

// Upload admin avatar
export const uploadAdminAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Upload to cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'admin_avatars',
      transformation: [
        { width: 200, height: 200, crop: 'fill', gravity: 'face' }
      ]
    });

    // Delete local file after upload
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Error deleting temp file:', err);
    });

    // Update settings with new avatar URL
    let settings = await Settings.findOne({ type: 'admin' });
    if (!settings) {
      settings = new Settings({ type: 'admin' });
    }

    settings.profile = {
      ...settings.profile,
      avatar: result.secure_url
    };
    await settings.save();

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      avatarUrl: result.secure_url
    });
  } catch (error) {
    console.error('Upload admin avatar error:', error);
    // Clean up temp file if it exists
    if (req.file?.path) {
      fs.unlink(req.file.path, () => {});
    }
    res.status(500).json({
      success: false,
      message: 'Failed to upload avatar'
    });
  }
};

export default {
  getAdminSettings,
  updateAdminSettings,
  updateAdminPassword,
  uploadAdminAvatar
};
