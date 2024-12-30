// src/components/Auth/UserLogin.test.js

// 1. Mock react-router-dom and AuthContext BEFORE importing the component
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

jest.mock('../../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// 2. Now import the necessary modules AFTER mocking
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import UserLogin from './UserLogin'; // Import after mocks
import { useAuth } from '../../contexts/AuthContext'; // Import after mock

describe('UserLogin Component', () => {
  const mockNavigate = jest.fn();
  const mockLogin = jest.fn();

  // Spy on localStorage.setItem
  let setItemSpy;

  beforeEach(() => {
    // 3. Setup mocks

    // Mock useNavigate to return mockNavigate
    const { useNavigate } = require('react-router-dom');
    useNavigate.mockReturnValue(mockNavigate);

    // Mock useAuth to return mockLogin
    useAuth.mockReturnValue({
      login: mockLogin.mockImplementation((token) => {
        localStorage.setItem('token', token); // Set token in localStorage
      }),
    });

    // 4. Mock fetch globally
    global.fetch = jest.fn();

    // 5. Spy on localStorage.setItem
    setItemSpy = jest.spyOn(Storage.prototype, 'setItem');

    // 6. Clear all mocks before each test
    mockNavigate.mockClear();
    mockLogin.mockClear();
    fetch.mockClear();
    localStorage.clear(); // Clears localStorage
    setItemSpy.mockClear(); // Clears setItem spy
  });

  afterEach(() => {
    // Restore all mocks after each test
    jest.restoreAllMocks();
  });

  test('renders login form', () => {
    render(
      <BrowserRouter>
        <UserLogin />
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  });

  test('handles successful login', async () => {
    // Mock the fetch response for a successful login
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ token: 'fake-token' }),
      })
    );

    render(
      <BrowserRouter>
        <UserLogin />
      </BrowserRouter>
    );

    // Simulate user input
    fireEvent.change(screen.getByPlaceholderText(/Email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), {
      target: { value: 'password123' },
    });

    // Simulate form submission
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    // Wait for asynchronous actions to complete
    await waitFor(() => {
      // Ensure mockLogin was called with 'fake-token'
      expect(mockLogin).toHaveBeenCalledWith('fake-token');

      // Ensure navigation to '/dashboard' was called
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');

      // Check if localStorage.setItem was called with correct arguments
      expect(setItemSpy).toHaveBeenCalledWith('token', 'fake-token');

      // Check if localStorage has 'token' set correctly
      expect(localStorage.getItem('token')).toBe('fake-token');

      // Check if success message is displayed
      expect(screen.getByText(/Login successful./i)).toBeInTheDocument();
    });
  });

  test('handles login error', async () => {
    // Mock the fetch response for a failed login
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Invalid credentials' }),
      })
    );

    render(
      <BrowserRouter>
        <UserLogin />
      </BrowserRouter>
    );

    // Simulate form submission without entering credentials
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    // Wait for asynchronous actions to complete
    await waitFor(() => {
      // Ensure mockLogin was not called
      expect(mockLogin).not.toHaveBeenCalled();

      // Check if error message is displayed
      expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
    });
  });
});
