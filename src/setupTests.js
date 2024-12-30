
// src/setupTests.js
import '@testing-library/jest-dom';
import 'jest-localstorage-mock'; // Re-enable the mock
import fetchMock from 'jest-fetch-mock';
fetchMock.enableMocks();

// Mock window.open to prevent actual navigation
beforeAll(() => {
  global.open = jest.fn();

  // Mock Date.prototype.toLocaleString to return a consistent date string
  jest.spyOn(Date.prototype, 'toLocaleString').mockImplementation(() => '1/1/2024, 12:00:00 PM');
});

afterAll(() => {
  global.open.mockRestore();

  // Restore Date.prototype.toLocaleString to its original implementation
  Date.prototype.toLocaleString.mockRestore();
});

// Suppress specific React Router warnings
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = (msg, ...args) => {
    if (
      msg.includes('React Router Future Flag Warning') ||
      msg.includes('Relative route resolution within Splat routes is changing')
    ) {
      return;
    }
    originalWarn(msg, ...args);
  };
});

afterAll(() => {
  console.warn = originalWarn;
});

