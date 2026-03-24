// Mock feedback controller for development
// TODO: Implement real feedback functionality

const createFeedback = async (req, res) => {
  try {
    const { userId } = req.params;
    const feedbackData = req.body;

    // Mock feedback creation - just log and return success
    console.log('Mock feedback created:', { userId, ...feedbackData });

    res.status(201).json({
      message: "Feedback created successfully",
      userId,
      ...feedbackData
    });
  } catch (error) {
    console.error("Failed to create feedback:", error);
    res.status(500).json({ message: "Failed to create feedback" });
  }
};

module.exports = {
  createFeedback,
};