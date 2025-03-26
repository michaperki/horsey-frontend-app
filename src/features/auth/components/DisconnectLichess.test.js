
// src/components/Auth/DisconnectLichess.test.js

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import DisconnectLichess from './DisconnectLichess';
import { useAuth } from '../../contexts/AuthContext';
import fetchMock from 'jest-fetch-mock';

// Mock dependencies
jest.mock('../../contexts/AuthContext');

fetchMock.enableMocks();

describe('DisconnectLichess Component', () => {
  const mockOnDisconnect = jest.fn();

  beforeEach(() => {
    // Mock useAuth to return a valid token
    useAuth.mockReturnValue({
      token: 'valid-token',
    });

    // Clear previous mocks
    fetchMock.resetMocks();
    mockOnDisconnect.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders Disconnect button', () => {
    render(<DisconnectLichess onDisconnect={mockOnDisconnect} />);
    const button = screen.getByText(/Disconnect Lichess/i);
    expect(button).toBeInTheDocument();
  });

  test('handles successful disconnection', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ success: true }), { status: 200 });

    // Mock window.confirm to always return true
    window.confirm = jest.fn().mockReturnValue(true);

    render(<DisconnectLichess onDisconnect={mockOnDisconnect} />);
    const button = screen.getByText(/Disconnect Lichess/i);
    fireEvent.click(button);

    expect(button).toBeDisabled();
    expect(button).toHaveTextContent(/Disconnecting.../i);

    await waitFor(() => expect(mockOnDisconnect).toHaveBeenCalledTimes(1));
    expect(button).not.toBeDisabled();
    expect(button).toHaveTextContent(/Disconnect Lichess/i);
  });

  test('handles disconnection cancellation', () => {
    // Mock window.confirm to return false
    window.confirm = jest.fn().mockReturnValue(false);

    render(<DisconnectLichess onDisconnect={mockOnDisconnect} />);
    const button = screen.getByText(/Disconnect Lichess/i);
    fireEvent.click(button);

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to disconnect your Lichess account?');
    expect(mockOnDisconnect).not.toHaveBeenCalled();
  });

  test('handles API failure during disconnection', async () => {
    fetchMock.mockRejectOnce(new Error('API failure'));

    // Mock window.confirm to always return true
    window.confirm = jest.fn().mockReturnValue(true);

    render(<DisconnectLichess onDisconnect={mockOnDisconnect} />);
    const button = screen.getByText(/Disconnect Lichess/i);
    fireEvent.click(button);

    expect(button).toBeDisabled();
    expect(button).toHaveTextContent(/Disconnecting.../i);

    await waitFor(() => expect(screen.getByText(/API failure/i)).toBeInTheDocument());
    expect(button).not.toBeDisabled();
    expect(button).toHaveTextContent(/Disconnect Lichess/i);
  });

  test('shows error when no token is present', () => {
    // Mock useAuth to return no token
    useAuth.mockReturnValue({
      token: null,
    });

    render(<DisconnectLichess onDisconnect={mockOnDisconnect} />);
    const button = screen.getByText(/Disconnect Lichess/i);
    fireEvent.click(button);

    expect(screen.getByText(/Please log in to disconnect your Lichess account./i)).toBeInTheDocument();
    expect(mockOnDisconnect).not.toHaveBeenCalled();
  });
});

