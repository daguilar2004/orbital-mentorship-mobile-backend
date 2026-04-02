const express = require("express");
const router = express.Router();

const {
  getGoals,
  getGoalById,
  createGoal,
  updateGoal,
  toggleGoalComplete,
  deleteGoal,
} = require("../controllers/goal.controller");

const authenticateJwt = require("../middleware/authenticateJwt");

router.get("/", authenticateJwt, getGoals);
router.get("/:id", authenticateJwt, getGoalById);
router.post("/", authenticateJwt, createGoal);
router.put("/:id", authenticateJwt, updateGoal);
router.patch("/:id/toggle-complete", authenticateJwt, toggleGoalComplete);
router.delete("/:id", authenticateJwt, deleteGoal);

module.exports = router;