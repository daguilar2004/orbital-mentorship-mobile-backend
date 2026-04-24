const Task = require("../models/task.model");
const Phase = require("../models/phase.model");
const Mentorship = require("../models/mentorship.model");
const Mentee = require("../models/mentee.model");
const {
  recomputeMentorshipPhaseStatuses,
} = require("../services/phase-status.service");

async function getMentorshipContextByPhaseId(phaseId) {
  const phase = await Phase.findById(phaseId);
  if (!phase) return null;

  const mentorship = await Mentorship.findById(phase.mentorshipId);
  if (!mentorship) return null;

  return { phase, mentorship };
}

async function syncMenteeXpForTaskTransition({
  phaseId,
  previousStatus,
  nextStatus,
  previousXp,
  nextXp,
}) {
  const wasApproved = previousStatus === "approved";
  const isApproved = nextStatus === "approved";

  let delta = 0;

  if (!wasApproved && isApproved) {
    delta = nextXp;
  } else if (wasApproved && !isApproved) {
    delta = -previousXp;
  } else if (wasApproved && isApproved) {
    delta = nextXp - previousXp;
  }

  const context = await getMentorshipContextByPhaseId(phaseId);
  if (!context || delta === 0) {
    return context;
  }

  const mentee = await Mentee.findById(context.mentorship.menteeId);
  if (!mentee) {
    return context;
  }

  const currentXp = mentee.profile?.xp ?? 0;
  mentee.profile.xp = Math.max(0, currentXp + delta);
  await mentee.save();

  return context;
}

exports.createTask = async (req, res, next) => {
  try {
    const {
      phaseId,
      title,
      dueDate,
      description,
      xp,
      expectedTime,
      skills,
    } = req.body;

    const task = await Task.create({
      phaseId,
      title,
      dueDate,
      description,
      xp,
      expectedTime,
      skills,
    });

    const phase = await Phase.findById(phaseId);
    if (phase) {
      await recomputeMentorshipPhaseStatuses(phase.mentorshipId);
    }

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

exports.submitTask = async (req, res, next) => {
  try {
    const { submissionText, submissionFiles } = req.body;

    const t = await Task.findById(req.params.id);
    if (!t) return res.status(404).json({ error: "Task not found" });

    const previousStatus = t.status;
    const previousXp = t.xp ?? 0;

    t.status = "submitted";
    t.submissionText = submissionText ?? "";
    if (Array.isArray(submissionFiles)) t.submissionFiles = submissionFiles;

    t.submittedAt = new Date();
    t.reviewedAt = undefined;

    await t.save();

    const context = await syncMenteeXpForTaskTransition({
      phaseId: t.phaseId,
      previousStatus,
      nextStatus: t.status,
      previousXp,
      nextXp: t.xp ?? 0,
    });

    if (context) {
      await recomputeMentorshipPhaseStatuses(context.phase.mentorshipId);
    }

    res.json(t);
  } catch (e) {
    next(e);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const { title, dueDate, description, xp, expectedTime, skills } = req.body;

    const existingTask = await Task.findById(req.params.id);
    if (!existingTask) {
      return res.status(404).json({ error: "Task not found" });
    }

    const updated = await Task.findByIdAndUpdate(
      req.params.id,
      {
        title,
        dueDate,
        description,
        xp,
        expectedTime,
        skills,
      },
      { new: true }
    );

    const context = await syncMenteeXpForTaskTransition({
      phaseId: updated.phaseId,
      previousStatus: existingTask.status,
      nextStatus: updated.status,
      previousXp: existingTask.xp ?? 0,
      nextXp: updated.xp ?? 0,
    });

    if (context) {
      await recomputeMentorshipPhaseStatuses(context.phase.mentorshipId);
    }

    res.json(updated);
  } catch (e) {
    next(e);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const deleted = await Task.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "Task not found" });
    }

    const context = await syncMenteeXpForTaskTransition({
      phaseId: deleted.phaseId,
      previousStatus: deleted.status,
      nextStatus: "deleted",
      previousXp: deleted.xp ?? 0,
      nextXp: 0,
    });

    if (context) {
      await recomputeMentorshipPhaseStatuses(context.phase.mentorshipId);
    }

    res.json({ message: "Task deleted successfully" });
  } catch (e) {
    next(e);
  }
};

exports.reviewTask = async (req, res, next) => {
  try {
    const { decision, mentorFeedback } = req.body;

    if (!["approved", "rejected"].includes(decision)) {
      return res
        .status(400)
        .json({ error: "decision must be approved or rejected" });
    }

    const t = await Task.findById(req.params.id);
    if (!t) return res.status(404).json({ error: "Task not found" });

    const previousStatus = t.status;
    const previousXp = t.xp ?? 0;

    t.status = decision;
    t.mentorFeedback = mentorFeedback ?? "";
    t.reviewedAt = new Date();
    t.completionDate = decision === "approved" ? new Date() : undefined;

    await t.save();

    const context = await syncMenteeXpForTaskTransition({
      phaseId: t.phaseId,
      previousStatus,
      nextStatus: t.status,
      previousXp,
      nextXp: t.xp ?? 0,
    });

    if (context) {
      await recomputeMentorshipPhaseStatuses(context.phase.mentorshipId);
    }

    res.json(t);
  } catch (e) {
    next(e);
  }
};