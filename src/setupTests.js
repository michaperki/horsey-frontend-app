
// frontend/src/setupTests.js
import '@testing-library/jest-dom';
import fetchMock from 'jest-fetch-mock';
fetchMock.enableMocks();

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

