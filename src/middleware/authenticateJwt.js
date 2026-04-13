// Mock authentication middleware for development
// TODO: Replace with real JWT authentication when login is implemented

const authenticateJwt = (req, res, next) => {
  // For development, just pass through without authentication
  // In production, this would verify JWT tokens
  req.user = {
    id: "507f1f77bcf86cd799439011",
  };
  next();
};

module.exports = authenticateJwt;
