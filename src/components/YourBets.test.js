// src/components/YourBets.test.js

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import YourBets from './YourBets';
import { getUserBets } from '../services/api'; // Import the actual function

// Explicitly mock the getUserBets function
jest.mock('../services/api', () => ({
  getUserBets: jest.fn(),
}));

beforeEach(() => {
  // Clear all instances and calls to constructor and all methods:
  getUserBets.mockClear();
  localStorage.clear();
});

test('renders Your Bets table with fetched data', async () => {
  const mockBetsData = {
    bets: [
      {
        _id: 'bet1',
        gameId: 'game123',
        creatorColor: 'white',
        finalWhiteId: { username: 'User1' },
        finalBlackId: { username: 'User2' },
        amount: 100,
        status: 'active',
        createdAt: '2024-01-01T12:00:00Z',
      },
    ],
    totalPages: 1,
  };

  // Mock the resolved value of getUserBets
  getUserBets.mockResolvedValue(mockBetsData);

  // Mock a valid token in localStorage
  const token = 'valid-token';
  localStorage.setItem('token', token);

  render(<YourBets />);

  // Wait for the getUserBets to be called
  await waitFor(() => expect(getUserBets).toHaveBeenCalledTimes(1));

  // Use findByText which returns a promise and waits for the element to appear
  expect(await screen.findByText(/Game ID/i)).toBeInTheDocument();
  expect(await screen.findByText(/Your Choice/i)).toBeInTheDocument();
  expect(await screen.findByText(/Final White/i)).toBeInTheDocument();
  expect(await screen.findByText(/Final Black/i)).toBeInTheDocument();
  expect(await screen.findByText(/Amount/i)).toBeInTheDocument();
  expect(await screen.findByText(/Status/i)).toBeInTheDocument();
  expect(await screen.findByText(/Date/i)).toBeInTheDocument();
  expect(await screen.findByText(/Game Link/i)).toBeInTheDocument();

  // Check if mock bet data is rendered
  expect(await screen.findByText('White')).toBeInTheDocument();
  expect(await screen.findByText('User1')).toBeInTheDocument();
  expect(await screen.findByText('User2')).toBeInTheDocument();
  expect(await screen.findByText('100')).toBeInTheDocument();
  expect(await screen.findByText('Active')).toBeInTheDocument();

  // Date formatting can vary based on locale, so use a regex or alternative matcher
  expect(await screen.findByText(/1\/1\/2024/i)).toBeInTheDocument();

  expect(await screen.findByText(/View Game/i)).toBeInTheDocument();
});

test('displays message when no bets are present', async () => {
  const mockBetsData = {
    bets: [],
    totalPages: 1,
  };

  // Mock the resolved value of getUserBets
  getUserBets.mockResolvedValue(mockBetsData);

  // Mock a valid token in localStorage
  const token = 'valid-token';
  localStorage.setItem('token', token);

  render(<YourBets />);

  await waitFor(() => expect(getUserBets).toHaveBeenCalledTimes(1));

  expect(await screen.findByText(/You have not placed any bets yet./i)).toBeInTheDocument();
});

test('handles API errors gracefully', async () => {
  // Mock getUserBets to reject with an error
  getUserBets.mockRejectedValue(new Error('API Error'));

  // Mock a valid token in localStorage
  const token = 'valid-token';
  localStorage.setItem('token', token);

  render(<YourBets />);

  await waitFor(() => expect(getUserBets).toHaveBeenCalledTimes(1));

  expect(await screen.findByText(/API Error/i)).toBeInTheDocument();
});

test('displays error message when no token is present', async () => {
  render(<YourBets />);

  await waitFor(() => expect(getUserBets).not.toHaveBeenCalled());

  expect(await screen.findByText(/Please log in to view your bets./i)).toBeInTheDocument();
});
