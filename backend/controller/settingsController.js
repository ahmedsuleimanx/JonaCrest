import User from '../models/userModel.js';

// Get user settings
export const getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('settings');
    
    // Return default settings if user has none
    const defaultSettings = {
      emailNotifications: true,
      pushNotifications: true,
      marketingEmails: false,
      viewingReminders: true,
      priceAlerts: true,
      newListingAlerts: true,
      messageNotifications: true
    };

    const settings = user?.settings || defaultSettings;
    res.json({ success: true, settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update user settings
export const updateSettings = async (req, res) => {
  try {
    const allowedSettings = [
      'emailNotifications',
      'pushNotifications', 
      'marketingEmails',
      'viewingReminders',
      'priceAlerts',
      'newListingAlerts',
      'messageNotifications',
      'theme'
    ];

    const updates = {};
    for (const key of allowedSettings) {
      if (req.body[key] !== undefined) {
        updates[`settings.${key}`] = req.body[key];
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true }
    ).select('settings');

    res.json({ success: true, settings: user.settings, message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ success: false, message: 'Failed to update settings' });
  }
};
