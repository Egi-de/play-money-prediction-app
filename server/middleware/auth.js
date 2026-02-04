const User = require("../models/User");
const requireAdmin = async (req, res, next) => {
  try {
    // Safely access userId from body or query
    const userId =
      (req.body && req.body.userId) || (req.query && req.query.userId);

    if (!userId) {
      return res
        .status(401)
        .json({ error: "Authentication required. Please provide userId." });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.isAdmin) {
      return res
        .status(403)
        .json({ error: "Forbidden. Admin privileges required." });
    }

    req.adminUser = user;
    next();
  } catch (err) {
    console.error("[Auth Middleware] Error:", err);
    res.status(500).json({ error: "Authentication error: " + err.message });
  }
};

module.exports = { requireAdmin };
