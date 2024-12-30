// src/components/Auth/LichessCallback.test.js

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import LichessCallback from './LichessCallback';

// Mock the navigate function from react-router-dom
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('LichessCallback Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the global fetch function
    global.fetch = jest.fn();
  });

  afterEach(() => {
    // Restore real timers after each test
    jest.useRealTimers();
    // Restore the original fetch implementation
    global.fetch.mockRestore();
  });

  test('displays error when no authorization code is present', async () => {
    render(
      <MemoryRouter initialEntries={['/auth/lichess/callback']}>
        <Routes>
          <Route path="/auth/lichess/callback" element={<LichessCallback />} />
        </Routes>
      </MemoryRouter>
    );

    // Directly check for the error message without expecting the initial "Processing..." message
    await waitFor(() => {
      expect(
        screen.getByText(/Authorization code not found. Please try connecting again./i)
      ).toBeInTheDocument();
    });

    // Ensure fetch was not called since no code was provided
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('handles successful connection', async () => {
    // Enable fake timers for this test to handle setTimeout
    jest.useFakeTimers();

    // Mock a successful response from the backend
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(
      <MemoryRouter initialEntries={['/auth/lichess/callback?code=authcode123&state=xyz']}>
        <Routes>
          <Route path="/auth/lichess/callback" element={<LichessCallback />} />
        </Routes>
      </MemoryRouter>
    );

    // The initial message should be present
    expect(screen.getByText(/Processing your connection.../i)).toBeInTheDocument();

    // Wait for the success message to appear
    await waitFor(() => {
      expect(
        screen.getByText(/Lichess account connected successfully!/i)
      ).toBeInTheDocument();
    });

    // Advance timers by 2000ms to trigger navigation
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // Check if navigate was called with '/profile'
    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });

  test('handles connection failure from backend', async () => {
    // Ensure real timers are used for this test
    jest.useRealTimers();

    // Mock a failure response from the backend
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Invalid authorization code' }),
    });

    render(
      <MemoryRouter initialEntries={['/auth/lichess/callback?code=invalid&state=xyz']}>
        <Routes>
          <Route path="/auth/lichess/callback" element={<LichessCallback />} />
        </Routes>
      </MemoryRouter>
    );

    // The initial message should be present
    expect(screen.getByText(/Processing your connection.../i)).toBeInTheDocument();

    // Wait for the error message to appear
    await waitFor(() => {
      expect(
        screen.getByText(/Invalid authorization code/i)
      ).toBeInTheDocument();
    });

    // Ensure navigate was not called
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('handles network errors gracefully', async () => {
    // Ensure real timers are used for this test
    jest.useRealTimers();

    // Mock a network error
    global.fetch.mockRejectedValueOnce(new Error('Network Error'));

    render(
      <MemoryRouter initialEntries={['/auth/lichess/callback?code=authcode123&state=xyz']}>
        <Routes>
          <Route path="/auth/lichess/callback" element={<LichessCallback />} />
        </Routes>
      </MemoryRouter>
    );

    // The initial message should be present
    expect(screen.getByText(/Processing your connection.../i)).toBeInTheDocument();

    // Wait for the unexpected error message to appear
    await waitFor(() => {
      expect(
        screen.getByText(/An unexpected error occurred. Please try again./i)
      ).toBeInTheDocument();
    });

    // Ensure navigate was not called
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
