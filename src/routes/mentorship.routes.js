const router = require("express").Router();
const { validateObjectIdParam } = require("../middleware/validateObjectId.middleware");
const task = require("../controllers/task.controller");

router.get("/:id", validateObjectIdParam("id"), task.getTaskById);

// mentor edits description
router.patch("/:id/description", validateObjectIdParam("id"), task.updateDescription);

// general update task
router.patch("/:id", validateObjectIdParam("id"), task.updateTask);

// mentee submits/resubmits
router.post("/:id/submit", validateObjectIdParam("id"), task.submitTask);

// mentor review approve/reject
router.post("/:id/review", validateObjectIdParam("id"), task.reviewTask);

// toggle favorite
router.patch("/:id/toggle-favorite", validateObjectIdParam("id"), task.toggleFavorite);

// get favorite tasks
router.get("/:mentorshipId/favorites", validateObjectIdParam("mentorshipId"), task.getFavoriteTasks);

module.exports = router;