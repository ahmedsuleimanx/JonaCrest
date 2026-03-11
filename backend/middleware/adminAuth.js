import jwt from 'jsonwebtoken';

/**
 * Admin Auth Middleware
 * Verifies admin JWT token for protected routes
 */
const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Admin authorization required' 
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if it's an admin token (has email instead of id)
    if (!decoded.email || decoded.email !== process.env.ADMIN_EMAIL) {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin access denied' 
      });
    }
    
    req.admin = decoded;
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired admin token' 
    });
  }
};

export default adminAuth;
