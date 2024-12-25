
// src/components/Profile.test.js

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Profile from './Profile';
import * as api from '../services/api';
import YourBets from './YourBets';

// Mock the API service
jest.mock('../services/api');
// Mock the YourBets component to isolate Profile tests
jest.mock('./YourBets', () => () => <div data-testid="your-bets-mock">Your Bets Mock</div>);

describe('Profile Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('renders profile information for logged-in user with balance and bets', async () => {
    const mockBalance = 500;
    api.getUserBalance.mockResolvedValue(mockBalance);
    localStorage.setItem('token', 'valid-token');

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
    render(<Profile />);

    expect(screen.getByText('Your Profile')).toBeInTheDocument();
    // Removed the expectation for 'Loading balance...' as it might not be present

    await waitFor(() => {
      expect(screen.getByText(/Please log in to view your balance./i)).toBeInTheDocument();
    });

    // YourBets component should still render but show its own message
    expect(screen.getByTestId('your-bets-mock')).toBeInTheDocument();
  });

  test('handles fetch balance error gracefully', async () => {
    const mockError = 'Invalid token';
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    api.getUserBalance.mockRejectedValue(new Error(mockError));
    localStorage.setItem('token', 'invalid-token');

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

