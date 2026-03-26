const express = require('express')
const router = express.Router()

// middleware
const { authenticateJwt } = require('../middleware/authenticateJwt')
const { authorizeJwt } = require('../middleware/authorizeJwt')

// controller functions
const {
    getMenteeProfile,
    getMenteeXp,
    getQuestionnaireAnswers,
    matchMenteeWithMentors,
    editMenteeProfile,
    updateMenteeQuestionnaire,
    deleteMenteeProfile,
} = require('../controllers/mentee.controller')

// endpoints
router.get('/:id', authenticateJwt, getMenteeProfile);
router.get('/:id/questionnaire', authenticateJwt, getQuestionnaireAnswers);
router.get('/:id/xp', authenticateJwt, getMenteeXp);
router.post('/');
router.delete('/:id', authenticateJwt, deleteMenteeProfile);
router.patch('/:id/profile', authenticateJwt, editMenteeProfile);
router.patch('/:id/questionnaire', authenticateJwt, updateMenteeQuestionnaire);
router.post('/:id/match', authenticateJwt, matchMenteeWithMentors);

module.exports = router