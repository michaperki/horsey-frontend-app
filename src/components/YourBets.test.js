// src/components/YourBets.test.js

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import YourBets from './YourBets';
import { useAuth } from '../contexts/AuthContext';
import { getUserBets } from '../services/api';

// Mock the useAuth hook
jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock the getUserBets API function
jest.mock('../services/api', () => ({
  getUserBets: jest.fn(),
}));

describe('YourBets Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    useAuth.mockReset();
    getUserBets.mockReset();
    // Clear localStorage
    localStorage.clear();
    // Mock window.confirm
    window.confirm = jest.fn();
  });

  afterEach(() => {
    // Clean up mocks after each test
    jest.resetAllMocks();
  });

  test('shows login message when not logged in', () => {
    // Mock unauthenticated user
    useAuth.mockReturnValue({
      token: null,
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
    });

    render(<YourBets />);

    expect(screen.getByText('Please log in to view your bets.')).toBeInTheDocument();
    expect(getUserBets).not.toHaveBeenCalled();
  });

  test('renders bets data when logged in', async () => {
    // Mock authenticated user
    useAuth.mockReturnValue({
      token: 'valid-token',
      user: { id: 'user1', name: 'Test User' },
      login: jest.fn(),
      logout: jest.fn(),
    });

    // Mock API response with correct structure
    const mockBetsData = {
      bets: [
        {
          _id: 'bet1',
          gameId: 'game123',
          creatorId: { _id: 'user1' },
          creatorColor: 'white',
          finalWhiteId: { username: 'User1' },
          finalBlackId: { username: 'User2' },
          amount: 100,
          currencyType: 'Token',
          status: 'active',
          createdAt: '2024-01-01T12:00:00Z',
        },
      ],
      totalPages: 1,
    };

    getUserBets.mockResolvedValueOnce(mockBetsData);

    render(<YourBets />);

    // Check for loading state
    expect(screen.getByText(/Loading your bets.../i)).toBeInTheDocument();

    // Wait for the API call to be made
    await waitFor(() => {
      expect(getUserBets).toHaveBeenCalledWith('valid-token', {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        order: 'desc',
      });
    });

    // Use findByText to wait for the element to appear
    expect(await screen.findByText('game123')).toBeInTheDocument();
    expect(await screen.findByText('100')).toBeInTheDocument();
    expect(await screen.findByText(/active/i)).toBeInTheDocument();
    // expect(await screen.findByText('1/1/2024, 12:00:00 PM')).toBeInTheDocument();

    // Verify that the 'Cancel' button is **not** rendered for 'active' status
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
  });

  // test('does not render cancel button if bet is not pending', async () => {
  //   // Mock authenticated user
  //   useAuth.mockReturnValue({
  //     token: 'valid-token',
  //     user: { id: 'user1', name: 'Test User' },
  //     login: jest.fn(),
  //     logout: jest.fn(),
  //   });
  //
  //   // Mock API response with a non-pending bet
  //   const mockBetsData = {
  //     bets: [
  //       {
  //         _id: 'bet2',
  //         gameId: 'game456',
  //         creatorId: { _id: 'user1' }, // Ensure creatorId is present
  //         creatorColor: 'black',
  //         finalWhiteId: { username: 'User3' },
  //         finalBlackId: { username: 'User4' },
  //         amount: 200,
  //         currencyType: 'Token',
  //         status: 'matched',
  //         createdAt: '2024-02-01T15:00:00Z',
  //       },
  //     ],
  //     totalPages: 1,
  //   };
  //
  //   getUserBets.mockResolvedValueOnce(mockBetsData);
  //
  //   render(<YourBets />);
  //
  //   // Wait for the API call to be made
  //   await waitFor(() => {
  //     expect(getUserBets).toHaveBeenCalledWith('valid-token', {
  //       page: 1,
  //       limit: 10,
  //       sortBy: 'createdAt',
  //       order: 'desc',
  //     });
  //   });
  //
  //   // Verify that the non-pending bet data is rendered
  //   expect(await screen.findByText('game456')).toBeInTheDocument();
  //   expect(await screen.findByText('200')).toBeInTheDocument();
  //   expect(await screen.findByText(/matched/i)).toBeInTheDocument();
  //   // expect(await screen.findByText('2/1/2024, 3:00:00 PM')).toBeInTheDocument();
  //
  //   // Verify that the 'Cancel' button is **not** rendered for 'matched' status
  //   expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
  // });

  test('handles API failure gracefully', async () => {
    // Mock authenticated user
    useAuth.mockReturnValue({
      token: 'valid-token',
      user: { id: 'user1', name: 'Test User' },
      login: jest.fn(),
      logout: jest.fn(),
    });

    // Mock API failure
    getUserBets.mockRejectedValueOnce(new Error('API Failure'));

    render(<YourBets />);

    // Check for loading state
    expect(screen.getByText(/Loading your bets.../i)).toBeInTheDocument();

    // Wait for the API call to be made
    await waitFor(() => {
      expect(getUserBets).toHaveBeenCalledWith('valid-token', {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        order: 'desc',
      });
    });

    // Use findByText to wait for the error message to appear
    expect(await screen.findByText(/API Failure/i)).toBeInTheDocument();

    // Ensure that no bets are rendered
    expect(screen.queryByText('game123')).not.toBeInTheDocument();
    expect(screen.queryByText('100')).not.toBeInTheDocument();
    expect(screen.queryByText('active')).not.toBeInTheDocument();
    expect(screen.queryByText('1/1/2024, 12:00:00 PM')).not.toBeInTheDocument();
  });

  test('handles empty bets gracefully', async () => {
    // Mock authenticated user
    useAuth.mockReturnValue({
      token: 'valid-token',
      user: { id: 'user1', name: 'Test User' },
      login: jest.fn(),
      logout: jest.fn(),
    });

    // Mock API response with empty bets
    const mockBetsData = {
      bets: [],
      totalPages: 1,
    };

    getUserBets.mockResolvedValueOnce(mockBetsData);

    render(<YourBets />);

    // Check for loading state
    expect(screen.getByText(/Loading your bets.../i)).toBeInTheDocument();

    // Wait for the API call to be made
    await waitFor(() => {
      expect(getUserBets).toHaveBeenCalledWith('valid-token', {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        order: 'desc',
      });
    });

    // Use findByText to wait for the no bets message to appear
    expect(await screen.findByText(/You have not placed any bets yet./i)).toBeInTheDocument();

    // Ensure that no bets are rendered
    expect(screen.queryByText('game123')).not.toBeInTheDocument();
    expect(screen.queryByText('100')).not.toBeInTheDocument();
    expect(screen.queryByText('active')).not.toBeInTheDocument();
  });
});
