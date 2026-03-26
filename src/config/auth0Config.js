// Mock Auth0 configuration for development
// TODO: Replace with real Auth0 configuration when login is implemented

const auth0ManagementClient = {
  // Mock Auth0 management client
  users: {
    update: async (userId, data) => {
      console.log('Mock Auth0 update:', userId, data);
      return { user_id: userId, ...data };
    }
  }
};

module.exports = {
  auth0ManagementClient,
};