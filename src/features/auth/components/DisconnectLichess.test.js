// src/features/auth/components/DisconnectLichess.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DisconnectLichess from './DisconnectLichess';
import fetchMock from 'jest-fetch-mock';
import { ApiErrorProvider } from 'features/common/contexts/ApiErrorContext';

// Mock the API
jest.mock('../services/api', () => ({
  disconnectLichessAccount: jest.fn()
}));

// Mock the Auth Context
jest.mock('features/auth/contexts/AuthContext', () => ({
  useAuth: jest.fn()
}));

describe('DisconnectLichess Component', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    jest.clearAllMocks();
  });

  const renderWithProviders = (ui) => {
    return render(
      <ApiErrorProvider>
        {ui}
      </ApiErrorProvider>
    );
  };

  test('renders disconnect button', () => {
    const { useAuth } = require('features/auth/contexts/AuthContext');
    useAuth.mockReturnValue({ token: 'fake-token' });

    renderWithProviders(<DisconnectLichess />);

    expect(screen.getByText(/Disconnect Lichess/i)).toBeInTheDocument();
  });

  test('shows error when not logged in', () => {
    const { useAuth } = require('features/auth/contexts/AuthContext');
    useAuth.mockReturnValue({ token: null });

    renderWithProviders(<DisconnectLichess />);

    fireEvent.click(screen.getByText(/Disconnect Lichess/i));

    expect(screen.getByText(/Please log in to disconnect your Lichess account/i)).toBeInTheDocument();
  });

  test('asks for confirmation before disconnecting', async () => {
    const { useAuth } = require('features/auth/contexts/AuthContext');
    useAuth.mockReturnValue({ token: 'fake-token' });
    const { disconnectLichessAccount } = require('../services/api');
    disconnectLichessAccount.mockResolvedValue({ success: true });

    const mockOnDisconnect = jest.fn();
    renderWithProviders(<DisconnectLichess onDisconnect={mockOnDisconnect} />);

    // Click initial disconnect button
    fireEvent.click(screen.getByText(/Disconnect Lichess/i));

    // Confirmation dialog should appear
    expect(screen.getByText(/Confirm Disconnect/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Are you sure you want to disconnect your Lichess account/i)
    ).toBeInTheDocument();

    // Click the confirm button (matching exact "Disconnect" text)
    fireEvent.click(screen.getByText(/^Disconnect$/i));

    await waitFor(() => {
      expect(disconnectLichessAccount).toHaveBeenCalled();
    });
    expect(mockOnDisconnect).toHaveBeenCalled();
  });

  test('does not disconnect if user cancels confirmation', () => {
    const { useAuth } = require('features/auth/contexts/AuthContext');
    useAuth.mockReturnValue({ token: 'fake-token' });
    const { disconnectLichessAccount } = require('../services/api');
    disconnectLichessAccount.mockResolvedValue({ success: true });

    const mockOnDisconnect = jest.fn();
    renderWithProviders(<DisconnectLichess onDisconnect={mockOnDisconnect} />);

    fireEvent.click(screen.getByText(/Disconnect Lichess/i));

    // Confirmation dialog should appear
    expect(screen.getByText(/Confirm Disconnect/i)).toBeInTheDocument();

    // Click cancel button
    fireEvent.click(screen.getByText(/Cancel/i));

    expect(disconnectLichessAccount).not.toHaveBeenCalled();
    expect(mockOnDisconnect).not.toHaveBeenCalled();
  });

  test('handles error during disconnection', async () => {
    const { useAuth } = require('features/auth/contexts/AuthContext');
    useAuth.mockReturnValue({ token: 'fake-token' });
    const { disconnectLichessAccount } = require('../services/api');
    disconnectLichessAccount.mockRejectedValue(new Error('Failed to disconnect'));

    renderWithProviders(<DisconnectLichess />);

    fireEvent.click(screen.getByText(/Disconnect Lichess/i));
    expect(screen.getByText(/Confirm Disconnect/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/^Disconnect$/i));

    await waitFor(() => {
      expect(
        screen.getByText((content) => content.includes('Failed to disconnect'))
      ).toBeInTheDocument();
    });
  });
});
