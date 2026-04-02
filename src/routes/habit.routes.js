const express = require("express");
const router = express.Router();

const {
  getHabits,
  getHabitById,
  createHabit,
  updateHabit,
  toggleHabitCompletion,
  deleteHabit,
} = require("../controllers/habit.controller");

const authenticateJwt = require("../middleware/authenticateJwt");

router.get("/", authenticateJwt, getHabits);
router.get("/:id", authenticateJwt, getHabitById);
router.post("/", authenticateJwt, createHabit);
router.put("/:id", authenticateJwt, updateHabit);
router.patch("/:id/toggle", authenticateJwt, toggleHabitCompletion);
router.delete("/:id", authenticateJwt, deleteHabit);

module.exports = router;