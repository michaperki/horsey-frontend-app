// __mocks__/socket.io-client.js

// Properly implement the io export so it can be imported correctly
const mockIO = jest.fn(() => ({
    on: jest.fn(),
    emit: jest.fn(),
    off: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    id: 'mock-socket-id',
  }));
  
  // Export the mock as both default and named export to support different import styles
  module.exports = mockIO;
  module.exports.io = mockIO;
  module.exports.default = mockIO;