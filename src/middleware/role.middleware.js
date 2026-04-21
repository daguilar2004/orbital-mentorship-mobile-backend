module.exports = function requireRole(role) {
  return function (req, res, next) {
    if (!req.user) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (req.user.role !== role) {
      return res.status(403).json({ error: "Forbidden: wrong role" });
    }

    next();
  };
};