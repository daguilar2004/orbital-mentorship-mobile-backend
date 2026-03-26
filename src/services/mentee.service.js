// Mock mentee service for development
// TODO: Implement real mentee service functionality

const saveQuestionnaireAnswers = async (menteeId, answers) => {
  // Mock implementation - just log and return success
  console.log('Mock save questionnaire answers:', menteeId, answers);
  return { success: true, menteeId, answers };
};

module.exports = {
  saveQuestionnaireAnswers,
};