
// src/components/BetHistory.test.js

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BetHistory from './BetHistory';
import { MemoryRouter } from 'react-router-dom';

// Ensure jest-fetch-mock is enabled via setupTests.js

beforeEach(() => {
  fetch.resetMocks();
  localStorage.clear();
});

describe('BetHistory Component', () => {
  const mockToken = 'fake-jwt-token';

  const mockBetsData = {
    bets: [
      {
        _id: 'bet1',
        gameId: 'game123',
        choice: 'white',
        amount: 100,
        status: 'won',
        createdAt: '2024-04-25T10:00:00Z',
      },
      {
        _id: 'bet2',
        gameId: 'game124',
        choice: 'black',
        amount: 50,
        status: 'lost',
        createdAt: '2024-04-26T12:30:00Z',
      },
    ],
    totalPages: 2,
  };

  const setup = () => {
    return render(
      <MemoryRouter>
        <BetHistory />
      </MemoryRouter>
    );
  };

  test('renders loading state initially', async () => {
    localStorage.setItem('token', mockToken);
    fetch.mockResponseOnce(JSON.stringify(mockBetsData));

    setup();

    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();

    // Ensure all state updates are processed
    await waitFor(() => {});
  });

  test('fetches and displays bet history successfully', async () => {
    localStorage.setItem('token', mockToken);
    fetch.mockResponseOnce(JSON.stringify(mockBetsData));

    setup();

    // Wait for the "Your Bet History" header to appear
    await screen.findByText(/Your Bet History/i);

    // Check that the first bet is displayed
    expect(await screen.findByText('game123')).toBeInTheDocument();
    expect(screen.getByText('white')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('won')).toBeInTheDocument();
    // Use regex to match date without exact time
    expect(screen.getByText(/4\/25\/2024/i)).toBeInTheDocument();

    // Check that the second bet is displayed
    expect(screen.getByText('game124')).toBeInTheDocument();
    expect(screen.getByText('black')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('lost')).toBeInTheDocument();
    expect(screen.getByText(/4\/26\/2024/i)).toBeInTheDocument();

    // Check pagination info
    expect(screen.getByText(/Page 1 of 2/i)).toBeInTheDocument();

    // Ensure all state updates are processed
    await waitFor(() => {});
  });

  test('handles fetch error gracefully', async () => {
    localStorage.setItem('token', mockToken);
    fetch.mockRejectOnce(new Error('Network error'));

    setup();

    // Wait for the error message to appear
    await screen.findByText(/Network error/i);

    // Ensure that the loading state is false
    expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument();

    // Ensure all state updates are processed
    await waitFor(() => {});
  });

  test('handles non-OK response gracefully', async () => {
    localStorage.setItem('token', mockToken);
    fetch.mockResponseOnce(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    setup();

    // Wait for the error message to appear
    await screen.findByText(/Failed to fetch bet history./i);

    // Ensure that the loading state is false
    expect(screen.queryByText(/Loading.../i)).not.toBeInTheDocument();

    // Ensure all state updates are processed
    await waitFor(() => {});
  });

  test('paginates to next page', async () => {
    localStorage.setItem('token', mockToken);
    // Mock first page
    fetch.mockResponseOnce(JSON.stringify(mockBetsData));

    setup();

    // Wait for first page to load
    await screen.findByText(/Page 1 of 2/i);

    const nextButton = screen.getByRole('button', { name: /Next/i });

    // Mock second page
    fetch.mockResponseOnce(
      JSON.stringify({
        bets: [
          {
            _id: 'bet3',
            gameId: 'game125',
            choice: 'white',
            amount: 200,
            status: 'won',
            createdAt: '2024-04-27T15:45:00Z',
          },
        ],
        totalPages: 2,
      })
    );

    fireEvent.click(nextButton);

    // Wait for second page to load
    await screen.findByText(/Page 2 of 2/i);
    expect(screen.getByText('game125')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();
    expect(screen.getByText('won')).toBeInTheDocument();
    expect(screen.getByText(/4\/27\/2024/i)).toBeInTheDocument();

    // Ensure 'Next' button is disabled on last page
    expect(nextButton).toBeDisabled();

    // Ensure all state updates are processed
    await waitFor(() => {});
  });

  test('paginates to previous page', async () => {
    localStorage.setItem('token', mockToken);
    // Mock first page
    fetch.mockResponseOnce(JSON.stringify(mockBetsData));

    setup();

    // Wait for first page to load
    await screen.findByText(/Page 1 of 2/i);

    const nextButton = screen.getByRole('button', { name: /Next/i });

    // Mock second page
    fetch.mockResponseOnce(
      JSON.stringify({
        bets: [
          {
            _id: 'bet3',
            gameId: 'game125',
            choice: 'white',
            amount: 200,
            status: 'won',
            createdAt: '2024-04-27T15:45:00Z',
          },
        ],
        totalPages: 2,
      })
    );

    fireEvent.click(nextButton);

    await screen.findByText(/Page 2 of 2/i);
    expect(screen.getByText('game125')).toBeInTheDocument();

    const previousButton = screen.getByRole('button', { name: /Previous/i });

    // Mock back to first page
    fetch.mockResponseOnce(JSON.stringify(mockBetsData));

    fireEvent.click(previousButton);

    // Wait for first page to load again
    await screen.findByText(/Page 1 of 2/i);
    expect(screen.getByText('game123')).toBeInTheDocument();
    expect(screen.getByText('game124')).toBeInTheDocument();

    // Ensure 'Previous' button is disabled on first page
    expect(previousButton).toBeDisabled();

    // Ensure all state updates are processed
    await waitFor(() => {});
  });

  test('sorts bets by different fields', async () => {
    localStorage.setItem('token', mockToken);
    fetch.mockResponseOnce(JSON.stringify(mockBetsData));

    setup();

    // Wait for first page to load
    await screen.findByText(/Page 1 of 2/i);

    const amountHeader = screen.getByText('Amount');

    // Mock sorted data by amount ascending
    const sortedDataAsc = {
      bets: [
        {
          _id: 'bet2',
          gameId: 'game124',
          choice: 'black',
          amount: 50,
          status: 'lost',
          createdAt: '2024-04-26T12:30:00Z',
        },
        {
          _id: 'bet1',
          gameId: 'game123',
          choice: 'white',
          amount: 100,
          status: 'won',
          createdAt: '2024-04-25T10:00:00Z',
        },
      ],
      totalPages: 2,
    };

    fetch.mockResponseOnce(JSON.stringify(sortedDataAsc));

    fireEvent.click(amountHeader);

    // Wait for sorted data to load
    await screen.findByText('game124');
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('game123')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();

    // Mock sorted data by amount descending
    const sortedDataDesc = {
      bets: [
        {
          _id: 'bet1',
          gameId: 'game123',
          choice: 'white',
          amount: 100,
          status: 'won',
          createdAt: '2024-04-25T10:00:00Z',
        },
        {
          _id: 'bet2',
          gameId: 'game124',
          choice: 'black',
          amount: 50,
          status: 'lost',
          createdAt: '2024-04-26T12:30:00Z',
        },
      ],
      totalPages: 2,
    };

    fetch.mockResponseOnce(JSON.stringify(sortedDataDesc));

    fireEvent.click(amountHeader); // Toggle to descending

    await screen.findByText('game123');
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('game124')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();

    // Ensure all state updates are processed
    await waitFor(() => {});
  });

  test('handles no bets scenario', async () => {
    localStorage.setItem('token', mockToken);
    fetch.mockResponseOnce(JSON.stringify({ bets: [], totalPages: 1 }));

    setup();

    // Wait for component to load by finding "Page 1 of 1"
    await screen.findByText(/Page 1 of 1/i);

    // Ensure only header row is present
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(1);

    // Ensure all state updates are processed
    await waitFor(() => {});
  });
});

