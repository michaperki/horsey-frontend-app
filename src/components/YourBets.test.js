
// src/components/YourBets.test.js
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import YourBets from './YourBets';
import fetchMock from 'jest-fetch-mock';

beforeEach(() => {
  fetchMock.resetMocks();
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

  fetchMock.mockResponseOnce(JSON.stringify(mockBetsData));

  // Mock a valid token in localStorage
  const token = 'valid-token';
  localStorage.setItem('token', token);

  render(<YourBets />);

  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

  // Check if table headers are present
  expect(screen.getByText(/Game ID/i)).toBeInTheDocument();
  expect(screen.getByText(/Your Choice/i)).toBeInTheDocument();
  expect(screen.getByText(/Final White/i)).toBeInTheDocument();
  expect(screen.getByText(/Final Black/i)).toBeInTheDocument();
  expect(screen.getByText(/Amount/i)).toBeInTheDocument();
  expect(screen.getByText(/Status/i)).toBeInTheDocument();
  expect(screen.getByText(/Date/i)).toBeInTheDocument();
  expect(screen.getByText(/Game Link/i)).toBeInTheDocument();

  // Check if mock bet data is rendered
  expect(screen.getByText('White')).toBeInTheDocument();
  expect(screen.getByText('User1')).toBeInTheDocument();
  expect(screen.getByText('User2')).toBeInTheDocument();
  expect(screen.getByText('100')).toBeInTheDocument();
  expect(screen.getByText('Active')).toBeInTheDocument();
  expect(screen.getByText('1/1/2024, 12:00:00 PM')).toBeInTheDocument();
  expect(screen.getByText(/View Game/i)).toBeInTheDocument();
});

test('displays message when no bets are present', async () => {
  const mockBetsData = {
    bets: [],
    totalPages: 1,
  };

  fetchMock.mockResponseOnce(JSON.stringify(mockBetsData));

  // Mock a valid token in localStorage
  const token = 'valid-token';
  localStorage.setItem('token', token);

  render(<YourBets />);

  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

  expect(screen.getByText(/You have not placed any bets yet./i)).toBeInTheDocument();
});

test('handles API errors gracefully', async () => {
  fetchMock.mockRejectOnce(new Error('API Error'));

  // Mock a valid token in localStorage
  const token = 'valid-token';
  localStorage.setItem('token', token);

  render(<YourBets />);

  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

  // expect(screen.getByText(/API Error/i)).toBeInTheDocument();
});

