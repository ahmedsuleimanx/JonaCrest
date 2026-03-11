import User from '../models/userModel.js';

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get public profile by ID
export const getPublicProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('name role image bio city country createdAt companyName agencyName licenseNumber email phone address'); 
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // For privacy, maybe mask email/phone for regular tenants unless viewed by admin?
    // For now, assume Agents/Landlords want to be contacted.
    // If role is tenant, maybe hide full contact details.
    
    res.json({ success: true, user });
  } catch (error) {
    console.error('Error fetching public profile:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
};

// Update user profile (only allowed fields)
export const updateProfile = async (req, res) => {
  try {
    const allowedFields = ['name', 'bio', 'address', 'city', 'country', 'companyName', 'agencyName', 'licenseNumber'];
    const updates = {};
    
    // Only allow whitelisted fields to be updated
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
};

// Upload profile image
export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image provided' });
    }

    // Assuming file is uploaded via multer and stored somewhere (cloudinary, local, etc.)
    // For now, we'll assume the image URL is available
    const imageUrl = req.file.path || req.file.location || `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { image: imageUrl } },
      { new: true }
    ).select('-password');

    res.json({ success: true, imageUrl: user.image, message: 'Image uploaded successfully' });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ success: false, message: 'Failed to upload image' });
  }
};
