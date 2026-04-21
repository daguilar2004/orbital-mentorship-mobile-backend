const router = require("express").Router();

const checkJwt = require("../middleware/auth.middleware");
const loadUser = require("../middleware/loadUser.middleware");
const requireRole = require("../middleware/role.middleware");

const task = require("../controllers/task.controller");

router.get("/:id",
  checkJwt,
  loadUser,
  task.getTaskById
);

router.post("/:id/submit",
  checkJwt,
  loadUser,
  requireRole("mentee"),
  task.submitTask
);

router.post("/:id/review",
  checkJwt,
  loadUser,
  requireRole("mentor"),
  task.reviewTask
);

module.exports = router;