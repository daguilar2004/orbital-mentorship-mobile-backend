const mongoose = require("mongoose");

const attachmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    url: { type: String },           // later: S3/Cloud storage URL
    sizeBytes: { type: Number },
    mimeType: { type: String }
  },
  { _id: false }
);

const taskSchema = new mongoose.Schema(
  {

  phaseId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Phase",
  required: true,
},

    title: { type: String, required: true, trim: true },
    category: { type: String, trim: true },

    dueDate: { type: Date, required: true },

    status: {
      type: String,
      enum: ["pending", "submitted", "approved", "rejected"],
      default: "pending",
      required: true
    },

    xp: { type: Number, default: 100 },

    // Mentor-editable description
    description: { type: String, trim: true },

    // Mentee submission
    submissionText: { type: String, trim: true },
    submissionFiles: { type: [attachmentSchema], default: [] },
    submittedAt: { type: Date },

    // Mentor review
    mentorFeedback: { type: String, trim: true, maxLength: 2000 },
    reviewedAt: { type: Date },

    completionDate: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);