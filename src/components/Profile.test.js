
// src/components/Profile.test.js

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useAuth } from '../contexts/AuthContext';
import Profile from './Profile';
import * as api from '../services/api';

// Mock the API service
jest.mock('../services/api');
jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));
// Mock the YourBets component to isolate Profile tests
jest.mock('./YourBets', () => () => <div data-testid="your-bets-mock">Your Bets Mock</div>);

describe('Profile Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock the useAuth hook with default logged-in state
    useAuth.mockReturnValue({
      token: 'mock-token',
      user: { id: 'user1', name: 'Test User' },
      logout: jest.fn(),
    });

    // Default mocks for API calls
    api.getUserBalance.mockResolvedValue(500); // Default balance
    api.getUserBets.mockResolvedValue([]); // Default bets
    api.getUserLichessInfo.mockResolvedValue(null); // Default Lichess info
  });

  test('renders profile information for logged-in user with balance and bets', async () => {
    const mockBalance = 500;
    const mockBets = [{ id: 1, name: 'Bet 1' }, { id: 2, name: 'Bet 2' }];
    api.getUserBalance.mockResolvedValue(mockBalance);
    api.getUserBets.mockResolvedValue(mockBets); // Mock bets

    render(<Profile />);

    expect(screen.getByText('Your Profile')).toBeInTheDocument();
    expect(screen.getByText(/Loading balance.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Token Balance/i)).toBeInTheDocument();
      expect(screen.getByText(`${mockBalance} PTK`)).toBeInTheDocument();
    });

    // Verify that YourBets component is rendered with mock data
    expect(screen.getByTestId('your-bets-mock')).toBeInTheDocument();
  });

  test('renders "No active bets" message when user has no bets', async () => {
    const mockBalance = 300;
    api.getUserBalance.mockResolvedValue(mockBalance);
    api.getUserBets.mockResolvedValue([]); // No bets

    render(<Profile />);

    expect(screen.getByText('Your Profile')).toBeInTheDocument();
    expect(screen.getByText(/Loading balance.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Token Balance/i)).toBeInTheDocument();
      expect(screen.getByText(`${mockBalance} PTK`)).toBeInTheDocument();
    });

    // Since there are no bets, YourBets should not render
    expect(screen.queryByTestId('your-bets-mock')).not.toBeInTheDocument();
    expect(screen.getByText(/You have no active bets./i)).toBeInTheDocument();
  });

  test('renders "No balance available" message when user is not logged in', async () => {
    useAuth.mockReturnValue({
      token: null,
      user: null,
      logout: jest.fn(),
    });

    render(<Profile />);

    expect(screen.getByText('Your Profile')).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByText(/No balance available./i)
      ).toBeInTheDocument();
    });

    // Since user is not logged in, "You have no active bets." should be displayed instead of the YourBets component
    expect(screen.getByText(/You have no active bets./i)).toBeInTheDocument();
    expect(screen.queryByTestId('your-bets-mock')).not.toBeInTheDocument();
  });

  test('handles fetch balance error gracefully', async () => {
    const mockError = 'Invalid token';
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    api.getUserBalance.mockRejectedValue(new Error(mockError));
    api.getUserBets.mockResolvedValue([]); // Ensure bets are mocked

    render(<Profile />);

    expect(screen.getByText('Your Profile')).toBeInTheDocument();
    expect(screen.getByText(/Loading balance.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(mockError)).toBeInTheDocument();
    });

    // Since fetching bets is independent, ensure "You have no active bets." is displayed
    expect(screen.getByText(/You have no active bets./i)).toBeInTheDocument();
    expect(screen.queryByTestId('your-bets-mock')).not.toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  // Add more tests as needed, ensuring all API calls are properly mocked
});

