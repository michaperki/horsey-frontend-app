// src/components/Profile.test.js

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useAuth } from '../contexts/AuthContext';
import Profile from './Profile';
import * as api from '../services/api';

// Mock the AuthContext
jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock the API functions
jest.mock('../services/api', () => ({
  getUserBalance: jest.fn(),
  getUserBets: jest.fn(),
  getUserLichessInfo: jest.fn(),
}));

// Mock child components to isolate Profile tests
jest.mock('./YourBets', () => () => <div data-testid="your-bets-mock">Your Bets Mock</div>);
jest.mock('./LichessInfo', () => () => <div data-testid="lichess-info-mock">Lichess Info Mock</div>);
jest.mock('./Auth/DisconnectLichess', () => () => <button>Disconnect Lichess</button>);
jest.mock('./Auth/LichessConnect', () => () => <button>Connect Lichess</button>);

describe('Profile Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    useAuth.mockReset();
    api.getUserBalance.mockReset();
    api.getUserBets.mockReset();
    api.getUserLichessInfo.mockReset();
  });

  test('renders profile information for logged-in user with balance and bets', async () => {
    // Mock authenticated user
    useAuth.mockReturnValue({
      token: 'mock-token',
      user: { id: 'user1', name: 'Test User' },
      login: jest.fn(),
      logout: jest.fn(),
    });

    // Mock API responses
    api.getUserBalance.mockResolvedValueOnce(500); // Mock balance
    api.getUserBets.mockResolvedValueOnce({
      bets: [
        { id: 'bet1', name: 'Bet 1' },
        { id: 'bet2', name: 'Bet 2' },
      ],
    }); // Mock bets
    api.getUserLichessInfo.mockResolvedValueOnce({
      username: 'testuser',
      rating: 1500,
    }); // Mock Lichess info

    render(<Profile />);

    // Check for loading states
    expect(screen.getByText(/Loading balance.../i)).toBeInTheDocument();
    expect(screen.getByText(/Loading Lichess information.../i)).toBeInTheDocument();
    expect(screen.getByText(/Loading your bets.../i)).toBeInTheDocument();

    // Wait for balance to load
    await waitFor(() => {
      expect(screen.getByText(/Token Balance/i)).toBeInTheDocument();
      expect(screen.getByText('500 PTK')).toBeInTheDocument();
    });

    // Wait for Lichess info to load
    await waitFor(() => {
      expect(screen.getByTestId('lichess-info-mock')).toBeInTheDocument();
      expect(screen.getByText('Disconnect Lichess')).toBeInTheDocument();
    });

    // Wait for bets to load
    await waitFor(() => {
      expect(screen.getByTestId('your-bets-mock')).toBeInTheDocument();
    });
  });

  test('renders "No active bets" message when user has no bets', async () => {
    // Mock authenticated user
    useAuth.mockReturnValue({
      token: 'mock-token',
      user: { id: 'user1', name: 'Test User' },
      login: jest.fn(),
      logout: jest.fn(),
    });

    // Mock API responses
    api.getUserBalance.mockResolvedValueOnce(300); // Mock balance
    api.getUserBets.mockResolvedValueOnce({ bets: [] }); // No bets
    api.getUserLichessInfo.mockResolvedValueOnce(null); // No Lichess info

    render(<Profile />);

    // Check for loading states
    expect(screen.getByText(/Loading balance.../i)).toBeInTheDocument();
    expect(screen.getByText(/Loading Lichess information.../i)).toBeInTheDocument();
    expect(screen.getByText(/Loading your bets.../i)).toBeInTheDocument();

    // Wait for balance to load
    await waitFor(() => {
      expect(screen.getByText(/Token Balance/i)).toBeInTheDocument();
      expect(screen.getByText('300 PTK')).toBeInTheDocument();
    });

    // Wait for Lichess info to load
    await waitFor(() => {
      expect(screen.getByText(/Your Lichess account is not connected./i)).toBeInTheDocument();
      expect(screen.getByText('Connect Lichess')).toBeInTheDocument();
    });

    // Wait for bets to load
    await waitFor(() => {
      expect(screen.getByText(/You have no active bets./i)).toBeInTheDocument();
      expect(screen.queryByTestId('your-bets-mock')).not.toBeInTheDocument();
    });
  });

  test('renders "No balance available" message when user is not logged in', async () => {
    // Mock unauthenticated user
    useAuth.mockReturnValue({
      token: null,
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
    });

    render(<Profile />);

    // Check for "Your Profile" heading
    expect(screen.getByText('Your Profile')).toBeInTheDocument();

    // Balance section should show "No balance available."
    await waitFor(() => {
      expect(screen.getByText(/No balance available./i)).toBeInTheDocument();
    });

    // Lichess section should prompt to connect
    expect(screen.getByText(/Your Lichess account is not connected./i)).toBeInTheDocument();
    expect(screen.getByText('Connect Lichess')).toBeInTheDocument();

    // Bets section should show "You have no active bets."
    expect(screen.getByText(/You have no active bets./i)).toBeInTheDocument();
    expect(screen.queryByTestId('your-bets-mock')).not.toBeInTheDocument();
  });

  test('handles fetch balance error gracefully', async () => {
    // Mock authenticated user
    useAuth.mockReturnValue({
      token: 'mock-token',
      user: { id: 'user1', name: 'Test User' },
      login: jest.fn(),
      logout: jest.fn(),
    });

    // Mock API responses
    api.getUserBalance.mockRejectedValueOnce(new Error('Invalid token'));
    api.getUserBets.mockResolvedValueOnce({ bets: [] }); // No bets
    api.getUserLichessInfo.mockResolvedValueOnce(null); // No Lichess info

    render(<Profile />);

    // Check for loading states
    expect(screen.getByText(/Loading balance.../i)).toBeInTheDocument();
    expect(screen.getByText(/Loading Lichess information.../i)).toBeInTheDocument();
    expect(screen.getByText(/Loading your bets.../i)).toBeInTheDocument();

    // Wait for balance error to load
    await waitFor(() => {
      expect(screen.getByText('Invalid token')).toBeInTheDocument();
    });

    // Lichess info should not show errors if `getUserLichessInfo` returns null
    expect(screen.getByText(/Your Lichess account is not connected./i)).toBeInTheDocument();

    // Bets section should still show "You have no active bets."
    expect(screen.getByText(/You have no active bets./i)).toBeInTheDocument();
    expect(screen.queryByTestId('your-bets-mock')).not.toBeInTheDocument();
  });

  test('handles fetch Lichess info error gracefully', async () => {
    // Mock authenticated user
    useAuth.mockReturnValue({
      token: 'mock-token',
      user: { id: 'user1', name: 'Test User' },
      login: jest.fn(),
      logout: jest.fn(),
    });

    // Mock API responses
    api.getUserBalance.mockResolvedValueOnce(400); // Mock balance
    api.getUserBets.mockResolvedValueOnce({
      bets: [
        { id: 'bet1', name: 'Bet 1' },
      ],
    }); // Mock bets
    api.getUserLichessInfo.mockRejectedValueOnce(new Error('Failed to fetch Lichess info')); // Mock Lichess info failure

    render(<Profile />);

    // Check for loading states
    expect(screen.getByText(/Loading balance.../i)).toBeInTheDocument();
    expect(screen.getByText(/Loading Lichess information.../i)).toBeInTheDocument();
    expect(screen.getByText(/Loading your bets.../i)).toBeInTheDocument();

    // Wait for balance to load
    await waitFor(() => {
      expect(screen.getByText(/Token Balance/i)).toBeInTheDocument();
      expect(screen.getByText('400 PTK')).toBeInTheDocument();
    });

    // Wait for Lichess info error to load
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch Lichess info')).toBeInTheDocument();
    });

    // Wait for bets to load
    await waitFor(() => {
      expect(screen.getByTestId('your-bets-mock')).toBeInTheDocument();
    });
  });
});
