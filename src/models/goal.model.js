const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema(
  {
    //user: {
      //type: mongoose.Schema.Types.ObjectId,
      //ref: "User",
     // required: true,
   // },

    title: {
      type: String,
      required: true,
      trim: true,
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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Goal", goalSchema);