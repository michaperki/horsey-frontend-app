
// src/components/PlaceBet.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PlaceBet from './PlaceBet';
import fetchMock from 'jest-fetch-mock';

beforeEach(() => {
  fetchMock.resetMocks();
  localStorage.clear();
});

test('renders bet form with user balance', async () => {
  fetchMock.mockResponseOnce(JSON.stringify({ balance: 1000 }));

  // Mock a valid token
  const token = 'valid-token';
  localStorage.setItem('token', token);

  render(<PlaceBet />);

  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

  expect(screen.getByText(/Your Balance: 1000 PTK/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/Amount to Bet/i)).toBeInTheDocument();
  expect(screen.getByRole('combobox', { name: /creatorColor/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Place Bet/i })).toBeInTheDocument();
});

test('handles successful bet placement', async () => {
  // Mock balance fetch
  fetchMock.mockResponseOnce(JSON.stringify({ balance: 1000 }));

  // Mock a valid token
  const token = 'valid-token';
  localStorage.setItem('token', token);

  render(<PlaceBet />);

  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

  // Mock the place bet API response with gameLink
  const mockBetResponse = {
    bet: {
      gameLink: 'https://lichess.org/abc123',
    },
  };
  fetchMock.mockResponseOnce(JSON.stringify(mockBetResponse));

  // Enter amount and select color
  fireEvent.change(screen.getByPlaceholderText(/Amount to Bet/i), { target: { value: '100' } });
  fireEvent.change(screen.getByRole('combobox', { name: /creatorColor/i }), { target: { value: 'white' } });

  // Click "Place Bet"
  fireEvent.click(screen.getByRole('button', { name: /Place Bet/i }));

  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));

  // Check for success message
  expect(screen.getByText(/Bet placed successfully!/i)).toBeInTheDocument();

  // Verify that window.open was called with the correct URL
  expect(global.open).toHaveBeenCalledWith('https://lichess.org/abc123', '_blank');
});

test('handles bet placement with API error', async () => {
  // Mock balance fetch
  fetchMock.mockResponseOnce(JSON.stringify({ balance: 1000 }));

  // Mock a valid token
  const token = 'valid-token';
  localStorage.setItem('token', token);

  render(<PlaceBet />);

  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

  // Mock the place bet API failure
  fetchMock.mockResponseOnce(JSON.stringify({ error: 'Insufficient balance' }), { status: 400 });

  // Enter amount and select color
  fireEvent.change(screen.getByPlaceholderText(/Amount to Bet/i), { target: { value: '2000' } });
  fireEvent.change(screen.getByRole('combobox', { name: /creatorColor/i }), { target: { value: 'black' } });

  // Click "Place Bet"
  fireEvent.click(screen.getByRole('button', { name: /Place Bet/i }));

  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));

  // Check for error message
  expect(screen.getByText(/Insufficient balance/i)).toBeInTheDocument();
});

test('handles unexpected errors during bet placement', async () => {
  // Mock balance fetch
  fetchMock.mockResponseOnce(JSON.stringify({ balance: 1000 }));

  // Mock a valid token
  const token = 'valid-token';
  localStorage.setItem('token', token);

  render(<PlaceBet />);

  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

  // Mock the place bet API response without gameLink
  const mockBetResponse = {
    bet: {},
  };
  fetchMock.mockResponseOnce(JSON.stringify(mockBetResponse));

  // Enter amount and select color
  fireEvent.change(screen.getByPlaceholderText(/Amount to Bet/i), { target: { value: '100' } });
  fireEvent.change(screen.getByRole('combobox', { name: /creatorColor/i }), { target: { value: 'random' } });

  // Click "Place Bet"
  fireEvent.click(screen.getByRole('button', { name: /Place Bet/i }));

  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));

  // Check for error message
  expect(screen.getByText(/Failed to place the bet/i)).toBeInTheDocument();
});

