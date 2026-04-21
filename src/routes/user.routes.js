const express = require("express");
const router = express.Router();

// middleware
const { authenticateJwt } = require("../middleware/authenticateJwt");
const { authorizeJwt } = require("../middleware/authorizeJwt");
const { validateUserInDatabase } = require("../middleware/validateUserInDatabase");

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
} = require("../controllers/user.controller");

const { createFeedback } = require("../controllers/feedback.controller");

/**
 * ROUTE RULES:
 * - Any request that needs "who is calling?" should use:
 *   authenticateJwt -> validateUserInDatabase
 *
 * - Any route that uses ":id" should also use authorizeJwt,
 *   so users can't modify others unless admin.
 */

// PUBLIC-ish (your choice): view other user's public profile
// If you want this private, add authenticateJwt + validateUserInDatabase
router.get("/other-users/:id", getUserDocument);

// ✅ Best practice: "me" route (no :id needed)
router.get(
  "/me",
  authenticateJwt,
  validateUserInDatabase,
  getMyUserDocument
);

// ✅ Update my user (safer than PATCH /:id)
router.patch(
  "/me",
  authenticateJwt,
  validateUserInDatabase,
  updateUserDocument
);

// ✅ Update profile picture (me)
router.patch(
  "/me/profile-picture",
  authenticateJwt,
  validateUserInDatabase,
  updateAuth0UserProfilePicture
);

// ✅ Setup status (me)
router.get(
  "/me/status",
  authenticateJwt,
  validateUserInDatabase,
  getUserSetUpStatus
);

// ✅ Retake steps (me)
router.post(
  "/me/progress/retake",
  authenticateJwt,
  validateUserInDatabase,
  retakeSteps
);

// ✅ Settings (me)
router.patch(
  "/me/settings/notifications/website",
  authenticateJwt,
  validateUserInDatabase,
  updateWebsiteNotificationSettings
);

router.patch(
  "/me/settings/sounds/website",
  authenticateJwt,
  validateUserInDatabase,
  updateAudioNotificationSettings
);

// ✅ Feedback: must be logged in to submit feedback
router.post(
  "/feedback/:userId",
  authenticateJwt,
  validateUserInDatabase,
  createFeedback
);

/**
 * OPTIONAL: if you still want admin or "self" access routes by id:
 * Only keep these if you actually need them.
 */
router.patch(
  "/:id",
  authenticateJwt,
  validateUserInDatabase,
  authorizeJwt({ allowSelf: true, allowRoles: ["admin"] }),
  updateUserDocument
);

router.get(
  "/:id/status",
  authenticateJwt,
  validateUserInDatabase,
  authorizeJwt({ allowSelf: true, allowRoles: ["admin"] }),
  getUserSetUpStatus
);

module.exports = router;