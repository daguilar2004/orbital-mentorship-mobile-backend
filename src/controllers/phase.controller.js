const Phase = require("../models/phase.model");
const Task = require("../models/task.model");
const Mentorship = require("../models/mentorship.model");
const {
  recomputeMentorshipPhaseStatuses,
} = require("../services/phase-status.service");

exports.createPhase = async (req, res, next) => {
  try {
    const { mentorshipId, name, description, startDate, endDate } = req.body;

    const lastPhase = await Phase.findOne({ mentorshipId }).sort({
      order: -1,
    });

    const nextOrder = lastPhase ? lastPhase.order + 1 : 1;

    // ✅ Create phase
    const phase = await Phase.create({
      mentorshipId,
      name,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      order: nextOrder,
    });

    // ✅ Push into mentorship
    await Mentorship.findByIdAndUpdate(mentorshipId, {
      $push: { phases: phase._id },
    });

    await recomputeMentorshipPhaseStatuses(mentorshipId);

    const refreshedPhase = await Phase.findById(phase._id);

    res.status(201).json(refreshedPhase);
  } catch (e) {
    next(e);
  }
};

exports.getPhasesByMentorship = async (req, res, next) => {
  try {
    const { mentorshipId } = req.params;

    console.log("Received mentorshipId:", mentorshipId);

    await recomputeMentorshipPhaseStatuses(mentorshipId);

    const phases = await Phase.find({ mentorshipId }).sort({ order: 1 });

    console.log("Found phases:", phases.length, "phases");

    const phasesWithTasks = await Promise.all(
      phases.map(async (p) => {
        const tasks = await Task.find({ phaseId: p._id });

        return {
          ...p.toObject(),
          status: p.status,
          tasks,
        };
      })
    );

    res.json(phasesWithTasks);
  } catch (e) {
    next(e);
  }
};

exports.updatePhase = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, startDate, endDate } = req.body;

    const updatedPhase = await Phase.findByIdAndUpdate(
      id,
      {
        name,
        description,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
      { new: true } // return updated document
    );

    if (!updatedPhase) {
      return res.status(404).json({ message: "Phase not found" });
    }

    res.json(updatedPhase);
  } catch (e) {
    next(e);
  }
};

exports.deletePhase = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deleted = await Phase.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Phase not found" });
    }

    // remove from mentorship
    await Mentorship.findByIdAndUpdate(deleted.mentorshipId, {
      $pull: { phases: id },
    });

    await recomputeMentorshipPhaseStatuses(deleted.mentorshipId);

    res.json({ message: "Phase deleted successfully" });
  } catch (e) {
    next(e);
  }
};
