import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/Usermodel.js';

/**
 * Google OAuth Controller
 * PRD Section 7.1 - Google Authentication
 */

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Verify Google ID token and create/login user
 */
export const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ 
        success: false, 
        message: 'Google credential required' 
      });
    }

    // Verify the Google ID token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email not provided by Google' 
      });
    }

    // Check if user exists
    let user = await User.findOne({ email });

    if (user) {
      // Update profile image if not set
      if (!user.profileImage && picture) {
        user.profileImage = picture;
        await user.save();
      }
    } else {
      // Create new user from Google data
      user = new User({
        name,
        email,
        password: `google_${googleId}_${Date.now()}`, // Placeholder password
        profileImage: picture,
        role: 'tenant', // Default role
      });
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
      message: user.isNew ? 'Account created successfully' : 'Login successful',
    });

  } catch (error) {
    console.error('Google auth error:', error);
    
    if (error.message?.includes('Token used too late')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Google token expired. Please try again.' 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Google authentication failed' 
    });
  }
};

export default { googleAuth };
