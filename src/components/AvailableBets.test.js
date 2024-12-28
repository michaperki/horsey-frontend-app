
// src/components/AvailableBets.test.js
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AvailableBets from './AvailableBets';
import fetchMock from 'jest-fetch-mock';

beforeEach(() => {
  fetchMock.resetMocks();
  localStorage.clear();
});

test('renders Available Bets table with fetched data', async () => {
  const mockBets = [
    {
      id: 'bet1',
      creator: 'User1',
      creatorBalance: 500,
      wager: 100,
      gameType: 'Blitz',
      createdAt: '2024-01-01T12:00:00Z',
    },
  ];

  fetchMock.mockResponseOnce(JSON.stringify(mockBets));

  // Mock a valid token in localStorage
  const token = 'valid-token';
  localStorage.setItem('token', token);

  render(<AvailableBets />);

  // Wait for fetch to be called
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

  // Check if table headers are present
  expect(screen.getByText(/Bet ID/i)).toBeInTheDocument();
  expect(screen.getByText(/Creator/i)).toBeInTheDocument();
  expect(screen.getByText(/Balance/i)).toBeInTheDocument();
  expect(screen.getByText(/Wager \(PTK\)/i)).toBeInTheDocument();
  expect(screen.getByText(/Game Type/i)).toBeInTheDocument();
  expect(screen.getByText(/Created At/i)).toBeInTheDocument();
  expect(screen.getByText(/Choose Color/i)).toBeInTheDocument();
  expect(screen.getByText(/Action/i)).toBeInTheDocument();

  // Check if mock bet data is rendered
  expect(screen.getByText('bet1')).toBeInTheDocument();
  expect(screen.getByText('User1')).toBeInTheDocument();
  expect(screen.getByText('500')).toBeInTheDocument();
  expect(screen.getByText('100')).toBeInTheDocument();
  expect(screen.getByText('Blitz')).toBeInTheDocument();
  expect(screen.getByText('1/1/2024, 12:00:00 PM')).toBeInTheDocument();
});

test('displays message when not authenticated', () => {
  render(<AvailableBets />);

  expect(screen.getByText(/Please log in to view available bets./i)).toBeInTheDocument();
});

test('displays message when no available bets are present', async () => {
  const mockBets = [];

  fetchMock.mockResponseOnce(JSON.stringify(mockBets));

  // Mock a valid token in localStorage
  const token = 'valid-token';
  localStorage.setItem('token', token);

  render(<AvailableBets />);

  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

  expect(screen.getByText(/No available bets at the moment./i)).toBeInTheDocument();
});

test('handles API failure gracefully', async () => {
  fetchMock.mockRejectOnce(new Error('API Failure'));

  // Mock a valid token in localStorage
  const token = 'valid-token';
  localStorage.setItem('token', token);

  render(<AvailableBets />);

  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

  expect(screen.getByText(/An unexpected error occurred./i)).toBeInTheDocument();
});

test('handles bet acceptance successfully', async () => {
  const mockBets = [
    {
      id: 'bet1',
      creator: 'User1',
      creatorBalance: 500,
      wager: 100,
      gameType: 'Blitz',
      createdAt: '2024-01-01T12:00:00Z',
    },
  ];

  fetchMock.mockResponseOnce(JSON.stringify(mockBets));

  // Mock a valid token in localStorage
  const token = 'valid-token';
  localStorage.setItem('token', token);

  render(<AvailableBets />);

  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

  // Mock the accept bet API call with a successful response
  fetchMock.mockResponseOnce(JSON.stringify({ gameLink: 'https://lichess.org/abc123' }));

  // Click "Join Bet" for the first bet
  fireEvent.click(screen.getByText("Join Bet"));

  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));

  // Check for success message (ensure your component sets this message)
  expect(screen.getByText(/Successfully joined the bet!/i)).toBeInTheDocument();

  // Verify that window.open was called with the correct URL
  expect(global.open).toHaveBeenCalledWith('https://lichess.org/abc123', '_blank');
});

test('handles errors during bet acceptance', async () => {
  const mockBets = [
    {
      id: 'bet1',
      creator: 'User1',
      creatorBalance: 500,
      wager: 100,
      gameType: 'Blitz',
      createdAt: '2024-01-01T12:00:00Z',
    },
  ];

  fetchMock.mockResponseOnce(JSON.stringify(mockBets));

  // Mock a valid token in localStorage
  const token = 'valid-token';
  localStorage.setItem('token', token);

  render(<AvailableBets />);

  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

  // Mock the accept bet API call with an error
  fetchMock.mockResponseOnce(JSON.stringify({ error: 'Failed to accept bet' }), { status: 400 });

  // Click "Join Bet" for the first bet
  fireEvent.click(screen.getByText("Join Bet"));

  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));

  expect(screen.getByText(/Failed to accept bet/i)).toBeInTheDocument();
});

