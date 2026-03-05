const router = require("express").Router();
const { validateObjectIdParam } = require("../middleware/validateObjectId.middleware");
const task = require("../controllers/task.controller");

router.get("/:id", validateObjectIdParam("id"), task.getTaskById);

// mentor edits description
router.patch("/:id/description", validateObjectIdParam("id"), task.updateDescription);

// mentee submits/resubmits
router.post("/:id/submit", validateObjectIdParam("id"), task.submitTask);

// mentor review approve/reject
router.post("/:id/review", validateObjectIdParam("id"), task.reviewTask);

module.exports = router;