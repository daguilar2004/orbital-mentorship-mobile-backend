// Mock authentication middleware for development
// TODO: Replace with real JWT authentication when login is implemented

const authenticateJwt = (req, res, next) => {
  // For development, just pass through without authentication
  // In production, this would verify JWT tokens
  req.user = {
    id: "mock-user-id",
  };
  next();
};

module.exports = authenticateJwt;