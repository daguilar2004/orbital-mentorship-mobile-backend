const express = require('express');
const router = express.Router();

// middleware
const authenticateJwt = require('../middleware/authenticateJwt');
const authorizeJwt = require('../middleware/authorizeJwt');

// controller functions
const {
  getMentorProfile,
  getAllMentors,
  editMentorProfile,
  updateMentorQuestionnaire,
  deleteMentorProfile,
} = require('../controllers/mentor.controller');

// endpoints
router.get('/:id', authenticateJwt, getMentorProfile);
router.get('/', authenticateJwt, getAllMentors);
router.patch('/:id/profile', authenticateJwt, editMentorProfile);
router.patch('/:id', authenticateJwt, updateMentorQuestionnaire);
router.delete('/:id', authenticateJwt, deleteMentorProfile);

module.exports = router;