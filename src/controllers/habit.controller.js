const mongoose = require("mongoose");
const Habit = require("../models/habit.model");
const Goal = require("../models/goal.model");

const VALID_DAYS = ["S", "M", "T", "W", "T2", "F", "S2"];

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeDays(days) {
  if (!Array.isArray(days)) return [];
  return [...new Set(days.filter((day) => VALID_DAYS.includes(day)))];
}

function buildHabitAnswers(answers = {}) {
  return {
    trigger: answers.trigger?.trim?.() || "",
    motivation: answers.motivation?.trim?.() || "",
    action: answers.action?.trim?.() || "",
    reinforcement: answers.reinforcement?.trim?.() || "",
    reflection: answers.reflection?.trim?.() || "",
  };
}

exports.getHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(habits);
  } catch (error) {
    console.error("getHabits error:", error);
    res.status(500).json({ message: "Failed to fetch habits." });
  }
};

exports.getHabitById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid habit ID." });
    }

    const habit = await Habit.findOne({ _id: id, userId: req.user.id });

    if (!habit) {
      return res.status(404).json({ message: "Habit not found." });
    }

    res.status(200).json(habit);
  } catch (error) {
    console.error("getHabitById error:", error);
    res.status(500).json({ message: "Failed to fetch habit." });
  }
};

exports.createHabit = async (req, res) => {
  try {
    const {
      title,
      days,
      completedOn = null,
      linkedGoalId = null,
      answers = {},
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ message: "Habit title is required." });
    }

    const normalizedDays = normalizeDays(days);
    if (normalizedDays.length === 0) {
      return res.status(400).json({ message: "At least one day must be selected." });
    }

    if (linkedGoalId && !isValidObjectId(linkedGoalId)) {
      return res.status(400).json({ message: "Invalid linkedGoalId." });
    }

    const newHabit = await Habit.create({
      userId: req.user.id,
      title: title.trim(),
      days: normalizedDays,
      completedOn,
      linkedGoalId,
      answers: buildHabitAnswers(answers),
    });

    if (linkedGoalId) {
      await Goal.findOneAndUpdate(
        { _id: linkedGoalId, userId: req.user.id },
        { linkedHabitId: newHabit._id },
        { new: true }
      );
    }

    res.status(201).json(newHabit);
  } catch (error) {
    console.error("createHabit error:", error);
    res.status(500).json({ message: "Failed to create habit." });
  }
};

exports.updateHabit = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, days, completedOn, linkedGoalId, answers } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid habit ID." });
    }

    if (linkedGoalId && !isValidObjectId(linkedGoalId)) {
      return res.status(400).json({ message: "Invalid linkedGoalId." });
    }

    const habit = await Habit.findOne({ _id: id, userId: req.user.id });

    if (!habit) {
      return res.status(404).json({ message: "Habit not found." });
    }

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({ message: "Habit title cannot be empty." });
      }
      habit.title = title.trim();
    }

    if (days !== undefined) {
      const normalizedDays = normalizeDays(days);
      if (normalizedDays.length === 0) {
        return res.status(400).json({ message: "At least one day must be selected." });
      }
      habit.days = normalizedDays;
    }

    if (completedOn !== undefined) {
      habit.completedOn = completedOn;
    }

    if (answers !== undefined) {
      habit.answers = buildHabitAnswers(answers);
    }

    if (linkedGoalId !== undefined) {
      const oldLinkedGoalId = habit.linkedGoalId?.toString() || null;
      const nextLinkedGoalId = linkedGoalId || null;

      if (oldLinkedGoalId && oldLinkedGoalId !== String(nextLinkedGoalId || "")) {
        await Goal.findOneAndUpdate(
          { _id: oldLinkedGoalId, userId: req.user.id },
          { $unset: { linkedHabitId: 1 } }
        );
      }

      habit.linkedGoalId = nextLinkedGoalId;

      if (nextLinkedGoalId) {
        await Goal.findOneAndUpdate(
          { _id: nextLinkedGoalId, userId: req.user.id },
          { linkedHabitId: habit._id }
        );
      }
    }

    await habit.save();
    res.status(200).json(habit);
  } catch (error) {
    console.error("updateHabit error:", error);
    res.status(500).json({ message: "Failed to update habit." });
  }
};

exports.toggleHabitCompletion = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid habit ID." });
    }

    const habit = await Habit.findOne({ _id: id, userId: req.user.id });

    if (!habit) {
      return res.status(404).json({ message: "Habit not found." });
    }

    const todayKey = getTodayKey();
    habit.completedOn = habit.completedOn === todayKey ? null : todayKey;

    await habit.save();
    res.status(200).json(habit);
  } catch (error) {
    console.error("toggleHabitCompletion error:", error);
    res.status(500).json({ message: "Failed to toggle habit completion." });
  }
};

exports.deleteHabit = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid habit ID." });
    }

    const habit = await Habit.findOne({ _id: id, userId: req.user.id });

    if (!habit) {
      return res.status(404).json({ message: "Habit not found." });
    }

    if (habit.linkedGoalId) {
      await Goal.findOneAndUpdate(
        { _id: habit.linkedGoalId, userId: req.user.id },
        { $unset: { linkedHabitId: 1 } }
      );
    }

    await Habit.findByIdAndDelete(habit._id);

    res.status(200).json({ message: "Habit deleted successfully." });
  } catch (error) {
    console.error("deleteHabit error:", error);
    res.status(500).json({ message: "Failed to delete habit." });
  }
};
