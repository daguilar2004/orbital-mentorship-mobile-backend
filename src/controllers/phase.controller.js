const Phase = require("../models/phase.model");
const Task = require("../models/task.model");
const Mentorship = require("../models/mentorship.model");
const mongoose = require("mongoose");
exports.createPhase = async (req, res, next) => {
  try {
    const { mentorshipId, name, description, startDate, endDate, order } = req.body;
    const lastPhase = await Phase.findOne({ mentorshipId }).sort({ order: -1 });

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

    res.status(201).json(phase);
  } catch (e) {
    next(e);
  }
};


exports.getPhasesByMentorship = async (req, res, next) => {
  try {
    const { mentorshipId } = req.params;
    console.log('Received mentorshipId:', mentorshipId);

    const phases = await Phase.find({ mentorshipId }).sort({ order: 1 });
    console.log('Found phases:', phases.length, 'phases');

    const phasesWithTasks = await Promise.all(
      phases.map(async (p) => {
        const tasks = await Task.find({ phaseId: p._id });

        return {
          ...p.toObject(),
          tasks,
        };
      })
    );

    res.json(phasesWithTasks);
  } catch (e) {
    next(e);
  }
};