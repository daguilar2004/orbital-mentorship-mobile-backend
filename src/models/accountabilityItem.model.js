const mongoose = require("mongoose");

const accountabilityItemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    kind: {
      type: String,
      enum: ["habit", "goal"],
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    // habit fields
    days: {
      type: [String],
      default: [],
    },
    trigger: {
      type: String,
      trim: true,
      default: "",
    },
    motivation: {
      type: String,
      trim: true,
      default: "",
    },
    action: {
      type: String,
      trim: true,
      default: "",
    },
    reinforcement: {
      type: String,
      trim: true,
      default: "",
    },
    reflection: {
      type: String,
      trim: true,
      default: "",
    },

    // goal fields
    time: {
      type: String,
      trim: true,
      default: "",
    },
    specific: {
      type: String,
      trim: true,
      default: "",
    },
    measurable: {
      type: String,
      trim: true,
      default: "",
    },
    achievable: {
      type: String,
      trim: true,
      default: "",
    },
    relevant: {
      type: String,
      trim: true,
      default: "",
    },
    timeBound: {
      type: String,
      trim: true,
      default: "",
    },

    // linking
    linkedHabitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AccountabilityItem",
      default: null,
    },
    linkedGoalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AccountabilityItem",
      default: null,
    },

    // goal completion
    completed: {
      type: Boolean,
      default: false,
    },

    // habit completion history by date string like "2026-03-27"
    completionDates: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AccountabilityItem", accountabilityItemSchema);