const Mentorship = require("../models/mentorship.model");
const Task = require("../models/task.model");

// Get mentorship
exports.getMentorship = async (req, res, next) => {
  try {
    const m = await Mentorship.findById(req.params.id);
    if (!m) return res.status(404).json({ error: "Mentorship not found" });
    res.json(m);
  } catch (e) {
    next(e);
  }
};

// Get tasks for mentorship
exports.getMentorshipTasks = async (req, res, next) => {
  try {
    const mentorshipId = req.params.id;
    const tasks = await Task.find({ mentorshipId }).sort({ phaseOrder: 1, dueDate: 1 });
    res.json(tasks);
  } catch (e) {
    next(e);
  }
};