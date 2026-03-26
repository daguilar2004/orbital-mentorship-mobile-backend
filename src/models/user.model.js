const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    auth0Id: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    username: { type: String, required: true, trim: true },
    firstName: { type: String, maxLength: 100, trim: true },
    lastName: { type: String, maxLength: 100, trim: true },
    profilePictureURL: { type: String, trim: true },

    role: { type: String, enum: ["mentor", "mentee", "admin"], required: true },

    completedSteps: {
      type: [String],
      enum: ["roleSelection", "questionnaire", "profileSetup", "connect"],
      default: []
    },

    currentStep: {
      type: String,
      enum: ["roleSelection", "questionnaire", "profileSetup", "connect", "completed"],
      default: "roleSelection",
      required: true
    },

    mentorId: { type: mongoose.Schema.Types.ObjectId, ref: "Mentor" },
    menteeId: { type: mongoose.Schema.Types.ObjectId, ref: "Mentee" },

    zip: { type: String, trim: true },
    active: { type: Boolean, default: true },

    websiteNotificationSettings: {
      connectionRequests: { type: Boolean, default: true },
      chatMessages: { type: Boolean, default: true },
      addedResource: { type: Boolean, default: true },
      addedTask: { type: Boolean, default: true },
      mentoreeRequests: { type: Boolean, default: true },
      taskSubmission: { type: Boolean, default: true },
      completeDailyModule: { type: Boolean, default: true },
      upcomingMeetings: { type: Boolean, default: true },
      newTaskReview: { type: Boolean, default: true },
      newMeetingReview: { type: Boolean, default: true }
    },

    audioNotificationSettings: {
      chatMessages: { type: Boolean, default: true },
      incomingMeeting: { type: Boolean, default: true },
      outgoingMeeting: { type: Boolean, default: true },
      userJoinMeeting: { type: Boolean, default: true }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);