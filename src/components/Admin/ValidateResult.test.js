
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, AuthContext } from '../../contexts/AuthContext'; // Ensure correct import
import ValidateResult from './ValidateResult';

// Utility function to render with a mocked AuthContext
const renderWithAuthContext = (ui, { token = null } = {}) => {
  return render(
    <AuthContext.Provider value={{ token, user: null, login: jest.fn(), logout: jest.fn() }}>
      {ui}
    </AuthContext.Provider>
  );
};

// Mock fetch globally
const mockFetch = (response, isError = false) => {
  global.fetch = jest.fn(() =>
    isError
      ? Promise.reject(new Error(response)) // Simulate a network error
      : Promise.resolve({
          ok: response.ok,
          json: () => Promise.resolve(response.data),
        })
  );
};

describe('ValidateResult Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the validation form', () => {
    renderWithAuthContext(<ValidateResult />);
    expect(screen.getByText(/Validate Lichess Game Result/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter Lichess Game ID/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Validate Result/i })).toBeInTheDocument();
  });

  test('handles successful game result validation', async () => {
    const mockResult = {
      outcome: 'white_win',
      whitePlayer: 'player1',
      blackPlayer: 'player2',
      status: 'valid',
      message: 'Game result validated successfully.',
    };

    mockFetch({ ok: true, data: mockResult });

    renderWithAuthContext(<ValidateResult />, { token: 'valid-admin-token' });
    fireEvent.change(screen.getByPlaceholderText(/Enter Lichess Game ID/i), {
      target: { value: 'gameId123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Validate Result/i }));

    await waitFor(() => {
      expect(screen.getByText(/Game result processed successfully./i)).toBeInTheDocument();
      expect(screen.getByText(/Outcome: white_win/i)).toBeInTheDocument();
      expect(screen.getByText(/White Player: player1/i)).toBeInTheDocument();
      expect(screen.getByText(/Black Player: player2/i)).toBeInTheDocument();
      expect(screen.getByText(/Status: valid/i)).toBeInTheDocument();
      expect(screen.getByText(/Message: Game result validated successfully./i)).toBeInTheDocument();
    });
  });

  test('handles validation error gracefully', async () => {
    mockFetch({ ok: false, data: { error: 'Invalid game ID' } });

    renderWithAuthContext(<ValidateResult />, { token: 'valid-admin-token' });
    fireEvent.change(screen.getByPlaceholderText(/Enter Lichess Game ID/i), {
      target: { value: 'invalidGameId' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Validate Result/i }));

    await waitFor(() => {
      expect(screen.getByText(/Error: Invalid game ID/i)).toBeInTheDocument();
    });
  });

  test('shows error when no token is present', () => {
    renderWithAuthContext(<ValidateResult />); // No token passed
    fireEvent.click(screen.getByRole('button', { name: /Validate Result/i }));
    expect(screen.getByText(/Please login as admin first./i)).toBeInTheDocument();
  });

  test('handles unexpected API error gracefully', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error

    mockFetch('Network error', true);

    renderWithAuthContext(<ValidateResult />, { token: 'valid-admin-token' });
    fireEvent.change(screen.getByPlaceholderText(/Enter Lichess Game ID/i), {
      target: { value: 'gameId123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Validate Result/i }));

    await waitFor(() => {
      expect(screen.getByText(/An unexpected error occurred./i)).toBeInTheDocument();
    });

    consoleErrorSpy.mockRestore(); // Restore original console.error behavior
  });
});

