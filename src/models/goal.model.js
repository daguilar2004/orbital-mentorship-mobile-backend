const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    time: {
      type: String,
      required: true,
      trim: true,
    },

    specific: {
      type: String,
      required: true,
      trim: true,
    },

    measurable: {
      type: String,
      required: true,
      trim: true,
    },

    achievable: {
      type: String,
      default: "",
      trim: true,
    },

    relevant: {
      type: String,
      default: "",
      trim: true,
    },

    timeBound: {
      type: String,
      required: true,
      trim: true,
    },

    completed: {
      type: Boolean,
      default: false,
    },

    linkedHabitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Habit",
      default: null,
    },

    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Goal", goalSchema);