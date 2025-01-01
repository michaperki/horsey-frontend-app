
// src/components/AvailableBets.test.js

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AvailableBets from './AvailableBets';
import fetchMock from 'jest-fetch-mock';

beforeEach(() => {
  fetchMock.resetMocks();
  localStorage.clear();
  jest.spyOn(Date.prototype, 'toLocaleString').mockImplementation(() => '1/1/2024, 12:00:00 PM');
  global.open = jest.fn(); // Mock window.open
});

afterEach(() => {
  jest.clearAllMocks();
});

test('renders Available Bets table with fetched data', async () => {
  const mockBets = [
    {
      id: 'bet1',
      creator: 'User1',
      creatorBalance: 500,
      wager: 100,
      gameType: 'Blitz',
      colorPreference: 'Red', // Added colorPreference
      createdAt: '2024-01-01T12:00:00Z',
    },
  ];

  // Mock the fetch response for fetching bets
  fetchMock.mockResponseOnce(JSON.stringify(mockBets), { status: 200 });

  // Set a valid token in localStorage
  const token = 'valid-token';
  localStorage.setItem('token', token);

  render(<AvailableBets />);

  // **Temporary Assertion to Verify Mock**
  const testDate = new Date('2024-01-01T12:00:00Z').toLocaleString();
  expect(testDate).toBe('1/1/2024, 12:00:00 PM');

  // Wait for the "Bet ID" header to appear
  expect(await screen.findByText(/Bet ID/i)).toBeInTheDocument();
  expect(screen.getByText(/Creator/i)).toBeInTheDocument();
  expect(screen.getByText(/Balance/i)).toBeInTheDocument();
  expect(screen.getByText(/Wager \(PTK\)/i)).toBeInTheDocument();
  expect(screen.getByText(/Game Type/i)).toBeInTheDocument();
  expect(screen.getByText(/Color/i)).toBeInTheDocument(); // Updated expectation
  expect(screen.getByText(/Created At/i)).toBeInTheDocument();
  expect(screen.getByText(/Action/i)).toBeInTheDocument();

  // Check if mock bet data is rendered
  expect(screen.getByText('bet1')).toBeInTheDocument();
  expect(screen.getByText('User1')).toBeInTheDocument();
  expect(screen.getByText('500')).toBeInTheDocument();
  expect(screen.getByText('100')).toBeInTheDocument();
  expect(screen.getByText('Blitz')).toBeInTheDocument();
  expect(screen.getByText('Red')).toBeInTheDocument(); // Check colorPreference

  // **Use findByTestId to wait for the date cell to appear**
  const dateCell = await screen.findByTestId('created-at-bet1');
  expect(dateCell).toBeInTheDocument();
  expect(dateCell).toHaveTextContent('1/1/2024, 12:00:00 PM');

  // **Optional: Inspect the rendered DOM for debugging**
  // screen.debug();
});

test('handles bet acceptance successfully', async () => {
  const mockBets = [
    {
      id: 'bet1',
      creator: 'User1',
      creatorBalance: 500,
      wager: 100,
      gameType: 'Blitz',
      colorPreference: 'Red',
      createdAt: '2024-01-01T12:00:00Z',
    },
  ];

  // Mock the fetch response for fetching bets
  fetchMock.mockResponseOnce(JSON.stringify(mockBets), { status: 200 });

  // Set a valid token in localStorage
  const token = 'valid-token';
  localStorage.setItem('token', token);

  render(<AvailableBets />);

  // Wait for the initial fetch call
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

  // Mock the accept bet API call with a successful response
  fetchMock.mockResponseOnce(JSON.stringify({ gameLink: 'https://lichess.org/abc123' }), { status: 200 });

  // Click "Join Bet" for the first bet using data-testid
  const joinButton = await screen.findByTestId('join-bet-bet1');
  fireEvent.click(joinButton);

  // Wait for the accept bet fetch to be called
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));

  // Check for success message
  expect(await screen.findByText(/Successfully joined the bet!/i)).toBeInTheDocument();

  // Verify that window.open was called with the correct URL
  expect(global.open).toHaveBeenCalledWith('https://lichess.org/abc123', '_blank');

  // **Optional: Verify that the bet is removed from the list**
  await waitFor(() => {
    expect(screen.queryByText('bet1')).not.toBeInTheDocument();
  });
});

test('displays message when not authenticated', () => {
  render(<AvailableBets />);

  expect(screen.getByText(/Please log in to view available bets./i)).toBeInTheDocument();
});

test('displays message when no available bets are present', async () => {
  const mockBets = []; // Empty array

  // Mock the fetch response with an empty array
  fetchMock.mockResponseOnce(JSON.stringify(mockBets), { status: 200 });

  // Set a valid token in localStorage
  const token = 'valid-token';
  localStorage.setItem('token', token);

  render(<AvailableBets />);

  // Wait for the fetch call to be made and for the message to appear
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

  // Use findByText to wait for the message
  expect(await screen.findByText(/No available bets at the moment./i)).toBeInTheDocument();
});

test('handles API failure gracefully', async () => {
  // Mock a failed fetch response
  fetchMock.mockRejectOnce(new Error('API Failure'));

  // Set a valid token in localStorage
  const token = 'valid-token';
  localStorage.setItem('token', token);

  render(<AvailableBets />);

  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

  expect(screen.getByText(/An unexpected error occurred./i)).toBeInTheDocument();
});

test('handles duplicate or missing bet IDs gracefully', async () => {
  const mockBets = [
    {
      id: 'bet1',
      creator: 'User1',
      creatorBalance: 500,
      wager: 100,
      gameType: 'Blitz',
      colorPreference: 'Red',
      createdAt: '2024-01-01T12:00:00Z',
    },
    {
      id: 'bet1', // Duplicate ID
      creator: 'User2',
      creatorBalance: 300,
      wager: 150,
      gameType: 'Rapid',
      colorPreference: 'Blue',
      createdAt: '2024-01-02T15:30:00Z',
    },
    {
      // Missing ID
      creator: 'User3',
      creatorBalance: 400,
      wager: 200,
      gameType: 'Bullet',
      colorPreference: 'Green',
      createdAt: '2024-01-03T09:45:00Z',
    },
  ];

  // Mock the fetch response with duplicate and missing IDs
  fetchMock.mockResponseOnce(JSON.stringify(mockBets), { status: 200 });

  // Set a valid token in localStorage
  const token = 'valid-token';
  localStorage.setItem('token', token);

  render(<AvailableBets />);

  // Wait for the table to render
  expect(await screen.findByText(/Bet ID/i)).toBeInTheDocument();

  // Expect only unique bets with IDs to be rendered
  expect(screen.getAllByText('bet1').length).toBe(1);
  expect(screen.queryByText('User2')).not.toBeInTheDocument();
  expect(screen.queryByText('User3')).not.toBeInTheDocument();

  // **Optional: Check for a warning message if implemented**
});

test('handles unexpected data format gracefully', async () => {
  const mockBets = { message: 'Unexpected format' }; // Not an array

  // Mock the fetch response with an unexpected data format
  fetchMock.mockResponseOnce(JSON.stringify(mockBets), { status: 200 });

  // Set a valid token in localStorage
  const token = 'valid-token';
  localStorage.setItem('token', token);

  render(<AvailableBets />);

  // Wait for the error message to appear
  expect(await screen.findByText(/Unexpected data format received from server./i)).toBeInTheDocument();
});

