const User = require('../models/User');

/**
 * Middleware to require admin privileges
 * Expects userId in request body or query
 */
const requireAdmin = async (req, res, next) => {
  try {
    // Get userId from body or query
    const userId = req.body.userId || req.query.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required. Please provide userId.' });
    }

    // Check if user exists and is admin
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.isAdmin) {
      return res.status(403).json({ error: 'Forbidden. Admin privileges required.' });
    }

    // Attach user to request for use in route handlers
    req.adminUser = user;
    next();
  } catch (err) {
    res.status(500).json({ error: 'Authentication error: ' + err.message });
  }
};

module.exports = { requireAdmin };
