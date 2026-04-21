const Task = require("../models/task.model");
const Phase = require("../models/phase.model");

exports.createTask = async (req, res, next) => {
  try {
    const { phaseId, title, dueDate, description, xp } = req.body;

    const task = await Task.create({
  phaseId,
  title,
  dueDate,
  description,
  xp
});


    res.status(201).json(task);
  } catch (e) {
    next(e);
  }
};



exports.getTaskById = async (req, res, next) => {
  try {
    const t = await Task.findById(req.params.id);
    if (!t) return res.status(404).json({ error: "Task not found" });
    res.json(t);
  } catch (e) {
    next(e);
  }
};

// Mentor can edit task description
exports.updateDescription = async (req, res, next) => {
  try {
    const { description } = req.body;
    const t = await Task.findByIdAndUpdate(
      req.params.id,
      { description: description ?? "" },
      { new: true }
    );
    if (!t) return res.status(404).json({ error: "Task not found" });
    res.json(t);
  } catch (e) {
    next(e);
  }
};

// Mentee submits/resubmits a task
exports.submitTask = async (req, res, next) => {
  try {
    const { submissionText, submissionFiles } = req.body;

    const t = await Task.findById(req.params.id);
    if (!t) return res.status(404).json({ error: "Task not found" });

    // ✅ Critical fix: allow resubmission after rejection
    t.status = "submitted";
    t.submissionText = submissionText ?? "";
    if (Array.isArray(submissionFiles)) t.submissionFiles = submissionFiles;

    t.submittedAt = new Date();

    // Optional: keep feedback, but clear reviewedAt so it can be re-reviewed cleanly
    t.reviewedAt = undefined;

    await t.save();
    res.json(t);
  } catch (e) {
    next(e);
  }
};

// Mentor approves/rejects + feedback
exports.reviewTask = async (req, res, next) => {
  try {
    const { decision, mentorFeedback } = req.body; // decision: "approved" | "rejected"

    if (!["approved", "rejected"].includes(decision)) {
      return res.status(400).json({ error: "decision must be approved or rejected" });
    }

    const t = await Task.findById(req.params.id);
    if (!t) return res.status(404).json({ error: "Task not found" });

    // ✅ Allow approval even if previously rejected (as long as it exists)
    t.status = decision;
    t.mentorFeedback = mentorFeedback ?? "";
    t.reviewedAt = new Date();
    if (decision === "approved") t.completionDate = new Date();

    await t.save();
    res.json(t);
  } catch (e) {
    next(e);
  }
};