
// src/components/Auth/DisconnectLichess.test.js

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DisconnectLichess from './DisconnectLichess';

// Mock window.confirm
beforeAll(() => {
  global.confirm = jest.fn();
});

afterAll(() => {
  global.confirm.mockRestore();
});

describe('DisconnectLichess Component', () => {
  beforeEach(() => {
    fetch.resetMocks();
    localStorage.clear();
  });

  test('renders Disconnect button', () => {
    render(<DisconnectLichess />);
    expect(screen.getByText(/Disconnect Lichess Account/i)).toBeInTheDocument();
  });

  test('handles successful disconnection', async () => {
    // Mock confirmation
    global.confirm.mockReturnValueOnce(true);

    // Mock API response
    fetch.mockResponseOnce(JSON.stringify({ message: 'Disconnected successfully' }), { status: 200 });

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
        body: JSON.stringify({}),
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

    // Mock API failure
    fetch.mockResponseOnce(JSON.stringify({ error: 'Failed to disconnect' }), { status: 500 });

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
        body: JSON.stringify({}),
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
