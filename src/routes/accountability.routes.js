const router = require("express").Router();
const controller = require("../controllers/accountability.controller");

router.get("/", controller.getAllAccountability);

router.post("/habits", controller.createHabit);
router.post("/goals", controller.createGoal);

router.put("/:id", controller.updateAccountabilityItem);
router.delete("/:id", controller.deleteAccountabilityItem);

router.post("/:id/toggle-daily", controller.toggleDailyHabitCompletion);
router.post("/:id/toggle-goal", controller.toggleGoalCompletion);

module.exports = router;