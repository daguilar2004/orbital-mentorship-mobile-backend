const express = require('express')
const router = express.Router()

// middleware
const { authenticateJwt } = require('../middleware/authenticateJwt')
const { authorizeJwt } = require('../middleware/authorizeJwt')
const { validateUserInDatabase } = require('../middleware/validateUserInDatabase')

// controller functions
const {
    getUserDocument,
    getMyUserDocument,
    retakeSteps,
    updateUserDocument,
    getUserSetUpStatus,
    updateAudioNotificationSettings,
    updateWebsiteNotificationSettings,
    updateAuth0UserProfilePicture
} = require('../controllers/user.controller')

const {
    createFeedback
} = require('../controllers/feedback.controller')

// apply router-level middleware

// endpoints
// this routing is probably not the best, fix later
router.get('/other-users/:id', getUserDocument)
router.get('/my-user', authenticateJwt, getMyUserDocument)   // sub optimal route but wtv
router.patch('/:id', authenticateJwt, updateUserDocument)
router.patch('/:id/profile-picture', authenticateJwt, updateAuth0UserProfilePicture)
router.get('/:id/status', authenticateJwt, getUserSetUpStatus)
router.delete('/:id')

router.post('/:id/progress/retake', authenticateJwt, retakeSteps) // retake the progress survey

// TODO: Implement these sub resource endpoints for user document
// settings
router.patch('/:id/settings/notifications/website', authenticateJwt, updateWebsiteNotificationSettings) // I only denote website since any future mobile app will have these settings different
router.patch('/:id/settings/password', authenticateJwt)
router.patch('/:id/settings/sounds/website', authenticateJwt, updateAudioNotificationSettings)

// feedback
router.post('/feedback/:userId', createFeedback);

module.exports = router