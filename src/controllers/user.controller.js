const { auth0ManagementClient } = require('../config/auth0Config');
const User = require('../models/user.model');
const mongoose = require('mongoose');
const Mentee = require('../models/mentee.model');
const Mentor = require('../models/mentor.model');

const STEPS_ORDER = ["roleSelection", "questionnaire", "profileSetup", "connect", "completed"];
const STEP_RANK = {
  roleSelection: 0,
  questionnaire: 1,
  profileSetup: 2,
  connect: 3,
  completed: 4,
};

const getUserDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const userDocument = await User.findById(id);
    if (!userDocument) {
      return res.status(404).json({ message: "User not found" });
    }

    const {
      _id,
      email,
      username,
      firstName,
      lastName,
      profilePictureURL,
      currentStep,
      completedSteps,
      role,
      mentorId,
      menteeId,
      zip,
      active,
    } = userDocument;

    return res.status(200).json({
      _id,
      email,
      username,
      firstName,
      lastName,
      profilePictureURL,
      role,
      mentorId,
      menteeId,
      zip,
      active,
      currentStep,
      completedSteps,
    });
  } catch (error) {
    console.error('Failed to retrieve user document:', error);
    return res.status(500).json({ error: 'Failed to retrieve user document' });
  }
};

const getMyUserDocument = async (req, res) => {
  try {
    const auth0Id = req.user.user_id;

    const user = await User.findOne({ auth0Id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error('Failed to retrieve user document:', error);
    return res.status(500).json({ error: 'Failed to retrieve user document' });
  }
};

const getUserSetUpStatus = async (req, res) => {
  try {
    const id = req.params.id;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentStep = user.currentStep;
    const completedSteps = user.completedSteps;

    if (!currentStep || !completedSteps) {
      return res.status(400).json({ error: 'Setup step or completed steps not found' });
    }

    return res.status(200).json({
      completedSteps,
      currentStep,
    });
  } catch (error) {
    console.error('Failed to check user document:', error);
    return res.status(500).json({ error: 'Failed to check user document' });
  }
};

const updateAuth0UserProfilePicture = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_document_id;
    const auth0Id = req.user.user_id;
    const { objectURL } = req.body;

    if (userId != id) {
      return res.status(401).json({ message: "User is not the owner of user document" });
    }

    const auth0Response = await auth0ManagementClient.users.update(
      { id: auth0Id },
      { picture: objectURL }
    );

    return res.json({ auth0Response });
  } catch (error) {
    console.error('Failed to update user profile picture:', error);
    return res.status(500).json({ error: 'Failed to update user profile picture' });
  }
};

const retakeSteps = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { id } = req.params;
    const { stepId } = req.body;

    if (!stepId) {
      await session.abortTransaction();
      return res.status(400).json({ message: "stepId is required in body" });
    }

    const user = await User.findById(id)
      .select('completedSteps currentStep role menteeId mentorId')
      .session(session);

    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({ message: "User not found" });
    }

    const newCompletedSteps = computeUpstreamCompletedCanonical(user.completedSteps, stepId);
    user.completedSteps = newCompletedSteps;
    user.currentStep = stepId;
    await user.save({ session });

    if (stepId === "roleSelection") {
      const ops = [];

      if (user.role === "mentor" && user.mentorId) {
        ops.push(Mentor.findByIdAndDelete(user.mentorId, { session }));
      }

      if (user.role === "mentee" && user.menteeId) {
        ops.push(Mentee.findByIdAndDelete(user.menteeId, { session }));
      }

      await Promise.all(ops);

      await User.updateOne(
        { _id: id },
        { $unset: { mentorId: "", menteeId: "", role: "" } },
        { session }
      );
    }

    await session.commitTransaction();

    return res.status(200).json({
      currentStep: user.currentStep,
      completedSteps: user.completedSteps,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Failed to update user steps:', error);
    return res.status(500).json({ error: 'Failed to update user steps' });
  } finally {
    session.endSession();
  }
};

function computeUpstreamCompletedCanonical(completedSteps = [], stepId) {
  const targetIndex = STEP_RANK[stepId];
  if (targetIndex === undefined) {
    throw new Error("INVALID_STEP");
  }

  const have = new Set(completedSteps || []);
  const kept = [];

  for (const s of STEPS_ORDER) {
    const r = STEP_RANK[s];
    if (r < targetIndex && have.has(s)) {
      kept.push(s);
    }
  }

  return kept;
}

const updateUserDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_document_id;

    if (userId != id) {
      return res.status(401).json({ message: "User is not the owner of user document" });
    }

    const excludedFields = ['_id', 'mentorId', 'menteeId'];
    const updateData = { ...req.body };

    excludedFields.forEach((field) => {
      delete updateData[field];
    });

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(201).json({
      message: "User updated succesfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error('Failed to update user:', error);
    return res.status(500).json({ error: 'Failed to update user' });
  }
};

const updateWebsiteNotificationSettings = async (req, res) => {
  try {
    const auth0Id = req.user.user_id;
    const updates = req.body;

    const allowedFields = [
      "connectionRequests",
      "chatMessages",
      "addedResource",
      "addedTask",
      "mentoreeRequests",
      "taskSubmission",
      "completeDailyModule",
      "upcomingMeetings",
      "newTaskReview",
      "newMeetingReview",
    ];

    const validUpdates = {};
    Object.keys(updates).forEach((key) => {
      if (allowedFields.includes(key) && typeof updates[key] === "boolean") {
        validUpdates[key] = updates[key];
      }
    });

    if (Object.keys(validUpdates).length === 0) {
      return res.status(400).json({ message: "No valid fields provided for update." });
    }

    const updatedUser = await User.findOneAndUpdate(
      { auth0Id },
      {
        $set: {
          websiteNotificationSettings: validUpdates,
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.json({
      message: "Notification settings updated successfully.",
      notifications: updatedUser.websiteNotificationSettings,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

const updateAudioNotificationSettings = async (req, res) => {
  try {
    const auth0Id = req.user.user_id;
    const updates = req.body;

    const allowedFields = [
      "chatMessages",
      "incomingMeeting",
      "outgoingMeeting",
      "userJoinMeeting",
    ];

    const validUpdates = {};
    Object.keys(updates).forEach((key) => {
      if (allowedFields.includes(key) && typeof updates[key] === "boolean") {
        validUpdates[`audioNotificationSettings.${key}`] = updates[key];
      }
    });

    if (Object.keys(validUpdates).length === 0) {
      return res.status(400).json({ message: "No valid fields provided for update." });
    }

    const updatedUser = await User.findOneAndUpdate(
      { auth0Id },
      { $set: validUpdates },
      { new: true, select: "audioNotificationSettings" }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.json({
      message: "Audio notification settings updated successfully.",
      audioNotificationSettings: updatedUser.audioNotificationSettings,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

module.exports = {
  getUserDocument,
  getMyUserDocument,
  updateUserDocument,
  updateAuth0UserProfilePicture,
  updateWebsiteNotificationSettings,
  getUserSetUpStatus,
  updateAudioNotificationSettings,
  retakeSteps,
};