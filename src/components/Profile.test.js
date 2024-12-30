
// src/components/Profile.test.js

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useAuth } from '../contexts/AuthContext';
import Profile from './Profile';
import * as api from '../services/api';
import YourBets from './YourBets';

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

    // Mock the useAuth hook
    useAuth.mockReturnValue({
      token: 'mock-token',
      user: { id: 'user1', name: 'Test User' },
      logout: jest.fn(),
    });
  });

  test('renders profile information for logged-in user with balance and bets', async () => {
    const mockBalance = 500;
    api.getUserBalance.mockResolvedValue(mockBalance);

    render(<Profile />);

    expect(screen.getByText('Your Profile')).toBeInTheDocument();
    expect(screen.getByText(/Loading balance.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Token Balance/i)).toBeInTheDocument();
      expect(screen.getByText(`${mockBalance} PTK`)).toBeInTheDocument();
    });

    // Verify that YourBets component is rendered
    expect(screen.getByTestId('your-bets-mock')).toBeInTheDocument();
  });

  test('renders error message when user is not logged in', async () => {
    useAuth.mockReturnValue({
      token: null,
      user: null,
      logout: jest.fn(),
    });

    render(<Profile />);

    expect(screen.getByText('Your Profile')).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByText(/Please log in to view your balance./i)
      ).toBeInTheDocument();
    });

    // YourBets component should still render but show its own message
    expect(screen.getByTestId('your-bets-mock')).toBeInTheDocument();
  });

  test('handles fetch balance error gracefully', async () => {
    const mockError = 'Invalid token';
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    api.getUserBalance.mockRejectedValue(new Error(mockError));

    render(<Profile />);

    expect(screen.getByText('Your Profile')).toBeInTheDocument();
    expect(screen.getByText(/Loading balance.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(mockError)).toBeInTheDocument();
    });

    // YourBets component should still render but show its own message
    expect(screen.getByTestId('your-bets-mock')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
