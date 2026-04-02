const Goal = require("../models/goal.model");
const Habit = require("../models/habit.model");

const VALID_DAYS = ["S", "M", "T", "W", "T2", "F", "S2"];

function normalizeDays(days) {
  if (!Array.isArray(days)) return [];
  return [...new Set(days.filter((day) => VALID_DAYS.includes(day)))];
}

function emptyHabitAnswers() {
  return {
    trigger: "",
    motivation: "",
    action: "",
    reinforcement: "",
    reflection: "",
  };
}

// GET /api/goals
exports.getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(goals);
  } catch (error) {
    console.error("getGoals error:", error);
    res.status(500).json({ message: "Failed to fetch goals." });
  }
};

// GET /api/goals/:id
exports.getGoalById = async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!goal) {
      return res.status(404).json({ message: "Goal not found." });
    }

    res.status(200).json(goal);
  } catch (error) {
    console.error("getGoalById error:", error);
    res.status(500).json({ message: "Failed to fetch goal." });
  }
};

// POST /api/goals
exports.createGoal = async (req, res) => {
  try {
    const {
      title,
      time,
      specific,
      measurable,
      achievable = "",
      relevant = "",
      timeBound,
      goalHabitTitle = "",
      goalHabitDays = [],
    } = req.body;

    if (!title?.trim() || !time?.trim() || !specific?.trim() || !measurable?.trim() || !timeBound?.trim()) {
      return res.status(400).json({
        message: "Title, time, specific, measurable, and timeBound are required.",
      });
    }

    const goal = await Goal.create({
      user: req.user.id,
      title: title.trim(),
      time: time.trim(),
      specific: specific.trim(),
      measurable: measurable.trim(),
      achievable: achievable?.trim?.() || "",
      relevant: relevant?.trim?.() || "",
      timeBound: timeBound.trim(),
      completed: false,
    });

    const normalizedDays = normalizeDays(goalHabitDays);

    if (goalHabitTitle?.trim() && normalizedDays.length > 0) {
      const linkedHabit = await Habit.create({
        user: req.user.id,
        title: goalHabitTitle.trim(),
        days: normalizedDays,
        completedOn: null,
        linkedGoalId: goal._id,
        answers: emptyHabitAnswers(),
      });

      goal.linkedHabitId = linkedHabit._id;
      await goal.save();
    }

    res.status(201).json(goal);
  } catch (error) {
    console.error("createGoal error:", error);
    res.status(500).json({ message: "Failed to create goal." });
  }
};

// PUT /api/goals/:id
exports.updateGoal = async (req, res) => {
  try {
    const {
      title,
      time,
      specific,
      measurable,
      achievable,
      relevant,
      timeBound,
      goalHabitTitle,
      goalHabitDays,
    } = req.body;

    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!goal) {
      return res.status(404).json({ message: "Goal not found." });
    }

    if (
      title !== undefined &&
      time !== undefined &&
      specific !== undefined &&
      measurable !== undefined &&
      timeBound !== undefined
    ) {
      if (
        !title.trim() ||
        !time.trim() ||
        !specific.trim() ||
        !measurable.trim() ||
        !timeBound.trim()
      ) {
        return res.status(400).json({
          message: "Title, time, specific, measurable, and timeBound cannot be empty.",
        });
      }
    }

    if (title !== undefined) goal.title = title.trim();
    if (time !== undefined) goal.time = time.trim();
    if (specific !== undefined) goal.specific = specific.trim();
    if (measurable !== undefined) goal.measurable = measurable.trim();
    if (achievable !== undefined) goal.achievable = achievable?.trim?.() || "";
    if (relevant !== undefined) goal.relevant = relevant?.trim?.() || "";
    if (timeBound !== undefined) goal.timeBound = timeBound.trim();

    const existingLinkedHabit = goal.linkedHabitId
      ? await Habit.findOne({ _id: goal.linkedHabitId, user: req.user.id })
      : null;

    const habitTitleProvided = goalHabitTitle !== undefined;
    const habitDaysProvided = goalHabitDays !== undefined;

    if (habitTitleProvided || habitDaysProvided) {
      const trimmedHabitTitle = goalHabitTitle?.trim?.() || "";
      const normalizedDays = normalizeDays(goalHabitDays);

      if (trimmedHabitTitle && normalizedDays.length > 0) {
        if (existingLinkedHabit) {
          existingLinkedHabit.title = trimmedHabitTitle;
          existingLinkedHabit.days = normalizedDays;
          existingLinkedHabit.linkedGoalId = goal._id;
          await existingLinkedHabit.save();
        } else {
          const newHabit = await Habit.create({
            user: req.user.id,
            title: trimmedHabitTitle,
            days: normalizedDays,
            completedOn: null,
            linkedGoalId: goal._id,
            answers: emptyHabitAnswers(),
          });

          goal.linkedHabitId = newHabit._id;
        }
      } else if (existingLinkedHabit) {
        await Habit.deleteOne({ _id: existingLinkedHabit._id });
        goal.linkedHabitId = null;
      }
    }

    await goal.save();
    res.status(200).json(goal);
  } catch (error) {
    console.error("updateGoal error:", error);
    res.status(500).json({ message: "Failed to update goal." });
  }
};

// PATCH /api/goals/:id/toggle-complete
exports.toggleGoalComplete = async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!goal) {
      return res.status(404).json({ message: "Goal not found." });
    }

    goal.completed = !goal.completed;
    await goal.save();

    res.status(200).json(goal);
  } catch (error) {
    console.error("toggleGoalComplete error:", error);
    res.status(500).json({ message: "Failed to toggle goal completion." });
  }
};

// DELETE /api/goals/:id
exports.deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!goal) {
      return res.status(404).json({ message: "Goal not found." });
    }

    if (goal.linkedHabitId) {
      await Habit.deleteOne({
        _id: goal.linkedHabitId,
        user: req.user.id,
      });
    }

    await Goal.deleteOne({ _id: goal._id });

    res.status(200).json({ message: "Goal deleted successfully." });
  } catch (error) {
    console.error("deleteGoal error:", error);
    res.status(500).json({ message: "Failed to delete goal." });
  }
};