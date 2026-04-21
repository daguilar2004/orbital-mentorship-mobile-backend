const mongoose = require("mongoose");

const phaseSchema = new mongoose.Schema(
  {
    mentorshipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mentorship",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    order: {
      type: Number,
      required: true, // 1, 2, 3...
    },

    // Optional but VERY useful
    status: {
      type: String,
      enum: ["upcoming", "current", "completed"],
      default: "upcoming",
    },
    
  },
  { timestamps: true },

  
);

module.exports = mongoose.model("Phase", phaseSchema);