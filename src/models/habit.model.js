const mongoose = require("mongoose");

const habitAnswersSchema = new mongoose.Schema(
  {
    trigger: {
      type: String,
      default: "",
      trim: true,
    },
    motivation: {
      type: String,
      default: "",
      trim: true,
    },
    action: {
      type: String,
      default: "",
      trim: true,
    },
    reinforcement: {
      type: String,
      default: "",
      trim: true,
    },
    reflection: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false }
);

const habitSchema = new mongoose.Schema(
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

    days: {
      type: [String],
      enum: ["S", "M", "T", "W", "T2", "F", "S2"],
      default: [],
      validate: {
        validator: function (value) {
          return Array.isArray(value) && value.length > 0;
        },
        message: "At least one day must be selected.",
      },
    },

    completedOn: {
      type: String,
      default: null,
      validate: {
        validator: function (value) {
          return value === null || /^\d{4}-\d{2}-\d{2}$/.test(value);
        },
        message: "completedOn must be null or in YYYY-MM-DD format.",
      },
    },

    linkedGoalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Goal",
      default: null,
    },

    answers: {
      type: habitAnswersSchema,
      default: () => ({
        trigger: "",
        motivation: "",
        action: "",
        reinforcement: "",
        reflection: "",
      }),
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Habit", habitSchema);
