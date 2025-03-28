// src/features/auth/components/DisconnectLichess.test.js

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DisconnectLichess from './DisconnectLichess';
import fetchMock from 'jest-fetch-mock';

// Mock the API
jest.mock('../services/api', () => ({
  disconnectLichessAccount: jest.fn()
}));

// Mock the Auth Context
jest.mock('features/auth/contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

// Mock window.confirm
global.confirm = jest.fn();

describe('DisconnectLichess Component', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    jest.clearAllMocks();
    global.confirm.mockClear();
  });

  test('renders disconnect button', () => {
    // Mock useAuth hook to return a token
    const { useAuth } = require('features/auth/contexts/AuthContext');
    useAuth.mockReturnValue({ token: 'fake-token' });

    render(<DisconnectLichess />);

    // Check for disconnect button
    expect(screen.getByText(/Disconnect Lichess/i)).toBeInTheDocument();
  });

  test('shows error when not logged in', () => {
    // Mock useAuth hook to return no token
    const { useAuth } = require('features/auth/contexts/AuthContext');
    useAuth.mockReturnValue({ token: null });

    render(<DisconnectLichess />);

    // Try to disconnect
    fireEvent.click(screen.getByText(/Disconnect Lichess/i));

    // Check for error message
    expect(screen.getByText(/Please log in to disconnect your Lichess account/i)).toBeInTheDocument();
  });

  test('asks for confirmation before disconnecting', async () => {
    // Mock window.confirm to return true
    global.confirm.mockReturnValue(true);

    // Mock useAuth hook to return a token
    const { useAuth } = require('features/auth/contexts/AuthContext');
    useAuth.mockReturnValue({ token: 'fake-token' });

    // Mock disconnectLichessAccount API to resolve successfully
    const { disconnectLichessAccount } = require('../services/api');
    disconnectLichessAccount.mockResolvedValue({ success: true });

    // Add onDisconnect prop
    const mockOnDisconnect = jest.fn();
    render(<DisconnectLichess onDisconnect={mockOnDisconnect} />);

    // Trigger disconnect
    fireEvent.click(screen.getByText(/Disconnect Lichess/i));

    // Check if confirmation was requested
    expect(global.confirm).toHaveBeenCalled();
    expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to disconnect your Lichess account?');

    // Check if API was called
    await waitFor(() => {
      expect(disconnectLichessAccount).toHaveBeenCalled();
    });

    // Check if callback was called
    expect(mockOnDisconnect).toHaveBeenCalled();
  });

  test('does not disconnect if user cancels confirmation', () => {
    // Mock window.confirm to return false
    global.confirm.mockReturnValue(false);

    // Mock useAuth hook to return a token
    const { useAuth } = require('features/auth/contexts/AuthContext');
    useAuth.mockReturnValue({ token: 'fake-token' });

    // Mock disconnectLichessAccount API
    const { disconnectLichessAccount } = require('../services/api');
    disconnectLichessAccount.mockResolvedValue({ success: true });

    const mockOnDisconnect = jest.fn();
    render(<DisconnectLichess onDisconnect={mockOnDisconnect} />);

    // Trigger disconnect
    fireEvent.click(screen.getByText(/Disconnect Lichess/i));

    // Check if confirmation was requested
    expect(global.confirm).toHaveBeenCalled();

    // API should not be called
    expect(disconnectLichessAccount).not.toHaveBeenCalled();

    // Callback should not be called
    expect(mockOnDisconnect).not.toHaveBeenCalled();
  });

  test('handles error during disconnection', async () => {
    // Mock window.confirm to return true
    global.confirm.mockReturnValue(true);

    // Mock useAuth hook to return a token
    const { useAuth } = require('features/auth/contexts/AuthContext');
    useAuth.mockReturnValue({ token: 'fake-token' });

    // Mock disconnectLichessAccount API to reject with an error
    const { disconnectLichessAccount } = require('../services/api');
    disconnectLichessAccount.mockRejectedValue(new Error('Failed to disconnect'));

    render(<DisconnectLichess />);

    // Trigger disconnect
    fireEvent.click(screen.getByText(/Disconnect Lichess/i));

    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/Failed to disconnect/i)).toBeInTheDocument();
    });
  });
});