// Mock authorization middleware for development
// TODO: Replace with real authorization when login is implemented

const authorizeJwt = (req, res, next) => {
  // For development, just pass through without authorization
  // In production, this would check user roles/permissions
  next();
};

module.exports = authorizeJwt;