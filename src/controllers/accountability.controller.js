const mongoose = require("mongoose");
const AccountabilityItem = require("../models/accountabilityItem.model");

// TEMP for local testing until real auth is wired in.
// Replace this with req.user.id once JWT auth is connected.
const TEST_USER_ID = "67e5d8f00000000000000001";

function getUserId(req) {
  return req.user?.id || req.user?._id || req.body.userId || TEST_USER_ID;
}

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

exports.getAllAccountability = async (req, res, next) => {
  try {
    const userId = getUserId(req);

    const items = await AccountabilityItem.find({ userId }).sort({
      createdAt: -1,
    });

    const habits = items.filter((item) => item.kind === "habit");
    const goals = items.filter((item) => item.kind === "goal");

    res.json({ habits, goals });
  } catch (e) {
    next(e);
  }
};

exports.createHabit = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const {
      title,
      days = [],
      trigger = "",
      motivation = "",
      action = "",
      reinforcement = "",
      reflection = "",
      linkedGoalId = null,
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ error: "title is required" });
    }

    if (!Array.isArray(days) || days.length === 0) {
      return res.status(400).json({ error: "days must be a non-empty array" });
    }

    const habit = await AccountabilityItem.create({
      userId,
      kind: "habit",
      title: title.trim(),
      days,
      trigger,
      motivation,
      action,
      reinforcement,
      reflection,
      linkedGoalId: linkedGoalId || null,
      completed: false,
      completionDates: [],
    });

    // if linked goal exists, point it back to this habit
    if (linkedGoalId && isValidObjectId(linkedGoalId)) {
      await AccountabilityItem.findOneAndUpdate(
        { _id: linkedGoalId, userId, kind: "goal" },
        { linkedHabitId: habit._id }
      );
    }

    res.status(201).json(habit);
  } catch (e) {
    next(e);
  }
};

exports.createGoal = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const {
      title,
      time = "",
      specific = "",
      measurable = "",
      achievable = "",
      relevant = "",
      timeBound = "",
      linkedHabit = null,
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ error: "title is required" });
    }

    if (!time?.trim() || !specific?.trim() || !measurable?.trim() || !timeBound?.trim()) {
      return res.status(400).json({
        error: "time, specific, measurable, and timeBound are required",
      });
    }

    const goal = await AccountabilityItem.create({
      userId,
      kind: "goal",
      title: title.trim(),
      time,
      specific,
      measurable,
      achievable,
      relevant,
      timeBound,
      completed: false,
    });

    // Optional linked daily habit creation
    if (
      linkedHabit &&
      linkedHabit.title?.trim() &&
      Array.isArray(linkedHabit.days) &&
      linkedHabit.days.length > 0
    ) {
      const habit = await AccountabilityItem.create({
        userId,
        kind: "habit",
        title: linkedHabit.title.trim(),
        days: linkedHabit.days,
        trigger: linkedHabit.trigger || "",
        motivation: linkedHabit.motivation || "",
        action: linkedHabit.action || "",
        reinforcement: linkedHabit.reinforcement || "",
        reflection: linkedHabit.reflection || "",
        linkedGoalId: goal._id,
        completionDates: [],
      });

      goal.linkedHabitId = habit._id;
      await goal.save();
    }

    const populatedGoal = await AccountabilityItem.findById(goal._id);
    res.status(201).json(populatedGoal);
  } catch (e) {
    next(e);
  }
};

exports.updateAccountabilityItem = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    const item = await AccountabilityItem.findOne({ _id: id, userId });
    if (!item) {
      return res.status(404).json({ error: "Accountability item not found" });
    }

    if (item.kind === "habit") {
      const {
        title,
        days,
        trigger,
        motivation,
        action,
        reinforcement,
        reflection,
      } = req.body;

      if (typeof title === "string") item.title = title.trim();
      if (Array.isArray(days)) item.days = days;
      if (typeof trigger === "string") item.trigger = trigger;
      if (typeof motivation === "string") item.motivation = motivation;
      if (typeof action === "string") item.action = action;
      if (typeof reinforcement === "string") item.reinforcement = reinforcement;
      if (typeof reflection === "string") item.reflection = reflection;
    }

    if (item.kind === "goal") {
      const {
        title,
        time,
        specific,
        measurable,
        achievable,
        relevant,
        timeBound,
      } = req.body;

      if (typeof title === "string") item.title = title.trim();
      if (typeof time === "string") item.time = time;
      if (typeof specific === "string") item.specific = specific;
      if (typeof measurable === "string") item.measurable = measurable;
      if (typeof achievable === "string") item.achievable = achievable;
      if (typeof relevant === "string") item.relevant = relevant;
      if (typeof timeBound === "string") item.timeBound = timeBound;
    }

    await item.save();
    res.json(item);
  } catch (e) {
    next(e);
  }
};

exports.deleteAccountabilityItem = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    const item = await AccountabilityItem.findOne({ _id: id, userId });
    if (!item) {
      return res.status(404).json({ error: "Accountability item not found" });
    }

    // If deleting a goal, unlink/delete its linked habit
    if (item.kind === "goal" && item.linkedHabitId) {
      await AccountabilityItem.findOneAndDelete({
        _id: item.linkedHabitId,
        userId,
        kind: "habit",
      });
    }

    // If deleting a habit, unlink it from its linked goal
    if (item.kind === "habit" && item.linkedGoalId) {
      await AccountabilityItem.findOneAndUpdate(
        { _id: item.linkedGoalId, userId, kind: "goal" },
        { linkedHabitId: null }
      );
    }

    await AccountabilityItem.deleteOne({ _id: item._id });

    res.json({ ok: true, deletedId: id });
  } catch (e) {
    next(e);
  }
};

exports.toggleDailyHabitCompletion = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    const { date } = req.body;

    if (!date) {
      return res.status(400).json({ error: "date is required" });
    }

    const habit = await AccountabilityItem.findOne({
      _id: id,
      userId,
      kind: "habit",
    });

    if (!habit) {
      return res.status(404).json({ error: "Habit not found" });
    }

    const alreadyDone = habit.completionDates.includes(date);

    if (alreadyDone) {
      habit.completionDates = habit.completionDates.filter((d) => d !== date);
    } else {
      habit.completionDates.push(date);
    }

    await habit.save();

    res.json({
      id: habit._id,
      completed: !alreadyDone,
      completionDates: habit.completionDates,
    });
  } catch (e) {
    next(e);
  }
};

exports.toggleGoalCompletion = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    const goal = await AccountabilityItem.findOne({
      _id: id,
      userId,
      kind: "goal",
    });

    if (!goal) {
      return res.status(404).json({ error: "Goal not found" });
    }

    goal.completed = !goal.completed;
    await goal.save();

    res.json(goal);
  } catch (e) {
    next(e);
  }
};