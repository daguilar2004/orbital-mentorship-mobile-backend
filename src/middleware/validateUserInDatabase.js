// Mock user validation middleware for development
// TODO: Replace with real user validation when login is implemented

const validateUserInDatabase = (req, res, next) => {
  // For development, just pass through without validation
  // In production, this would check if user exists in database
  next();
};

module.exports = {
  validateUserInDatabase,
};