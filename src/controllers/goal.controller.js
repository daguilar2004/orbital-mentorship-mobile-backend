const mongoose = require("mongoose");
const Goal = require("../models/goal.model");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

exports.getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json(goals);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch goals",
      error: error.message,
    });
  }
};

exports.getGoalById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid goal ID" });
    }

    const goal = await Goal.findOne({ _id: id, userId: req.user.id });

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    return res.status(200).json(goal);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch goal",
      error: error.message,
    });
  }
};

exports.createGoal = async (req, res) => {
  try {
    const {
      title,
      time,
      specific,
      measurable,
      achievable,
      relevant,
      timeBound,
      linkedHabitId,
    } = req.body;

    if (!title || !time || !specific || !measurable || !timeBound) {
      return res.status(400).json({
        message: "title, time, specific, measurable, and timeBound are required",
      });
    }

    if (linkedHabitId && !isValidObjectId(linkedHabitId)) {
      return res.status(400).json({ message: "Invalid linkedHabitId" });
    }

    const newGoal = await Goal.create({
      userId: req.user.id,
      title: title.trim(),
      time: time.trim(),
      specific: specific.trim(),
      measurable: measurable.trim(),
      achievable: achievable?.trim() || "",
      relevant: relevant?.trim() || "",
      timeBound: timeBound.trim(),
      linkedHabitId: linkedHabitId || null,
    });

    return res.status(201).json(newGoal);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create goal",
      error: error.message,
    });
  }
};

exports.updateGoal = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid goal ID" });
    }

    const {
      title,
      time,
      specific,
      measurable,
      achievable,
      relevant,
      timeBound,
      completed,
      linkedHabitId,
      isArchived,
    } = req.body;

    if (linkedHabitId && linkedHabitId !== "" && !isValidObjectId(linkedHabitId)) {
      return res.status(400).json({ message: "Invalid linkedHabitId" });
    }

    const updateData = {};

    if (title !== undefined) updateData.title = title.trim();
    if (time !== undefined) updateData.time = time.trim();
    if (specific !== undefined) updateData.specific = specific.trim();
    if (measurable !== undefined) updateData.measurable = measurable.trim();
    if (achievable !== undefined) updateData.achievable = achievable.trim();
    if (relevant !== undefined) updateData.relevant = relevant.trim();
    if (timeBound !== undefined) updateData.timeBound = timeBound.trim();
    if (completed !== undefined) updateData.completed = completed;
    if (isArchived !== undefined) updateData.isArchived = isArchived;

    if (linkedHabitId !== undefined) {
      updateData.linkedHabitId = linkedHabitId === "" ? null : linkedHabitId;
    }

    const updatedGoal = await Goal.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedGoal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    return res.status(200).json(updatedGoal);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update goal",
      error: error.message,
    });
  }
};

exports.toggleCompleteGoal = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid goal ID" });
    }

    const goal = await Goal.findOne({ _id: id, userId: req.user.id });

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    goal.completed = !goal.completed;
    await goal.save();

    return res.status(200).json(goal);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to toggle goal completion",
      error: error.message,
    });
  }
};

exports.deleteGoal = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid goal ID" });
    }

    const deletedGoal = await Goal.findOneAndDelete({
      _id: id,
      userId: req.user.id,
    });

    if (!deletedGoal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    return res.status(200).json({
      message: "Goal deleted successfully",
      goal: deletedGoal,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete goal",
      error: error.message,
    });
  }
};
