// src/setupTests.js
import '@testing-library/jest-dom';
// Remove or comment out the jest-localstorage-mock import
// import 'jest-localstorage-mock'; 
import fetchMock from 'jest-fetch-mock';
fetchMock.enableMocks();

// Mock window.open
beforeAll(() => {
  global.open = jest.fn();
});

afterAll(() => {
  global.open.mockRestore();
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
