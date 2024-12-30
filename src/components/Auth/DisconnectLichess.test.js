
// src/components/Auth/DisconnectLichess.test.js

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DisconnectLichess from './DisconnectLichess';

// Mock window.confirm
beforeAll(() => {
  global.confirm = jest.fn();
});

// Restore window.confirm after tests
afterAll(() => {
  global.confirm.mockRestore();
});

// Mock fetch globally
beforeEach(() => {
  global.fetch = jest.fn();
  localStorage.clear();
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('DisconnectLichess Component', () => {
  test('renders Disconnect button', () => {
    render(<DisconnectLichess />);
    expect(screen.getByText(/Disconnect Lichess Account/i)).toBeInTheDocument();
  });

  test('handles successful disconnection', async () => {
    // Mock confirmation
    global.confirm.mockReturnValueOnce(true);

    // Mock API response without body expectation
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Disconnected successfully' }),
    });

    // Set token in localStorage
    localStorage.setItem('token', 'valid-token');

    render(<DisconnectLichess />);

    const button = screen.getByText(/Disconnect Lichess Account/i);
    fireEvent.click(button);

    expect(button).toBeDisabled();
    expect(screen.getByText(/Disconnecting.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Lichess account disconnected successfully./i)).toBeInTheDocument();
      expect(fetch).toHaveBeenCalledWith('/auth/lichess/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token',
        },
        // Ensure no body is sent
      });
      // Optionally, check if the page reloads or redirects
    });
  });

  test('handles disconnection cancellation', () => {
    // Mock cancellation
    global.confirm.mockReturnValueOnce(false);

    render(<DisconnectLichess />);

    const button = screen.getByText(/Disconnect Lichess Account/i);
    fireEvent.click(button);

    expect(button).not.toBeDisabled();
    expect(screen.queryByText(/Disconnecting.../i)).not.toBeInTheDocument();
  });

  test('handles API failure during disconnection', async () => {
    // Mock confirmation
    global.confirm.mockReturnValueOnce(true);

    // Mock API failure with detailed error message
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Failed to disconnect Lichess account.' }),
    });

    // Set token in localStorage
    localStorage.setItem('token', 'valid-token');

    render(<DisconnectLichess />);

    const button = screen.getByText(/Disconnect Lichess Account/i);
    fireEvent.click(button);

    expect(button).toBeDisabled();
    expect(screen.getByText(/Disconnecting.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Failed to disconnect Lichess account./i)).toBeInTheDocument();
      expect(fetch).toHaveBeenCalledWith('/auth/lichess/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token',
        },
        // Ensure no body is sent
      });
    });
  });

  test('shows error when no token is present', () => {
    // Mock confirmation
    global.confirm.mockReturnValueOnce(true);

    render(<DisconnectLichess />);

    const button = screen.getByText(/Disconnect Lichess Account/i);
    fireEvent.click(button);

    expect(screen.getByText(/Please log in to disconnect your Lichess account./i)).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });
});

