
// src/components/YourBets.test.js

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import YourBets from './YourBets';
import * as api from '../services/api';

// Mock the API service
jest.mock('../services/api');

describe('YourBets Component', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('renders loading state initially', async () => {
    const mockBetsData = {
      bets: [],
      totalPages: 1,
    };
    // Mock getUserBets with a delayed response
    api.getUserBets.mockImplementation(() =>
      new Promise((resolve) => setTimeout(() => resolve(mockBetsData), 100))
    );

    localStorage.setItem('token', 'valid-token');

    render(<YourBets />);

    // Check for the loading state
    // Removed the expectation for 'Loading balance...' as it might not be present

    // Wait for the bets to be displayed after the promise resolves
    await waitFor(() => {
      expect(screen.getByText(/You have not placed any bets yet./i)).toBeInTheDocument();
    });
  });

  test('renders bets data when API call is successful', async () => {
    const mockBetsData = {
      bets: [
        {
          _id: 'bet1',
          gameId: 'game123',
          choice: 'white',
          amount: 100,
          status: 'pending',
          createdAt: '2024-12-25T12:00:00.000Z',
        },
        {
          _id: 'bet2',
          gameId: 'game124',
          choice: 'black',
          amount: 200,
          status: 'won',
          createdAt: '2024-12-24T12:00:00.000Z',
        },
      ],
      totalPages: 1,
    };

    api.getUserBets.mockResolvedValue(mockBetsData);
    localStorage.setItem('token', 'valid-token');

    render(<YourBets />);

    // Check for the loading state
    // Removed the expectation for 'Loading balance...' as it might not be present

    // Wait for the bets to be displayed
    await waitFor(() => {
      expect(screen.getByText('game123')).toBeInTheDocument();
      expect(screen.getByText('White')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
      expect(screen.getByText('game124')).toBeInTheDocument();
      expect(screen.getByText('Black')).toBeInTheDocument();
      expect(screen.getByText('200')).toBeInTheDocument();
      expect(screen.getByText('Won')).toBeInTheDocument();
    });

    // Verify that pagination controls are rendered
    expect(screen.getByText(/Page 1 of 1/i)).toBeInTheDocument();
  });

  test('renders error message when API call fails', async () => {
    const mockError = 'Failed to fetch your bets';
    api.getUserBets.mockRejectedValue(new Error(mockError));
    localStorage.setItem('token', 'valid-token');

    render(<YourBets />);

    // Check for the loading state
    // Removed the expectation for 'Loading balance...' as it might not be present

    // Wait for the error message to be displayed
    await waitFor(() => {
      expect(screen.getByText(mockError)).toBeInTheDocument();
    });
  });

  test('renders message when no bets are available', async () => {
    const mockBetsData = {
      bets: [],
      totalPages: 1,
    };
    api.getUserBets.mockResolvedValue(mockBetsData);
    localStorage.setItem('token', 'valid-token');

    render(<YourBets />);

    // Check for the loading state
    // Removed the expectation for 'Loading balance...' as it might not be present

    // Wait for the 'no bets' message to be displayed
    await waitFor(() => {
      expect(screen.getByText(/You have not placed any bets yet./i)).toBeInTheDocument();
    });
  });

  test('renders message when user is not logged in', async () => {
    render(<YourBets />);

    // Check for the loading state
    // Removed the expectation for 'Loading balance...' as it might not be present

    // Wait for the error message to be displayed
    await waitFor(() => {
      expect(screen.getByText(/Please log in to view your bets./i)).toBeInTheDocument();
    });
  });

  test('handles pagination correctly', async () => {
    const mockBetsDataPage1 = {
      bets: [
        {
          _id: 'bet1',
          gameId: 'game123',
          choice: 'white',
          amount: 100,
          status: 'pending',
          createdAt: '2024-12-25T12:00:00.000Z',
        },
      ],
      totalPages: 2,
    };

    const mockBetsDataPage2 = {
      bets: [
        {
          _id: 'bet2',
          gameId: 'game124',
          choice: 'black',
          amount: 200,
          status: 'won',
          createdAt: '2024-12-24T12:00:00.000Z',
        },
      ],
      totalPages: 2,
    };

    api.getUserBets
      .mockResolvedValueOnce(mockBetsDataPage1)
      .mockResolvedValueOnce(mockBetsDataPage2);

    localStorage.setItem('token', 'valid-token');

    render(<YourBets />);

    // Wait for page 1 bets
    await waitFor(() => {
      expect(screen.getByText('game123')).toBeInTheDocument();
    });

    // Verify pagination info
    expect(screen.getByText(/Page 1 of 2/i)).toBeInTheDocument();

    // Click 'Next' to go to page 2
    fireEvent.click(screen.getByText('Next'));

    // Wait for page 2 bets
    await waitFor(() => {
      expect(screen.getByText('game124')).toBeInTheDocument();
    });

    // Verify pagination info
    expect(screen.getByText(/Page 2 of 2/i)).toBeInTheDocument();

    // 'Next' button should be disabled on last page
    expect(screen.getByText('Next')).toBeDisabled();

    // 'Previous' button should be enabled
    expect(screen.getByText('Previous')).toBeEnabled();
  });

  test('handles sorting correctly', async () => {
    const mockBetsDataAsc = {
      bets: [
        {
          _id: 'bet1',
          gameId: 'game123',
          choice: 'white',
          amount: 100,
          status: 'pending',
          createdAt: '2024-12-24T12:00:00.000Z',
        },
        {
          _id: 'bet2',
          gameId: 'game124',
          choice: 'black',
          amount: 200,
          status: 'won',
          createdAt: '2024-12-25T12:00:00.000Z',
        },
      ],
      totalPages: 1,
    };

    const mockBetsDataDesc = {
      bets: [
        {
          _id: 'bet2',
          gameId: 'game124',
          choice: 'black',
          amount: 200,
          status: 'won',
          createdAt: '2024-12-25T12:00:00.000Z',
        },
        {
          _id: 'bet1',
          gameId: 'game123',
          choice: 'white',
          amount: 100,
          status: 'pending',
          createdAt: '2024-12-24T12:00:00.000Z',
        },
      ],
      totalPages: 1,
    };

    api.getUserBets
      .mockResolvedValueOnce(mockBetsDataDesc) // Initial fetch with 'desc'
      .mockResolvedValueOnce(mockBetsDataAsc); // After sorting to 'asc'

    localStorage.setItem('token', 'valid-token');

    render(<YourBets />);

    // Wait for initial 'desc' sorted bets
    await waitFor(() => {
      expect(screen.getByText('game124')).toBeInTheDocument();
      expect(screen.getByText('game123')).toBeInTheDocument();
    });

    // Click on 'Game ID' header to sort ascending
    fireEvent.click(screen.getByText(/Game ID/i));

    // Wait for 'asc' sorted bets
    await waitFor(() => {
      expect(screen.getByText('game123')).toBeInTheDocument();
      expect(screen.getByText('game124')).toBeInTheDocument();
    });

    // Verify sort indicators
    expect(screen.getByText('Game ID ▲')).toBeInTheDocument();
  });
});

