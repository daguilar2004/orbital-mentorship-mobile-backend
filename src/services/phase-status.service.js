const Phase = require("../models/phase.model");
const Task = require("../models/task.model");

async function recomputeMentorshipPhaseStatuses(mentorshipId) {
  const phases = await Phase.find({ mentorshipId }).sort({ order: 1 });

  if (phases.length === 0) {
    return [];
  }

  const phaseIds = phases.map((phase) => phase._id);
  const tasks = await Task.find({ phaseId: { $in: phaseIds } });

  const tasksByPhaseId = new Map();

  for (const task of tasks) {
    const key = task.phaseId.toString();

    if (!tasksByPhaseId.has(key)) {
      tasksByPhaseId.set(key, []);
    }

    tasksByPhaseId.get(key).push(task);
  }

  let currentAssigned = false;

  for (const phase of phases) {
    const phaseTasks = tasksByPhaseId.get(phase._id.toString()) || [];
    const isCompleted =
      phaseTasks.length > 0 &&
      phaseTasks.every((task) => task.status === "approved");

    let nextStatus = "upcoming";

    if (isCompleted) {
      nextStatus = "completed";
    } else if (!currentAssigned) {
      nextStatus = "current";
      currentAssigned = true;
    }

    if (phase.status !== nextStatus) {
      phase.status = nextStatus;
      await phase.save();
    }
  }

  return phases;
}

module.exports = {
  recomputeMentorshipPhaseStatuses,
};
