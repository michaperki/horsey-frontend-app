
import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { useAuth } from '../../contexts/AuthContext'; // Mock this
import ValidateResult from './ValidateResult';

// Mock the AuthContext
jest.mock('../../contexts/AuthContext');

describe('ValidateResult Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();

    // Mock useAuth to simulate an authenticated admin user
    useAuth.mockReturnValue({
      token: 'valid-admin-token',
      user: { username: 'AdminUser' },
      login: jest.fn(),
      logout: jest.fn(),
    });
  });

  test('renders the validation form', () => {
    render(<ValidateResult />);
    expect(screen.getByText(/Validate Lichess Game Result/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter Lichess Game ID/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Validate Result/i })).toBeInTheDocument();
  });

  test('handles successful game result validation', async () => {
    // Mock successful API response
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            message: 'Game result processed successfully.',
            outcome: 'white_win',
            whitePlayer: 'player1',
            blackPlayer: 'player2',
            status: 'valid',
          }),
      })
    );

    render(<ValidateResult />);

    // Simulate user input
    fireEvent.change(screen.getByPlaceholderText(/Enter Lichess Game ID/i), {
      target: { value: 'gameId123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Validate Result/i }));

    // Use findAllByText to handle multiple matches and check the correct element
    const successMessages = await screen.findAllByText(/Game result processed successfully./i);
    expect(successMessages).toHaveLength(2); // Confirm there are two matches

    // Verify the specific location of the success message
    expect(successMessages[0]).toBeInTheDocument(); // The global success message
    expect(successMessages[1]).toBeInTheDocument(); // The message in the details section

    // Verify additional details in the result container
    const resultContainer = screen.getByText(/Outcome:/i).closest('div');
    const { getByText } = within(resultContainer);

    expect(screen.getByTestId('outcome')).toHaveTextContent('Outcome: white_win');
    expect(screen.getByTestId('white-player')).toHaveTextContent('White Player: player1');
    expect(screen.getByTestId('black-player')).toHaveTextContent('Black Player: player2');
    expect(screen.getByTestId('status')).toHaveTextContent('Status: valid');
  });

  test('handles validation error gracefully', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Invalid game ID' }),
      })
    );

    render(<ValidateResult />);

    fireEvent.change(screen.getByPlaceholderText(/Enter Lichess Game ID/i), {
      target: { value: 'invalidGameId' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Validate Result/i }));

    const errorMessage = await screen.findByText(/Error: Invalid game ID/i);
    expect(errorMessage).toBeInTheDocument();
  });

  test('handles unexpected API error gracefully', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));

    render(<ValidateResult />);

    fireEvent.change(screen.getByPlaceholderText(/Enter Lichess Game ID/i), {
      target: { value: 'gameId123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Validate Result/i }));

    const unexpectedError = await screen.findByText(/An unexpected error occurred./i);
    expect(unexpectedError).toBeInTheDocument();
  });

  test('shows error when no token is present', () => {
    useAuth.mockReturnValue({
      token: null,
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
    });

    render(<ValidateResult />);

    fireEvent.click(screen.getByRole('button', { name: /Validate Result/i }));

    expect(screen.getByText(/Please login as admin first./i)).toBeInTheDocument();
  });
});

