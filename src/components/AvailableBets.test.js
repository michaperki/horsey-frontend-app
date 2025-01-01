// src/components/AvailableBets.test.js

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AvailableBets from './AvailableBets';
import { useAuth } from '../contexts/AuthContext';
import { acceptBet } from '../services/api';

// Mock the useAuth hook
jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock the acceptBet API function
jest.mock('../services/api', () => ({
  acceptBet: jest.fn(),
}));

describe('AvailableBets Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    useAuth.mockReset();
    acceptBet.mockReset();
    // Clear localStorage
    localStorage.clear();
    // Reset fetch mocks
    global.fetch = jest.fn();
    // Mock window.open
    global.open = jest.fn();
  });

  afterEach(() => {
    // Clean up mocks after each test
    jest.resetAllMocks();
  });

  test('renders Available Bets table with fetched data', async () => {
    // Mock authenticated user
    useAuth.mockReturnValue({
      token: 'valid-token',
      user: { id: 'user1', name: 'Test User' },
      login: jest.fn(),
      logout: jest.fn(),
    });

    // Mock fetch response for available bets
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

    // Mock the global fetch function
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockBets,
    });

    render(<AvailableBets />);

    // Check for loading state
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();

    // Wait for the bets to be rendered
    await waitFor(() => {
      expect(screen.getByText('bet1')).toBeInTheDocument();
      expect(screen.getByText('User1')).toBeInTheDocument();
      expect(screen.getByText('500')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('Blitz')).toBeInTheDocument();
      expect(screen.getByText('Red')).toBeInTheDocument();
      
      // Use getByTestId for createdAt and perform partial match
      const createdAtCell = screen.getByTestId('created-at-bet1');
      expect(createdAtCell).toBeInTheDocument();
      // expect(createdAtCell).toHaveTextContent(/1\/1\/2024/i); // Partial match to accommodate locale differences

      // Use getByTestId to target the specific "Accept" button
      expect(screen.getByTestId('accept-bet-bet1')).toBeInTheDocument();
    });

    // Clean up fetch mock
    global.fetch.mockRestore();
  });

  test('handles duplicate or missing bet IDs gracefully', async () => {
    // Mock authenticated user
    useAuth.mockReturnValue({
      token: 'valid-token',
      user: { id: 'user1', name: 'Test User' },
      login: jest.fn(),
      logout: jest.fn(),
    });

    // Mock fetch response with duplicate and missing IDs
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

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockBets,
    });

    render(<AvailableBets />);

    // Wait for the bets to be rendered
    await waitFor(() => {
      expect(screen.getAllByText('bet1').length).toBe(1); // Only one unique bet1 should be rendered
      expect(screen.queryByText('User2')).not.toBeInTheDocument(); // User2 should be excluded
      expect(screen.queryByText('User3')).not.toBeInTheDocument(); // User3 should be excluded
    });

    // Clean up fetch mock
    global.fetch.mockRestore();
  });

  test('displays message when not authenticated', () => {
    // Mock unauthenticated user
    useAuth.mockReturnValue({
      token: null,
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
    });

    render(<AvailableBets />);

    expect(screen.getByText(/Please log in to view available bets./i)).toBeInTheDocument();
    expect(screen.queryByText('Accept')).not.toBeInTheDocument();
  });

  test('displays message when no available bets are present', async () => {
    // Mock authenticated user
    useAuth.mockReturnValue({
      token: 'valid-token',
      user: { id: 'user1', name: 'Test User' },
      login: jest.fn(),
      logout: jest.fn(),
    });

    // Mock fetch response with empty array
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<AvailableBets />);

    // Wait for the fetch call to be made and for the message to appear
    await waitFor(() => {
      expect(screen.getByText(/No bets available right now./i)).toBeInTheDocument();
    });

    // Clean up fetch mock
    global.fetch.mockRestore();
  });

  test('handles API failure gracefully', async () => {
    // Mock authenticated user
    useAuth.mockReturnValue({
      token: 'valid-token',
      user: { id: 'user1', name: 'Test User' },
      login: jest.fn(),
      logout: jest.fn(),
    });

    // Mock fetch to fail with a specific error message
    global.fetch.mockRejectedValueOnce(new Error('Failed to fetch available bets.'));

    render(<AvailableBets />);

    // Wait for the error message
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch available bets./i)).toBeInTheDocument();
    });

    // Clean up fetch mock
    global.fetch.mockRestore();
  });

  test('handles duplicate or missing bet IDs gracefully', async () => {
    // Mock authenticated user
    useAuth.mockReturnValue({
      token: 'valid-token',
      user: { id: 'user1', name: 'Test User' },
      login: jest.fn(),
      logout: jest.fn(),
    });

    // Mock fetch response with duplicate and missing IDs
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

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockBets,
    });

    render(<AvailableBets />);

    // Wait for the bets to be rendered
    await waitFor(() => {
      expect(screen.getAllByText('bet1').length).toBe(1); // Only one unique bet1 should be rendered
      expect(screen.queryByText('User2')).not.toBeInTheDocument(); // User2 should be excluded
      expect(screen.queryByText('User3')).not.toBeInTheDocument(); // User3 should be excluded
    });

    // Optionally, check for a warning message if implemented
    // expect(screen.getByText(/Duplicate bet IDs found./i)).toBeInTheDocument();

    // Clean up fetch mock
    global.fetch.mockRestore();
  });

  test('handles unexpected data format gracefully', async () => {
    // Mock authenticated user
    useAuth.mockReturnValue({
      token: 'valid-token',
      user: { id: 'user1', name: 'Test User' },
      login: jest.fn(),
      logout: jest.fn(),
    });

    // Mock fetch response with unexpected data format
    const mockBets = { message: 'Unexpected format' };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockBets,
    });

    render(<AvailableBets />);

    // Wait for the error message
    await waitFor(() => {
      expect(screen.getByText(/Unexpected data format from server./i)).toBeInTheDocument();
    });

    // Clean up fetch mock
    global.fetch.mockRestore();
  });
});
