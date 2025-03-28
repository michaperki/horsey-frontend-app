// src/setupTests.js
import '@testing-library/jest-dom';
import fetchMock from 'jest-fetch-mock';

// Mock axios globally before any imports happen
jest.mock('axios', () => {
  // Create the mock implementation first
  const mockImplementation = {
    defaults: { headers: { common: {} } },
    get: jest.fn().mockResolvedValue({ data: {} }),
    post: jest.fn().mockResolvedValue({ data: {} }),
    put: jest.fn().mockResolvedValue({ data: {} }),
    delete: jest.fn().mockResolvedValue({ data: {} }),
    patch: jest.fn().mockResolvedValue({ data: {} }),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() }
    },
    isAxiosError: jest.fn().mockReturnValue(false)
  };
  
  // Then add the create method that returns the implementation
  mockImplementation.create = jest.fn().mockReturnValue(mockImplementation);
  
  return mockImplementation;
});

// Mock socket.io-client globally - this solves the import issue
jest.mock('socket.io-client', () => {
  // Create a mock io function that returns a mock socket
  const mockIO = jest.fn(() => ({
    on: jest.fn(),
    emit: jest.fn(),
    off: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    id: 'mock-socket-id',
  }));
  
  // Make it work with different ways of importing
  mockIO.connect = mockIO; // For io.connect() style
  return mockIO;
});

// Enable fetch mocks
fetchMock.enableMocks();

// Mock window.localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

// Set up process.env values for tests
process.env.REACT_APP_API_URL = 'http://localhost:5000';

// Mock window.open to prevent actual navigation
global.open = jest.fn();

// Set up URL and location properly for React Router in Jest environment
// This is crucial for fixing the "No window.location.(origin|href) available" error
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000/',
    origin: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: '',
    assign: jest.fn(),
    replace: jest.fn(),
  },
  writable: true,
});

// Ensure URL constructor works in the jest environment
global.URL = URL;

// Mock window object with localStorage
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock scrollTo
window.scrollTo = jest.fn();

// Mock console methods to suppress certain warnings
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args) => {
  // Filter out specific React warnings and errors
  if (typeof args[0] === 'string' && 
      (args[0].includes('ReactDOM.render is no longer supported') ||
       args[0].includes('act(...)') ||
       args[0].includes('Warning: React does not recognize the') ||
       args[0].includes('No window.location.(origin|href) available') ||
       args[0].includes('socket.io') ||
       args[0].includes('is not a function'))) {
    return;
  }
  originalConsoleError(...args);
};

console.warn = (...args) => {
  // Filter out specific React warnings
  if (typeof args[0] === 'string' && 
      (args[0].includes('React Router Future Flag Warning') ||
       args[0].includes('Relative route resolution within Splat routes is changing'))) {
    return;
  }
  originalConsoleWarn(...args);
};

// Mock Date.prototype.toLocaleString to return a consistent date string
jest.spyOn(Date.prototype, 'toLocaleString').mockImplementation(() => '1/1/2024, 12:00:00 PM');

// Clean up after tests
afterEach(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  jest.restoreAllMocks();
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});