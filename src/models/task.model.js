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
    mentorshipId: { type: mongoose.Schema.Types.ObjectId, ref: "Mentorship", required: true },

    // Optional: link tasks to a phase/module concept
    phaseOrder: { type: Number, default: 1 }, // phase 1,2,3... (simple for now)

    title: { type: String, required: true, trim: true },
    category: { type: String, trim: true },

    dueDate: { type: Date, required: true },

    status: {
      type: String,
      enum: ["pending", "submitted", "approved", "rejected"],
      default: "pending",
      required: true
    },

    xpPossible: { type: Number, default: 100 },

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