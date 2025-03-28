// __mocks__/apiFetch.js
const mockApiFetch = jest.fn().mockImplementation((endpoint, options = {}) => {
    // Default successful response
    return Promise.resolve({
      // You can customize default responses based on endpoint
      token: 'mock-token',
      user: {
        id: 'user123',
        username: 'testuser',
        email: 'test@example.com'
      },
      bets: [],
      notifications: [],
      products: [],
      tokenBalance: 100,
      sweepstakesBalance: 50,
      // Add other common response fields here
    });
  });
  
  module.exports = mockApiFetch;