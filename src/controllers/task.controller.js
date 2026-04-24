const Task = require("../models/task.model");

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

// General update task (for editing title, category, dueDate, description, isFavorite, etc.)
exports.updateTask = async (req, res, next) => {
  try {
    const { title, category, dueDate, description, isFavorite } = req.body;
    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (category !== undefined) updateFields.category = category;
    if (dueDate !== undefined) updateFields.dueDate = new Date(dueDate);
    if (description !== undefined) updateFields.description = description;
    if (isFavorite !== undefined) updateFields.isFavorite = isFavorite;

    const t = await Task.findByIdAndUpdate(
      req.params.id,
      updateFields,
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

exports.toggleFavorite = async (req, res, next) => {
  try {
    const t = await Task.findById(req.params.id);
    if (!t) return res.status(404).json({ error: "Task not found" });

    t.isFavorite = !t.isFavorite;
    await t.save();
    res.json(t);
  } catch (e) {
    next(e);
  }
};

exports.getFavoriteTasks = async (req, res, next) => {
  try {
    const mentorshipId = req.params.mentorshipId;
    const tasks = await Task.find({ mentorshipId, isFavorite: true }).sort({ phaseOrder: 1, dueDate: 1 });
    res.json(tasks);
  } catch (e) {
    next(e);
  }
};