const router = require("express").Router();
const taskController = require("../controllers/task.controller");

// CREATE
router.post("/", taskController.createTask);

// GET ALL TASKS
router.get("/", async (req, res, next) => {
  try {
    const Task = require("../models/task.model");
    const tasks = await Task.find();
    res.json(tasks);
  } catch (e) {
    next(e);
  }
});

// GET BY ID
router.get("/:id", taskController.getTaskById);

// BY PHASE
router.get("/phase/:phaseId", async (req, res, next) => {
  try {
    const Task = require("../models/task.model");
    const tasks = await Task.find({ phaseId: req.params.phaseId });
    res.json(tasks);
  } catch (e) {
    next(e);
  }
});

// UPDATE DESCRIPTION
router.patch("/:id/description", taskController.updateDescription);

// SUBMIT
router.post("/:id/submit", taskController.submitTask);

// REVIEW
router.post("/:id/review", taskController.reviewTask);

module.exports = router;