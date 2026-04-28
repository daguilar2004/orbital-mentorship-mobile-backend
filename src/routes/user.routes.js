const express = require('express');
const router = express.Router();

// middleware
const authenticateJwt = require('../middleware/authenticateJwt');
const authorizeJwt = require('../middleware/authorizeJwt');
const { validateUserInDatabase } = require('../middleware/validateUserInDatabase');

// controller functions
const {
  getUserDocument,
  getMyUserDocument,
  retakeSteps,
  updateUserDocument,
  getUserSetUpStatus,
  updateAudioNotificationSettings,
  updateWebsiteNotificationSettings,
  updateAuth0UserProfilePicture,
} = require('../controllers/user.controller');

const {
  createFeedback,
} = require('../controllers/feedback.controller');

// endpoints
router.get('/other-users/:id', getUserDocument);
router.get('/my-user', authenticateJwt, getMyUserDocument);
router.patch('/:id', authenticateJwt, updateUserDocument);
router.patch('/:id/profile-picture', authenticateJwt, updateAuth0UserProfilePicture);
router.get('/:id/status', authenticateJwt, getUserSetUpStatus);
router.delete('/:id');

router.post('/:id/progress/retake', authenticateJwt, retakeSteps);

router.patch('/:id/settings/notifications/website', authenticateJwt, updateWebsiteNotificationSettings);
router.patch('/:id/settings/password', authenticateJwt);
router.patch('/:id/settings/sounds/website', authenticateJwt, updateAudioNotificationSettings);

// feedback
router.post('/feedback/:userId', createFeedback);

module.exports = router;