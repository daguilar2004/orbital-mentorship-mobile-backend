// Mock matching service for development
// TODO: Implement real mentor matching functionality

const findMentorMatches = async (menteeId, criteria) => {
  // Mock implementation - return empty array
  console.log('Mock find mentor matches:', menteeId, criteria);
  return [];
};

module.exports = {
  findMentorMatches,
};